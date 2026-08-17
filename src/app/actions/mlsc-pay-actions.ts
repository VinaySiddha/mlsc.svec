'use server';

import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where, orderBy, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendEmail } from '@/lib/email';
import { donationReceiptEmailTemplate } from '@/lib/email-templates/donation-receipt';
import { eventRegistrationConfirmationTemplate } from '@/lib/email-templates/event-registration-confirmation';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID?.replace(/^["']|["']$/g, '').trim();
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY?.replace(/^["']|["']$/g, '').trim();

const CASHFREE_MODE = CASHFREE_SECRET_KEY?.startsWith('cfsk_ma_prod_')
  ? 'production'
  : (process.env.NEXT_PUBLIC_CASHFREE_MODE?.replace(/^["']|["']$/g, '').trim() || 'sandbox');

const API_BASE = CASHFREE_MODE === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

/**
 * Retrieves the active payment gateway configuration from Firestore.
 * Fallback to default if no configuration exists.
 */
export async function getGatewaySettingsAction() {
  try {
    const settingsRef = doc(db, 'settings', 'payment_gateways');
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      return { success: true, settings: settingsSnap.data() };
    }

    // Default Settings
    const defaultSettings = {
      cashfree: { enabled: true, message: 'Secure Online Payments' },
      mlscPay: { enabled: false, message: 'Manual UPI / QR Transfer' }
    };

    // Save default settings
    await setDoc(settingsRef, defaultSettings);
    return { success: true, settings: defaultSettings };
  } catch (error: any) {
    console.error('Error fetching gateway settings:', error);
    return {
      success: true,
      settings: {
        cashfree: { enabled: true, message: 'Secure Online Payments' },
        mlscPay: { enabled: false, message: 'Manual UPI / QR Transfer' }
      }
    };
  }
}

/**
 * Updates the active payment gateway configuration in Firestore.
 */
export async function updateGatewaySettingsAction(settings: {
  cashfree: { enabled: boolean; message: string };
  mlscPay: { enabled: boolean; message: string };
}) {
  try {
    const settingsRef = doc(db, 'settings', 'payment_gateways');
    await setDoc(settingsRef, settings);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating gateway settings:', error);
    return { success: false, error: error.message || 'Failed to update settings.' };
  }
}

export interface InitiatePaymentData {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  purpose: string;
  originUrl: string;
  type?: 'donation' | 'event';
  eventId?: string;
  registrationData?: any;
}

/**
 * Initiates an online payment via Cashfree if enabled.
 */
export async function initiateMLSCPaymentAction(data: InitiatePaymentData) {
  try {
    const { amount, customerName, customerEmail, customerPhone, purpose, originUrl, type, eventId, registrationData } = data;

    if (amount <= 0) {
      return { success: false, error: 'Invalid payment amount. Must be greater than 0.' };
    }

    // Check if Cashfree is enabled in settings
    const settingsRes = await getGatewaySettingsAction();
    if (!settingsRes.settings.cashfree.enabled) {
      return { success: false, error: 'Online payments are temporarily paused. Please use MLSC Pay.' };
    }

    const orderId = `mlsc_pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    let cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) cleanPhone = '9999999999';
    else if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);

    // Check if Cashfree API keys are configured
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      return { success: false, error: 'Online payment gateway is not configured.' };
    }

    let returnUrl = `${originUrl}/mlsc-pay/status?order_id={order_id}`;
    if (CASHFREE_MODE === 'production' && returnUrl.startsWith('http://')) {
      returnUrl = returnUrl.replace(/^http:\/\/localhost:\d+/, 'https://mlscsvec.com').replace(/^http:\/\//, 'https://');
    }

    // Call Real Cashfree PG API
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerEmail.replace(/[^a-zA-Z0-9]/g, '_'),
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: cleanPhone,
        },
        order_meta: {
          return_url: returnUrl,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || `Cashfree PG error: status ${response.status}` 
      };
    }

    const orderData = await response.json();

    const paymentRecord = {
      orderId,
      amount,
      currency: 'INR',
      customerName,
      customerEmail,
      customerPhone: cleanPhone,
      purpose,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMock: false,
      cfOrderId: orderData.cf_order_id,
      type: type || 'donation',
      eventId: eventId || null,
      registrationData: registrationData || null
    };

    await setDoc(doc(db, 'mlsc_payments', orderId), paymentRecord);

    return {
      success: true,
      orderId,
      amount,
      isMock: false,
      paymentSessionId: orderData.payment_session_id,
      mode: CASHFREE_MODE
    };
  } catch (error: any) {
    console.error('Error initiating MLSC Payment:', error);
    return { success: false, error: error.message || 'Internal server error.' };
  }
}

/**
 * Submits a manual payment via MLSC Pay (Offline Bank/UPI Transfer).
 * Automatically marks the transaction as PENDING_APPROVAL.
 */
export async function submitMLSCManualPaymentAction(data: {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  purpose: string;
  utr: string; // Transaction reference / UPI Ref
  type: 'donation' | 'event';
  eventId?: string;
  registrationData?: any;
}) {
  try {
    const { amount, customerName, customerEmail, customerPhone, purpose, utr, type, eventId, registrationData } = data;

    // Check if MLSC Pay is enabled in settings
    const settingsRes = await getGatewaySettingsAction();
    if (!settingsRes.settings.mlscPay.enabled) {
      return { success: false, error: 'Manual UPI payments are currently disabled. Please use Online Payment.' };
    }

    if (amount <= 0) {
      return { success: false, error: 'Invalid payment amount.' };
    }

    if (!utr || utr.trim().length < 6) {
      return { success: false, error: 'Please enter a valid Transaction Ref / UTR number.' };
    }

    const orderId = `mlsc_manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const paymentRecord = {
      orderId,
      amount,
      currency: 'INR',
      customerName,
      customerEmail,
      customerPhone,
      purpose,
      status: 'PENDING_APPROVAL',
      paymentMethod: 'mlsc_pay',
      utr: utr.trim(),
      type,
      eventId: eventId || null,
      registrationData: registrationData || null,
      createdAt: now,
      updatedAt: now,
      isMock: false
    };

    // Save record in Firestore
    await setDoc(doc(db, 'mlsc_payments', orderId), paymentRecord);

    // 2. Send "Payment Submitted - Awaiting Verification" email to customer
    try {
      const emailSubject = `Payment Submission Received - Pending Verification [${orderId}]`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
          <h2 style="color: #4f46e5; text-transform: uppercase;">Payment Submission Received</h2>
          <p>Dear ${customerName},</p>
          <p>We have received your manual payment submission via <strong>MLSC Pay</strong>. Your transaction is currently awaiting verification by our administrative officers.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 8px 0; font-weight: bold;">Order ID:</td><td style="padding: 8px 0; font-mono;">${orderId}</td></tr>
            <tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 8px 0; font-weight: bold;">Transaction Reference / UTR:</td><td style="padding: 8px 0; font-mono;">${utr}</td></tr>
            <tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 8px 0; font-weight: bold;">Purpose:</td><td style="padding: 8px 0;">${purpose}</td></tr>
            <tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 8px 0; font-weight: bold;">Amount Paid:</td><td style="padding: 8px 0; font-weight: bold; color: #b45309;">₹${amount}.00</td></tr>
            <tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 8px 0; font-weight: bold;">Status:</td><td style="padding: 8px 0; color: #d97706; font-weight: bold;">AWAITING ADMIN APPROVAL</td></tr>
          </table>
          
          <p style="font-size: 13px; color: #666666;">Once our accounts team confirms the credit in our bank statement, your transaction will be approved, and you will receive a secondary confirmation email along with your downloadable PDF receipt and ticket.</p>
          <p style="margin-top: 30px; font-weight: bold;">Microsoft Learn Student Club SVEC</p>
        </div>
      `;

      await sendEmail({
        to: customerEmail,
        subject: emailSubject,
        html: emailHtml
      });
    } catch (emailErr) {
      console.error('Failed to send pending payment email:', emailErr);
    }

    return {
      success: true,
      orderId,
      amount,
      status: 'PENDING_APPROVAL'
    };
  } catch (error: any) {
    console.error('Error submitting manual payment:', error);
    return { success: false, error: error.message || 'Internal server error.' };
  }
}

/**
 * Approves a pending manual payment.
 * Converts status to PAID, registers user for events (if applicable), and sends email receipt/ticket.
 */
export async function approveMLSCPaymentAction(orderId: string) {
  try {
    const paymentRef = doc(db, 'mlsc_payments', orderId);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return { success: false, error: 'Payment record not found.' };
    }

    const paymentData = paymentSnap.data();

    if (paymentData.status !== 'PENDING_APPROVAL' && paymentData.status !== 'PENDING') {
      return { success: false, error: `Only pending transactions can be approved. Current status: ${paymentData.status}` };
    }

    const transactionId = `txn_manual_${Date.now()}`;
    const now = new Date().toISOString();

    // 2. Complete event registration if it was an event payment
    if (paymentData.type === 'event' && paymentData.eventId && paymentData.registrationData) {
      const eventId = paymentData.eventId;
      const registrationData = paymentData.registrationData;
      
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      const eventTitle = eventSnap.exists() ? eventSnap.data().title : 'MLSC Event';

      // Write registration record under event subcollection
      const regCol = collection(db, 'events', eventId, 'registrations');
      await addDoc(regCol, {
        ...registrationData,
        registeredAt: now,
        orderId,
        paymentStatus: 'PAID',
        amountPaid: paymentData.amount
      });

      // Write user profile record
      if (paymentData.userId) {
        const userEventRef = doc(db, 'users', paymentData.userId, 'registeredEvents', eventId);
        await setDoc(userEventRef, {
          eventId,
          eventTitle,
          eventDate: eventSnap.exists() ? (eventSnap.data().date?.toDate?.()?.toISOString() || new Date().toISOString()) : new Date().toISOString(),
          registeredAt: now,
          amountPaid: paymentData.amount
        });
      }

      // Send event ticket email
      const { subject, html } = eventRegistrationConfirmationTemplate({
        customerName: registrationData.name,
        eventTitle,
        amount: paymentData.amount,
        orderId,
        date: eventSnap.exists() ? (eventSnap.data().date?.toDate?.()?.toLocaleDateString('en-IN') || new Date().toLocaleDateString()) : new Date().toLocaleDateString(),
        venue: eventSnap.exists() ? (eventSnap.data().venue || 'SVEC Campus') : 'SVEC Campus',
        time: eventSnap.exists() ? (eventSnap.data().time || '10:00 AM') : '10:00 AM'
      });

      await sendEmail({
        to: paymentData.customerEmail,
        subject,
        html
      }).catch(err => console.error('Failed to send manual event confirmation email:', err));
    }

    // 3. Send donation receipt if it was a donation
    if (paymentData.type === 'donation' || !paymentData.type) {
      const { subject, html } = donationReceiptEmailTemplate({
        customerName: paymentData.customerName,
        amount: paymentData.amount,
        orderId,
        purpose: paymentData.purpose,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      });

      await sendEmail({
        to: paymentData.customerEmail,
        subject,
        html
      }).catch(err => console.error('Failed to send manual donation receipt email:', err));
    }

    // 4. Update status in Firestore
    const updateData = {
      status: 'PAID',
      transactionId,
      paymentDetails: {
        processedAt: now,
        utr: paymentData.utr || 'N/A'
      },
      updatedAt: now,
    };

    await updateDoc(paymentRef, updateData);

    return { success: true, transactionId };
  } catch (error: any) {
    console.error('Error approving manual payment:', error);
    return { success: false, error: error.message || 'Internal server error.' };
  }
}

/**
 * Rejects a pending manual payment.
 */
export async function rejectMLSCPaymentAction(orderId: string, reason: string) {
  try {
    const paymentRef = doc(db, 'mlsc_payments', orderId);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return { success: false, error: 'Payment record not found.' };
    }

    const paymentData = paymentSnap.data();

    if (paymentData.status !== 'PENDING_APPROVAL') {
      return { success: false, error: `Only pending approvals can be rejected. Current status: ${paymentData.status}` };
    }

    const now = new Date().toISOString();

    const updateData = {
      status: 'FAILED',
      rejectionReason: reason || 'UTR reference number could not be matched with any bank statement credits.',
      updatedAt: now,
    };

    await updateDoc(paymentRef, updateData);

    // Send Rejection Email
    try {
      const emailSubject = `Payment Verification Failed - Action Required [${orderId}]`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fdf2f2;">
          <h2 style="color: #ef4444; text-transform: uppercase;">Payment Verification Failed</h2>
          <p>Dear ${paymentData.customerName},</p>
          <p>We are writing to inform you that our accounts team was <strong>unable to verify</strong> your manual payment submission for Order ID: <strong>${orderId}</strong>.</p>
          
          <p style="font-weight: bold; color: #7f1d1d; margin: 15px 0;">Reason for Rejection: ${updateData.rejectionReason}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; background: #ffffff; padding: 10px; border-radius: 8px;">
            <tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 8px; font-weight: bold;">Order ID:</td><td style="padding: 8px; font-mono;">${orderId}</td></tr>
            <tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 8px; font-weight: bold;">Submitted Reference / UTR:</td><td style="padding: 8px; font-mono;">${paymentData.utr}</td></tr>
            <tr style="border-bottom: 1px solid #eeeeee;"><td style="padding: 8px; font-weight: bold;">Amount:</td><td style="padding: 8px; font-weight: bold;">₹${paymentData.amount}.00</td></tr>
          </table>
          
          <p style="font-size: 13px; color: #555555;">Please re-check your bank transaction reference number and re-submit your payment request, or contact our support team at <a href="mailto:vinaysiddha19@gmail.com">vinaysiddha19@gmail.com</a> if you believe this is an error.</p>
          <p style="margin-top: 30px; font-weight: bold;">Microsoft Learn Student Club SVEC</p>
        </div>
      `;

      await sendEmail({
        to: paymentData.customerEmail,
        subject: emailSubject,
        html: emailHtml
      });
    } catch (emailErr) {
      console.error('Failed to send rejection email:', emailErr);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting manual payment:', error);
    return { success: false, error: error.message || 'Internal server error.' };
  }
}

/**
 * Verifies the payment status of an MLSC Payment (mock or real Cashfree).
 */
export async function verifyMLSCPaymentAction(orderId: string) {
  try {
    const paymentRef = doc(db, 'mlsc_payments', orderId);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return { success: false, error: 'Payment record not found.' };
    }

    const paymentData = paymentSnap.data();

    // If it's still pending and not manual, call Cashfree API to verify
    if (paymentData.status === 'PENDING' && paymentData.paymentMethod !== 'mlsc_pay') {
      if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
        return { success: false, error: 'Cashfree credentials not configured.' };
      }

      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
        },
      });

      if (!response.ok) {
        return { success: false, error: `Failed to fetch Cashfree order status: ${response.status}` };
      }

      const orderData = await response.json();
      const cfStatus = orderData.order_status; // PAID, ACTIVE, FAILED, etc.

      let newStatus = 'PENDING';
      if (cfStatus === 'PAID') {
        newStatus = 'PAID';
      } else if (cfStatus === 'ACTIVE') {
        newStatus = 'PENDING';
      } else {
        newStatus = 'FAILED';
      }

      if (newStatus !== 'PENDING') {
        const now = new Date().toISOString();
        
        // Update database status
        await updateDoc(paymentRef, {
          status: newStatus,
          cfStatusData: orderData,
          updatedAt: now
        });

        // Update local memory value to return correct status
        paymentData.status = newStatus;
        paymentData.cfStatusData = orderData;
        paymentData.updatedAt = now;

        // Perform post-payment logic if it transitioned to PAID
        if (newStatus === 'PAID') {
          if (paymentData.type === 'event' && paymentData.eventId && paymentData.registrationData) {
            const eventId = paymentData.eventId;
            const registrationData = paymentData.registrationData;
            const amount = paymentData.amount;
            
            const eventRef = doc(db, 'events', eventId);
            const eventSnap = await getDoc(eventRef);
            const eventData = eventSnap.exists() ? eventSnap.data() : { title: 'MLSC Event', venue: 'SVEC Campus', time: '10:00 AM', date: new Date() };
            const eventTitle = eventData.title;

            const regCol = collection(db, 'events', eventId, 'registrations');
            const dupQ = query(regCol, where('email', '==', registrationData.email));
            const dupSnap = await getDocs(dupQ);

            if (dupSnap.empty) {
              const finalRegData = {
                ...registrationData,
                registeredAt: now,
                orderId,
                paymentStatus: 'PAID',
                amountPaid: amount
              };

              await addDoc(regCol, finalRegData);

              // Send event confirmation email
              const eventDateStr = eventData.date instanceof Date 
                ? eventData.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                : (eventData.date?.toDate?.()?.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) || new Date().toLocaleDateString());

              const { subject, html } = eventRegistrationConfirmationTemplate({
                customerName: registrationData.name,
                eventTitle,
                amount,
                orderId,
                date: eventDateStr,
                venue: eventData.venue || 'SVEC Campus',
                time: eventData.time || '10:00 AM',
                eventLink: eventData.eventLink || undefined
              });

              await sendEmail({
                to: registrationData.email,
                subject,
                html
              }).catch(err => console.error('Failed to send event confirmation email:', err));
            }
          } else if (paymentData.type === 'donation' || !paymentData.type) {
            const { subject, html } = donationReceiptEmailTemplate({
              customerName: paymentData.customerName,
              amount: paymentData.amount,
              orderId: orderId,
              purpose: paymentData.purpose || 'General Donation',
              date: new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })
            });

            await sendEmail({
              to: paymentData.customerEmail,
              subject,
              html
            }).catch(err => console.error('Failed to send donation receipt email:', err));
          }
        }
      }
    }

    // Return current record (covers PAID, REFUNDED, FAILED, and PENDING_APPROVAL!)
    return {
      success: true,
      status: paymentData.status,
      payment: paymentData
    };
  } catch (error: any) {
    console.error('Error verifying payment action:', error);
    return { success: false, error: error.message || 'Internal server error.' };
  }
}

