'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, getDoc, limit } from 'firebase/firestore';
import { logActivityAction, logErrorAction } from './log-actions';
import { sendEmailDirect } from '@/lib/mail-sender';
import { ai } from '@/ai/genkit';

// 1. Fetch user ATS attempts/credits
export async function getAtsUserAttemptsAction(email: string) {
  try {
    const q = query(collection(db, 'atsAttempts'), where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Create new record with 1 free attempt
      const newRecord = {
        email,
        allowedCount: 1, // First attempt is free
        usedCount: 0,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'atsAttempts'), newRecord);
      return { success: true, id: docRef.id, allowedCount: 1, usedCount: 0 };
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    return { 
      success: true, 
      id: docSnap.id, 
      allowedCount: data.allowedCount ?? 1, 
      usedCount: data.usedCount ?? 0 
    };
  } catch (error: any) {
    console.error('Error fetching ATS attempts:', error);
    await logErrorAction('Failed to fetch/initialize ATS attempts', error.message, undefined, email);
    return { success: false, error: error.message };
  }
}

// 2. Submit payment reference (UTR)
export async function createAtsPaymentAction(email: string, utr: string) {
  try {
    const cleanUtr = utr.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      return { success: false, error: 'Invalid UTR format. Must be exactly 12 numeric digits.' };
    }

    // Check if UTR already exists to prevent duplicate submissions
    const duplicateQ = query(collection(db, 'atsPayments'), where('utr', '==', cleanUtr), limit(1));
    const duplicateSnap = await getDocs(duplicateQ);
    if (!duplicateSnap.empty) {
      return { success: false, error: 'This transaction Reference/UTR number has already been submitted.' };
    }

    const paymentRecord = {
      email,
      utr: cleanUtr,
      amount: 149,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'atsPayments'), paymentRecord);

    await logActivityAction(
      `ATS Payment Reference Submitted`,
      `Payment UTR #${cleanUtr} submitted for verification by ${email}`,
      undefined,
      undefined,
      email
    );

    // Email to Admin
    const adminSubject = `[Payment Verification Required] ATS Resume Analyzer`;
    const adminHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); height: 8px;"></div>
        <div style="padding: 25px;">
          <h2 style="color: #222; font-size: 20px; font-weight: 700; margin-bottom: 15px;">Payment UTR Review Required</h2>
          <p>Hi Admin,</p>
          <p>A student has submitted a UPI payment reference for verification. Details below:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Email:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${email}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">UTR Txn ID:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><code>${cleanUtr}</code></td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Amount:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">₹149.00</td></tr>
          </table>
          <p style="font-size: 13px; color: #666;">You can verify and approve this transaction in the Operations Dashboard.</p>
        </div>
      </div>
    `;
    await sendEmailDirect('vinaysiddha19@gmail.com', adminSubject, adminHtml);

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error submitting ATS payment:', error);
    await logErrorAction('Failed to register UTR payment reference', error.message, undefined, email);
    return { success: false, error: error.message };
  }
}

// 3. Admin verification (Approve/Reject)
export async function verifyAtsPaymentAction(paymentId: string, approve: boolean) {
  try {
    const docRef = doc(db, 'atsPayments', paymentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Payment record not found.' };
    }

    const payment = docSnap.data();
    const newStatus = approve ? 'approved' : 'rejected';
    await updateDoc(docRef, { status: newStatus, resolvedAt: new Date().toISOString() });

    if (approve) {
      // Increment user's ATS allowed attempts
      const userEmail = payment.email;
      const q = query(collection(db, 'atsAttempts'), where('email', '==', userEmail), limit(1));
      const attemptsSnap = await getDocs(q);

      if (!attemptsSnap.empty) {
        const attemptDoc = attemptsSnap.docs[0];
        const currentAllowed = attemptDoc.data().allowedCount ?? 1;
        await updateDoc(doc(db, 'atsAttempts', attemptDoc.id), {
          allowedCount: currentAllowed + 1
        });
      } else {
        await addDoc(collection(db, 'atsAttempts'), {
          email: userEmail,
          allowedCount: 2, // 1 free + 1 purchased
          usedCount: 0,
          createdAt: new Date().toISOString(),
        });
      }

      // Send approval email
      const subject = `Payment Approved - ATS Resume Credits Unlocked`;
      const html = `
        <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); height: 8px;"></div>
          <div style="padding: 25px; background: white;">
            <h2 style="color: #222; font-size: 20px; font-weight: 700; margin-bottom: 15px;">Payment Verified Successfully</h2>
            <p>Hi,</p>
            <p>We verified your payment UTR: <strong>${payment.utr}</strong>. A new ATS Resume evaluation attempt has been credited to your account.</p>
            <p>You can now navigate back to the ATS Analyzer page to screen your resume.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>MLSC Tech Team</strong></p>
          </div>
        </div>
      `;
      await sendEmailDirect(payment.email, subject, html);

      await logActivityAction(
        `ATS Payment Approved`,
        `Payment UTR #${payment.utr} approved. Credits unlocked for ${payment.email}`
      );
    } else {
      // Send rejection email
      const subject = `Payment Rejected - UTR Verification Failed`;
      const html = `
        <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); height: 8px;"></div>
          <div style="padding: 25px; background: white;">
            <h2 style="color: #222; font-size: 20px; font-weight: 700; margin-bottom: 15px;">Payment Verification Failed</h2>
            <p>Hi,</p>
            <p>We could not verify the transaction reference / UTR number (<code>${payment.utr}</code>) submitted for your account.</p>
            <p>Please double-check your bank receipt or submit a valid reference number. Contact technical support if you believe this is an error.</p>
          </div>
        </div>
      `;
      await sendEmailDirect(payment.email, subject, html);

      await logActivityAction(
        `ATS Payment Rejected`,
        `Payment UTR #${payment.utr} rejected for ${payment.email}`
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error verifying ATS payment:', error);
    await logErrorAction(`Failed to verify payment #${paymentId}`, error.message);
    return { success: false, error: error.message };
  }
}

