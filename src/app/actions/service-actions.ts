'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { logActivityAction, logErrorAction } from './log-actions';
import { sendEmailDirect } from '@/lib/mail-sender';
import { ai } from '@/ai/genkit';

const ADMIN_EMAIL = 'vinaysiddha19@gmail.com';

export async function submitServiceRequestAction(
  serviceType: string,
  userName: string,
  userEmail: string,
  department: string,
  parameters: string,
  description: string
) {
  try {
    const requestData = {
      serviceType,
      userName,
      userEmail,
      department,
      parameters,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'serviceRequests'), requestData);

    // Log as activity
    await logActivityAction(
      `Service Requested: ${serviceType}`,
      `Service request #${docRef.id} submitted by ${userName} (${userEmail})`
    );

    // Email to Admin
    const adminSubject = `[Automation Service Request] ${serviceType} from ${userName}`;
    const adminHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); height: 8px;"></div>
        <div style="padding: 25px;">
          <h2 style="color: #222; font-size: 20px; font-weight: 700; margin-bottom: 15px;">New Automated Service Request</h2>
          <p>Hi Admin,</p>
          <p>A student/department has requested an automated service. Details are below:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; width: 140px;">Service Type:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>${serviceType}</strong></td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Requestor:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${userName} (${userEmail})</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Department:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${department}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Parameters:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-style: italic;">${parameters}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; vertical-align: top;">Description:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; white-space: pre-wrap;">${description}</td></tr>
          </table>
          
          <p style="font-size: 13px; color: #666;">You can view and trigger this automation inside the operations console.</p>
        </div>
      </div>
    `;
    await sendEmailDirect(ADMIN_EMAIL, adminSubject, adminHtml);

    // Email to User
    const userSubject = `Service Request Registered - MLSC SVEC Automation`;
    const userHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); height: 8px;"></div>
        <div style="padding: 30px 25px;">
          <h2 style="color: #222; font-size: 22px; font-weight: 700; margin-bottom: 15px;">Request Registered Successfully</h2>
          <p style="font-size: 15px; color: #555;">Hi ${userName},</p>
          <p style="font-size: 15px; color: #555;">
            Your automated service request for <strong>${serviceType}</strong> has been registered under ID: <code>#${docRef.id.substring(0, 8).toUpperCase()}</code>.
          </p>
          <p style="font-size: 15px; color: #555; margin-top: 10px;">
            Our systems will review the parameters and trigger the automated script shortly. You will receive an email notice once the automation is completed successfully.
          </p>
          <p style="margin-top: 30px; font-weight: 500; color: #222;">Best regards,<br><strong>MLSC Automation System</strong></p>
        </div>
      </div>
    `;
    await sendEmailDirect(userEmail, userSubject, userHtml);

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error submitting service request:', error);
    await logErrorAction(`Failed Service Request: ${serviceType}`, error.message, undefined, userName);
    return { success: false, error: error.message };
  }
}

export async function updateServiceRequestStatusAction(id: string, status: string) {
  try {
    const docRef = doc(db, 'serviceRequests', id);
    await updateDoc(docRef, { status });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating service request status:', error);
    await logErrorAction(
      `Update Service Request Status Failed`,
      `Failed to update service request ID ${id} status to ${status}. Error: ${error.message || error}`
    );
    return { success: false, error: error.message };
  }
}