/**
 * Fetches the transaction history, optionally filtered by customer email.
 */
export async function getMLSCPaymentsAction(email?: string) {
  try {
    const paymentsCol = collection(db, 'mlsc_payments');
    let q;

    if (email) {
      q = query(
        paymentsCol,
        where('customerEmail', '==', email),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(paymentsCol, orderBy('createdAt', 'desc'));
    }

    const snap = await getDocs(q);
    const payments: any[] = [];
    snap.forEach((doc) => {
      payments.push(doc.data());
    });

    return { success: true, payments };
  } catch (error: any) {
    console.error('Error fetching MLSC Payments:', error);
    try {
      console.log('Falling back to client-side filtering for payments...');
      const snap = await getDocs(collection(db, 'mlsc_payments'));
      const payments: any[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (!email || data.customerEmail === email) {
          payments.push(data);
        }
      });
      payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { success: true, payments };
    } catch (fallbackError: any) {
      return { success: false, error: fallbackError.message || 'Failed to retrieve payments.' };
    }
  }
}

/**
 * Refunds a processed MLSC Payment.
 */
export async function refundMLSCPaymentAction(orderId: string) {
  try {
    const paymentRef = doc(db, 'mlsc_payments', orderId);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return { success: false, error: 'Payment record not found.' };
    }

    const paymentData = paymentSnap.data();

    if (paymentData.status !== 'PAID') {
      return { success: false, error: `Only PAID transactions can be refunded. Current status: ${paymentData.status}` };
    }

    const refundId = `ref_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const now = new Date().toISOString();

    const updateData = {
      status: 'REFUNDED',
      refundDetails: {
        refundId,
        refundedAt: now
      },
      updatedAt: now,
    };

    await updateDoc(paymentRef, updateData);

    return {
      success: true,
      payment: {
        ...paymentData,
        ...updateData,
      }
    };
  } catch (error: any) {
    console.error('Error refunding MLSC Payment:', error);
    return { success: false, error: error.message || 'Internal server error.' };
  }
}