// 4. Run deep ATS Resume Analysis using Gemini
export async function runAtsAnalysisAction(
  email: string,
  resumeText: string,
  jobDescription: string,
  companyName: string,
  userDisplayName: string
) {
  try {
    // A. Check credits
    const q = query(collection(db, 'atsAttempts'), where('email', '==', email), limit(1));
    const attemptsSnap = await getDocs(q);

    if (attemptsSnap.empty) {
      return { success: false, error: 'Attempts log missing. Click analyze to initialize.' };
    }

    const attemptDoc = attemptsSnap.docs[0];
    const attemptData = attemptDoc.data();
    const allowed = attemptData.allowedCount ?? 1;
    const used = attemptData.usedCount ?? 0;

    if (used >= allowed) {
      return { success: false, error: 'Insufficient credits. Please verify your payment reference.' };
    }

    // B. Register the request in database
    const requestRecord = {
      email,
      companyName,
      createdAt: new Date().toISOString(),
      status: 'running'
    };
    const reqRef = await addDoc(collection(db, 'atsRequests'), requestRecord);

    // C. Execute the multi-stage Gemini prompt
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API Key configuration is missing on the server.");
    }

    const systemPrompt = `You are a professional ATS (Applicant Tracking System) parser and technical hiring director.
    Evaluate the candidate's resume against the Job Description (JD) and company guidelines for: ${companyName}.
    
    Job Description:
    ${jobDescription}
    
    Candidate's Resume Content:
    ${resumeText}
    
    Perform a complex multi-stage evaluation and return a response in HTML format.
    Return a beautiful dark-themed container (styled with inlined CSS compatible with standard email clients) containing:
    1. Overall ATS Fit Score (out of 100).
    2. KEYWORD GAP ANALYSIS: List the critical skills, frameworks, and methodologies from the Job Description that are MISSING in the candidate's resume.
    3. PHRASE OPTIMIZATION: Show weak verbs or passive lines in the resume, and provide the exact strong active bullet points to replace them with.
    4. RE-DESIGN/RE-STRUCTURE suggestions: Advise on how to group or order their projects/experience specifically tailored to this company and role.
    5. COPY-PASTE INTEGRATION SUGGESTIONS: Write 3-4 specific high-impact bullet points containing the missing keywords that the candidate can copy and paste directly into their projects/experience sections.
    
    Ensure styling has high aesthetic parameters (sleek borders, clean padding, readable font sizes).
    Do NOT wrap the output in markdown code blocks like \`\`\`html or \`\`\`. Output raw HTML.`;

    const aiRes = await ai.generate({
      prompt: systemPrompt
    });

    const feedbackHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #eaeaea; background-color: #0c0c0c; padding: 35px; border-radius: 16px; max-width: 650px; margin: auto; border: 1px solid #222; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
        <div style="text-align: center; border-b: 1px solid #222; padding-bottom: 20px; margin-bottom: 25px;">
          <h1 style="color: #4285F4; font-size: 26px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1px;">ATS Resume Analysis</h1>
          <p style="color: #888; font-size: 11px; margin: 5px 0 0; text-transform: uppercase; tracking-wider;">Target: ${companyName}</p>
        </div>
        
        <p>Hi ${userDisplayName},</p>
        <p>Our operational container processed your resume against the Job Description. Here is your full optimization report:</p>
        
        ${aiRes.text}
        
        <div style="margin-top: 35px; border-top: 1px solid #222; padding-top: 20px; font-size: 11px; color: #555; text-align: center;">
          <p>Generated by the MLSC SVEC ATS Optimizer Sandbox using Gemini 2.0 Flash.</p>
          <p>Please update your resume based on these recommendations and resubmit to jobs.</p>
        </div>
      </div>
    `;

    // D. Send report to user's email
    await sendEmailDirect(email, `ATS Resume Evaluation Report - Target: ${companyName}`, feedbackHtml);

    // E. Update request status to completed
    await updateDoc(doc(db, 'atsRequests', reqRef.id), {
      status: 'completed',
      feedbackHtml,
      completedAt: new Date().toISOString()
    });

    // F. Increment used attempts
    await updateDoc(doc(db, 'atsAttempts', attemptDoc.id), {
      usedCount: used + 1
    });

    await logActivityAction(
      'ATS Resume Analysis Completed',
      `ATS analysis successfully compiled and emailed to ${email} for Target: ${companyName}`
    );

    return { success: true, feedbackHtml };

  } catch (error: any) {
    console.error('Error during ATS analysis:', error);
    await logErrorAction('ATS Resume Analysis pipeline crashed', error.message, undefined, email);
    return { success: false, error: error.message };
  }
}