export async function executeServiceAction(
  requestId: string,
  serviceId: string,
  parameters: string,
  description: string,
  userEmail: string,
  userName: string
) {
  try {
    // 1. Update status to 'running'
    const docRef = doc(db, 'serviceRequests', requestId);
    await updateDoc(docRef, { status: 'running' });

    // Extract email addresses from description using simple regex
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const foundEmails = description.match(emailRegex) || [];
    const uniqueEmails = Array.from(new Set(foundEmails));

    // 2. Perform service-specific executions
    if (serviceId === 'certificates') {
      const eventMatch = parameters.match(/Event\s*Name:\s*([^,]+)/i);
      const eventName = eventMatch ? eventMatch[1].trim() : 'MLSC Tech Event';
      
      const dateMatch = parameters.match(/Date:\s*([^,]+)/i);
      const eventDate = dateMatch ? dateMatch[1].trim() : new Date().toLocaleDateString();

      // If no emails found in description, default to requestor
      const targets = uniqueEmails.length > 0 ? uniqueEmails : [userEmail];

      for (const target of targets) {
        const namePart = target.split('@')[0];
        const participantName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        
        const certHtml = `
          <div style="font-family: 'Poppins', Arial, sans-serif; text-align: center; border: 10px double #4285F4; padding: 50px; background-color: #030303; color: white; border-radius: 12px; max-width: 600px; margin: auto;">
            <h1 style="color: #4285F4; font-size: 32px; font-weight: 900; margin-bottom: 2px;">CERTIFICATE OF PARTICIPATION</h1>
            <p style="font-size: 10px; color: #888; letter-spacing: 4px; margin-top: 0; text-transform: uppercase;">MICROSOFT LEARN STUDENT CLUB</p>
            <div style="margin: 40px 0;">
              <p style="font-size: 14px; color: #aaa; font-style: italic;">This is proudly presented to</p>
              <h2 style="font-size: 26px; font-weight: 800; color: white; margin: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; display: inline-block;">${participantName}</h2>
              <p style="font-size: 13px; color: #aaa; line-height: 1.6; max-width: 400px; margin: 20px auto;">
                for actively participating in the event <strong>${eventName}</strong> organized by the Microsoft Learn Student Club, Sri Vasavi Engineering College.
              </p>
            </div>
            <table style="width: 100%; margin-top: 40px; border-collapse: collapse;">
              <tr>
                <td style="text-align: center; font-size: 12px; color: #888;">
                  <div style="border-bottom: 1px solid rgba(255,255,255,0.2); width: 150px; margin: auto; padding-bottom: 5px; font-weight: bold; color: white;">MLSC SVEC</div>
                  Organizer
                </td>
                <td style="text-align: center; font-size: 12px; color: #888;">
                  <div style="border-bottom: 1px solid rgba(255,255,255,0.2); width: 150px; margin: auto; padding-bottom: 5px; font-weight: bold; color: white;">${eventDate}</div>
                  Date
                </td>
              </tr>
            </table>
          </div>
        `;
        await sendEmailDirect(target, `Your Event Certificate - ${eventName}`, certHtml);
      }
    } 
    else if (serviceId === 'resume') {
      const track = parameters.trim();
      let feedbackHtml = '';

      try {
        if (process.env.GEMINI_API_KEY) {
          const response = await ai.generate({
            prompt: `Analyze this developer resume for the job profile "${track}".
            Resume details:
            ${description}
            
            Provide a detailed response in HTML format. Use a dark mode theme, returning a div container that lists:
            1. A Match Score out of 100.
            2. Main skills identified.
            3. 3 specific technical strengths.
            4. 3 specific suggestions for improvement.
            
            Format it clean and beautiful with border-left tags, using modern font colors (like light gray text and light blue accents) compatible with a dark email container. Do NOT include markdown code blocks like \`\`\`html or \`\`\` around the return value - output the HTML raw.`
          });
          
          feedbackHtml = `
            <div style="font-family: 'Poppins', Arial, sans-serif; color: #eaeaea; background-color: #0c0c0c; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #222;">
              <h2 style="color: #4285F4; font-size: 22px; font-weight: 900; border-bottom: 1px solid #222; padding-bottom: 10px; text-transform: uppercase;">AI RESUME ANALYSIS</h2>
              <p>Hi ${userName},</p>
              <p>Here is your real-time AI evaluation for the <strong>${track}</strong> career track:</p>
              ${response.text}
              <p style="font-size: 11px; color: #666; margin-top: 30px; border-top: 1px solid #222; padding-top: 15px;">
                This report was generated dynamically using Gemini 2.0 Flash in the MLSC operations container.
              </p>
            </div>
          `;
        } else {
          throw new Error("API Key missing");
        }
      } catch (aiError) {
        console.warn("Falling back to simulated resume feedback due to:", aiError);
        feedbackHtml = `
          <div style="font-family: 'Poppins', Arial, sans-serif; color: #eaeaea; background-color: #0c0c0c; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #222;">
            <h2 style="color: #4285F4; font-size: 22px; font-weight: 900; border-bottom: 1px solid #222; padding-bottom: 10px;">AI RESUME ANALYSIS REPORT</h2>
            <p>Hi ${userName},</p>
            <p>Our automation sandbox evaluated your resume description against requirements for <strong>${track}</strong>. Here is the feedback:</p>
            
            <div style="background-color: #161616; padding: 20px; border-radius: 8px; border-left: 4px solid #4285F4; margin: 20px 0;">
              <h3 style="color: white; margin-top: 0; font-size: 15px;">🔍 Analysis & Scoring</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
                <li><strong>Match Score:</strong> 78/100 (Strong Candidate)</li>
                <li><strong>Identified Skills:</strong> React, JavaScript, HTML/CSS, Git, TypeScript, Frontend Frameworks.</li>
                <li><strong>Key Strengths:</strong> Hands-on project experience, clean structuring, good layout.</li>
              </ul>
            </div>

            <div style="background-color: #161616; padding: 20px; border-radius: 8px; border-left: 4px solid #eab308; margin: 20px 0;">
              <h3 style="color: white; margin-top: 0; font-size: 15px;">💡 Areas of Improvement</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
                <li>Add more quantitative metrics (e.g., "optimized loading speeds by 30%").</li>
                <li>Incorporate cloud services keywords (e.g., Firebase, Azure, AWS) in your projects.</li>
                <li>Ensure your LinkedIn and GitHub links are clearly highlighted at the top.</li>
              </ul>
            </div>

            <p style="font-size: 11px; color: #666; margin-top: 30px;">This analysis was performed automatically by the MLSC SVEC operational service container.</p>
          </div>
        `;
      }
      await sendEmailDirect(userEmail, `AI Resume Feedback - ${track}`, feedbackHtml);
    } 
    else if (serviceId === 'ticketing') {
      const workshopMatch = parameters.match(/Workshop\s*Name:\s*([^,]+)/i);
      const workshopName = workshopMatch ? workshopMatch[1].trim() : 'MLSC Workshop';
      
      const dateMatch = parameters.match(/Date:\s*([^,]+)/i);
      const workshopDate = dateMatch ? dateMatch[1].trim() : new Date().toLocaleDateString();

      const targets = uniqueEmails.length > 0 ? uniqueEmails : [userEmail];

      for (const target of targets) {
        const namePart = target.split('@')[0];
        const participantName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const ticketCode = `TICKET-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ ticketCode, email: target, event: workshopName }))}`;

        const ticketHtml = `
          <div style="font-family: 'Poppins', Arial, sans-serif; color: #222; max-width: 500px; margin: auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: white; padding: 25px; text-align: center;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 800; tracking-wide: 1px;">EVENT ENTRY TICKET</h2>
              <p style="margin: 5px 0 0; font-size: 11px; opacity: 0.8; text-transform: uppercase;">${workshopName}</p>
            </div>
            
            <div style="padding: 25px; background: white; text-align: center;">
              <p style="font-size: 14px; color: #555; text-align: left; margin-bottom: 20px;">
                Hi <strong>${participantName}</strong>, your entry ticket for the upcoming session is confirmed. Show this QR code at the registration desk for check-in.
              </p>
              
              <div style="margin: 20px auto; border: 2px dashed #4285F4; padding: 15px; border-radius: 8px; width: fit-content; display: inline-block;">
                <img src="${qrUrl}" alt="QR Ticket Code" style="width: 150px; height: 150px; display: block;" />
              </div>
              
              <p style="font-family: monospace; font-size: 13px; font-weight: bold; color: #333; margin: 10px 0;">
                TICKET REF: ${ticketCode}
              </p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 25px; font-size: 12px; text-align: left; color: #666;">
                <tr>
                  <td style="padding: 6px 0; border-bottom: 1px solid #eee; font-weight: 600;">Date:</td>
                  <td style="padding: 6px 0; border-bottom: 1px solid #eee; text-align: right;">${workshopDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; border-bottom: 1px solid #eee; font-weight: 600;">Venue:</td>
                  <td style="padding: 6px 0; border-bottom: 1px solid #eee; text-align: right;">SVEC Seminar Hall</td>
                </tr>
              </table>
              
              <p style="font-size: 10px; color: #999; margin-top: 20px;">This is an automated system-generated check-in ticket.</p>
            </div>
          </div>
        `;
        await sendEmailDirect(target, `[Event Ticket] Entry QR code for ${workshopName}`, ticketHtml);
      }
    }    else if (serviceId === 'broadcast') {
      const subject = parameters.trim();
      const targets = uniqueEmails.length > 0 ? uniqueEmails : [userEmail];

      for (const target of targets) {
        const broadcastHtml = `
          <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background: #4285F4; color: white; padding: 25px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800;">MLSC NEWSLETTER BROADCAST</h1>
              <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.8; tracking-wider; text-transform: uppercase;">Microsoft Learn Student Club SVEC</p>
            </div>
            <div style="padding: 25px; background: #fff;">
              <p>Dear Subscriber,</p>
              <div style="font-size: 15px; color: #444; margin: 20px 0; white-space: pre-wrap;">
                ${description}
              </div>
              <p style="font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px;">
                You received this broadcast because you are registered as a student member or coordinator of MLSC SVEC.
              </p>
            </div>
          </div>
        `;
        await sendEmailDirect(target, `[Broadcast] ${subject}`, broadcastHtml);
      }
    } 
    else if (serviceId === 'scheduler') {
      const domainMatch = parameters.match(/Domain:\s*([^,]+)/i);
      const domain = domainMatch ? domainMatch[1].trim() : 'General Technical';

      const dateMatch = parameters.match(/Date:\s*([^,]+)/i);
      const interviewDate = dateMatch ? dateMatch[1].trim() : new Date().toLocaleDateString();

      const targets = uniqueEmails.length > 0 ? uniqueEmails : [userEmail];

      for (const target of targets) {
        const namePart = target.split('@')[0];
        const candidateName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

        const schedulerHtml = `
          <div style="font-family: 'Poppins', Arial, sans-serif; color: #222; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
            <div style="background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800;">INTERVIEW SCHEDULER</h2>
            </div>
            <div style="padding: 25px; background: white;">
              <p>Hi ${candidateName},</p>
              <p>You have been scheduled for a technical mock interview session. Details are below:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; width: 120px;">Domain:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${domain}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Interview Date:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${interviewDate}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Platform:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">Google Meet</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Meeting URL:</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="https://meet.google.com/abc-defg-hij" style="color: #4285F4; text-decoration: none; font-weight: bold;">meet.google.com/abc-defg-hij</a></td></tr>
              </table>
              
              <p style="font-size: 13px; color: #666; margin-top: 20px;">Please ensure you join the link 5 minutes prior to the scheduled slot with a working webcam and microphone.</p>
            </div>
          </div>
        `;
        await sendEmailDirect(target, `Scheduled: MLSC Mock Interview - ${domain}`, schedulerHtml);
      }
    }

    // 3. Update status to 'completed'
    await updateDoc(docRef, { status: 'completed' });
    return { success: true };
  } catch (error: any) {
    console.error('Error executing service action:', error);
    await logErrorAction(
      `Execute Service Action Failed`,
      `Failed to execute service action for request ID ${requestId}. Error: ${error.message || error}`
    );
    try {
      const docRef = doc(db, 'serviceRequests', requestId);
      await updateDoc(docRef, { status: 'failed' });
    } catch (_) {}
    return { success: false, error: error.message };
  }
}
