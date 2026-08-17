'use server';

import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where, addDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendEmail } from '@/lib/email';
import { donationReceiptEmailTemplate } from '@/lib/email-templates/donation-receipt';
import { eventRegistrationConfirmationTemplate } from '@/lib/email-templates/event-registration-confirmation';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID?.replace(/^["']|["']$/g, '').trim();
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY?.replace(/^["']|["']$/g, '').trim();

// Auto-detect environment based on the secret key prefix, fallback to NEXT_PUBLIC_CASHFREE_MODE
const CASHFREE_MODE = CASHFREE_SECRET_KEY?.startsWith('cfsk_ma_prod_')
  ? 'production'
  : (process.env.NEXT_PUBLIC_CASHFREE_MODE?.replace(/^["']|["']$/g, '').trim() || 'sandbox');

const API_BASE = CASHFREE_MODE === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

export async function createCashfreeOrderAction(data: {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  originUrl: string;
  purpose?: string;
}) {
  try {
    const { amount, customerName, customerEmail, customerPhone, originUrl, purpose } = data;

    // Validate amount
    if (amount <= 0) {
      return { success: false, error: 'Invalid donation amount.' };
    }

    // Clean phone number (must be 10 digits for Cashfree in India)
    let cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      // If empty or invalid, fallback to a mock valid phone number to prevent Cashfree validation error
      cleanPhone = '9999999999';
    } else if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }

    const orderId = `order_mlsc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Check if Cashfree API keys are configured
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      return { success: false, error: 'Online payment gateway is not configured.' };
    }

    console.log('Cashfree API Call Config:', {
      mode: CASHFREE_MODE,
      apiBase: API_BASE,
      appIdLength: CASHFREE_APP_ID?.length,
      appIdStart: CASHFREE_APP_ID?.substring(0, 4) + '...',
      secretKeyLength: CASHFREE_SECRET_KEY?.length,
      secretKeyStart: CASHFREE_SECRET_KEY?.substring(0, 12) + '...',
    });

    let returnUrl = `${originUrl}/donate/status?order_id={order_id}`;
    if (CASHFREE_MODE === 'production' && returnUrl.startsWith('http://')) {
      returnUrl = returnUrl.replace(/^http:\/\/localhost:\d+/, 'https://mlscsvec.com').replace(/^http:\/\//, 'https://');
    }

    // Call real Cashfree PG API
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
      console.error('Cashfree API error details:', errorData);
      return { 
        success: false, 
        error: errorData.message || `Cashfree API returned status ${response.status}` 
      };
    }

    const orderData = await response.json();
    
    // Save pending donation in Firestore
    await setDoc(doc(db, 'donations', orderId), {
      orderId,
      amount,
      currency: 'INR',
      customerName,
      customerEmail,
      customerPhone: cleanPhone,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      cfOrderId: orderData.cf_order_id,
      isMock: false,
      purpose: purpose || null,
    });

    return {
      success: true,
      isMock: false,
      orderId,
      paymentSessionId: orderData.payment_session_id,
      mode: CASHFREE_MODE,
    };
  } catch (error: any) {
    console.error('Error creating Cashfree order:', error);
    return { success: false, error: error.message || 'Internal server error.' };
  }
}

export async function verifyCashfreeOrderAction(orderId: string) {
  try {
    if (orderId.startsWith('order_event_')) {
      return await verifyEventRegistrationPaymentAction(orderId);
    }

    const donationRef = doc(db, 'donations', orderId);
    const donationSnap = await getDoc(donationRef);

    if (!donationSnap.exists()) {
      return { success: false, error: 'Donation record not found.' };
    }

    const donationData = donationSnap.data();

    // If it's a mock donation, auto-approve it for demo/sandbox testing
    if (donationData.isMock) {
      const isAlreadyPaid = donationData.status === 'PAID';
      await updateDoc(donationRef, {
        status: 'PAID',
        updatedAt: new Date().toISOString(),
      });

      if (!isAlreadyPaid) {
        const { subject, html } = donationReceiptEmailTemplate({
          customerName: donationData.customerName,
          amount: donationData.amount,
          orderId: orderId,
          purpose: donationData.purpose,
          date: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })
        });

        await sendEmail({
          to: donationData.customerEmail,
          subject,
          html
        }).catch(err => console.error('Failed to send mock donation receipt email:', err));
      }

      return {
        success: true,
        status: 'PAID',
        amount: donationData.amount,
        customerName: donationData.customerName,
        customerEmail: donationData.customerEmail,
        isMock: true,
      };
    }

    // Call real Cashfree API to verify the order status
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
      return { success: false, error: `Failed to verify order: status ${response.status}` };
    }

    const orderData = await response.json();
    const cfStatus = orderData.order_status; // e.g., 'PAID', 'ACTIVE', 'FAILED'

    let status = 'PENDING';
    if (cfStatus === 'PAID') {
      status = 'PAID';
    } else if (cfStatus === 'ACTIVE') {
      status = 'PENDING';
    } else {
      status = 'FAILED';
    }

    const isAlreadyPaid = donationData.status === 'PAID';
    await updateDoc(donationRef, {
      status,
      updatedAt: new Date().toISOString(),
      cfStatusData: orderData,
    });

    if (!isAlreadyPaid && status === 'PAID') {
      const { subject, html } = donationReceiptEmailTemplate({
        customerName: donationData.customerName,
        amount: donationData.amount,
        orderId: orderId,
        purpose: donationData.purpose,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      });

      await sendEmail({
        to: donationData.customerEmail,
        subject,
        html
      }).catch(err => console.error('Failed to send donation receipt email:', err));
    }

    return {
      success: true,
      status,
      amount: donationData.amount,
      customerName: donationData.customerName,
      customerEmail: donationData.customerEmail,
      isMock: false,
    };
  } catch (error: any) {
    console.error('Error verifying Cashfree order:', error);
    return { success: false, error: error.message || 'Internal server error.' };
  }
}

export async function resendDonationInvoiceAction(donationId: string) {
  try {
    const donationRef = doc(db, 'donations', donationId);
    const donationSnap = await getDoc(donationRef);
    
    if (!donationSnap.exists()) {
      return { success: false, error: 'Donation record not found.' };
    }
    
    const donationData = donationSnap.data();
    
    const { subject, html } = donationReceiptEmailTemplate({
      customerName: donationData.customerName,
      amount: donationData.amount,
      orderId: donationId,
      date: donationData.createdAt 
        ? new Date(donationData.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })
        : new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })
    });
    
    await sendEmail({
      to: donationData.customerEmail,
      subject,
      html
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending donation invoice email:', error);
    return { success: false, error: error.message || 'Failed to send email.' };
  }
}

export async function createEventRegistrationOrderAction(data: {
  eventId: string;
  userId?: string;
  registrationData: any;
  originUrl: string;
}) {
  try {
    const { eventId, userId, registrationData, originUrl } = data;
    
    // 1. Fetch event from database
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists()) {
      return { success: false, error: 'Event not found.' };
    }
    const eventData = eventSnap.data();
    
    // 2. Perform validations
    if (!eventData.registrationOpen) {
      return { success: false, error: 'Registrations for this event are closed.' };
    }
    if (eventData.registrationDeadline) {
      const deadline = eventData.registrationDeadline.toDate ? eventData.registrationDeadline.toDate() : new Date(eventData.registrationDeadline);
      if (new Date() > deadline) {
        return { success: false, error: 'The registration deadline has passed.' };
      }
    }
    
    // Check registration limit
    if (eventData.registrationLimit && eventData.registrationLimit > 0) {
      const regCol = collection(db, 'events', eventId, 'registrations');
      const regCountSnap = await getCountFromServer(regCol);
      const regCount = regCountSnap.data().count;
      if (regCount >= eventData.registrationLimit) {
        return { success: false, error: 'Sorry, this event has reached its registration limit.' };
      }
    }
    
    // Check if already registered (by userId or email)
    if (userId) {
      const regCol = collection(db, 'events', eventId, 'registrations');
      const userQ = query(regCol, where('userId', '==', userId));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        return { success: false, error: 'You are already registered for this event.' };
      }
    }
    
    const regCol = collection(db, 'events', eventId, 'registrations');
    const emailQ = query(regCol, where('email', '==', registrationData.email));
    const emailSnap = await getDocs(emailQ);
    if (!emailSnap.empty) {
      return { success: false, error: 'This email is already registered for this event.' };
    }
    
    const amount = Number(eventData.registrationFee) || 0;
    if (amount <= 0) {
      return { success: false, error: 'Invalid registration fee. Use standard registration instead.' };
    }
    
    const orderId = `order_event_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Save pending registration in Firestore
    await setDoc(doc(db, 'pendingEventRegistrations', orderId), {
      orderId,
      eventId,
      userId: userId || null,
      registrationData,
      amount,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });
    
    // Create Cashfree order
    let cleanPhone = registrationData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) cleanPhone = '9999999999';
    else if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);
    
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      return { success: false, error: 'Online payment gateway is not configured.' };
    }
    
    let returnUrl = `${originUrl}/donate/status?order_id=${orderId}`;
    if (CASHFREE_MODE === 'production' && returnUrl.startsWith('http://')) {
      returnUrl = returnUrl.replace(/^http:\/\/localhost:\d+/, 'https://mlscsvec.com').replace(/^http:\/\//, 'https://');
    }
    
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
          customer_id: registrationData.email.replace(/[^a-zA-Z0-9]/g, '_'),
          customer_name: registrationData.name,
          customer_email: registrationData.email,
          customer_phone: cleanPhone,
        },
        order_meta: {
          return_url: returnUrl,
        },
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cashfree Event API error details:', errorData);
      return { 
        success: false, 
        error: errorData.message || `Cashfree API returned status ${response.status}` 
      };
    }
    
    const orderData = await response.json();
    
    return {
      success: true,
      isMock: false,
      orderId,
      paymentSessionId: orderData.payment_session_id,
      mode: CASHFREE_MODE,
    };
  } catch (error: any) {
    console.error('Error creating event registration order:', error);
    return { success: false, error: error.message || 'Internal server error.' };
  }
}

export async function verifyEventRegistrationPaymentAction(orderId: string) {
  try {
    const pendingRef = doc(db, 'pendingEventRegistrations', orderId);
    const pendingSnap = await getDoc(pendingRef);
    
    if (!pendingSnap.exists()) {
      return { success: false, error: 'Pending registration not found.' };
    }
    
    const pendingData = pendingSnap.data();
    const { eventId, userId, registrationData, amount, status: prevStatus } = pendingData;
    
    if (prevStatus === 'COMPLETED' || pendingData.status === 'COMPLETED') {
      return {
        success: true,
        status: 'PAID',
        type: 'event',
        amount,
        customerName: registrationData.name,
        customerEmail: registrationData.email,
        eventTitle: pendingData.eventTitle || 'Event',
        isMock: !!pendingData.isMock
      };
    }
    
    let verifiedPaid = false;
    let isMock = !!pendingData.isMock;
    
    if (pendingData.isMock) {
      verifiedPaid = true;
      isMock = true;
    } else {
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
      
      if (response.ok) {
        const orderData = await response.json();
        if (orderData.order_status === 'PAID') {
          verifiedPaid = true;
        }
      }
    }
    
    if (verifiedPaid) {
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
          ...(userId && { userId }),
          registeredAt: new Date().toISOString(),
          orderId,
          paymentStatus: 'PAID',
          amountPaid: amount
        };
        
        await addDoc(regCol, finalRegData);
        
        if (userId) {
          const userEventRef = doc(db, 'users', userId, 'registeredEvents', eventId);
          await setDoc(userEventRef, {
            eventId,
            eventTitle,
            eventDate: eventData.date instanceof Date ? eventData.date.toISOString() : (eventData.date?.toDate?.()?.toISOString() || new Date().toISOString()),
            registeredAt: new Date().toISOString(),
            amountPaid: amount
          });
        }
        
        // Send event confirmation email!
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
      
      await updateDoc(pendingRef, {
        status: 'COMPLETED',
        eventTitle,
        isMock,
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        status: 'PAID',
        type: 'event',
        amount,
        customerName: registrationData.name,
        customerEmail: registrationData.email,
        eventTitle,
        isMock
      };
    } else {
      await updateDoc(pendingRef, {
        status: 'FAILED',
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: false,
        status: 'FAILED',
        error: 'Payment verification failed.'
      };
    }
  } catch (error: any) {
    console.error('Error verifying event registration payment:', error);
    return { success: false, error: error.message || 'Internal server error.' };
  }
}
