
'use server';

/**
 * @fileOverview A utility for sending status update emails to applicants.
 *
 * - sendStatusUpdateEmail - A function that handles sending the email.
 * - StatusUpdateEmailInput - The input type for the function.
 */

import { z } from 'zod';
import nodemailer from 'nodemailer';

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const StatusUpdateEmailInputSchema = z.object({
  name: z.string().describe("The applicant's name."),
  email: z.string().email().describe("The applicant's email address."),
  status: z.string().describe('The new status of the application (e.g., "Hired", "Rejected", "Interviewing").'),
});
export type StatusUpdateEmailInput = z.infer<typeof StatusUpdateEmailInputSchema>;


function getEmailContent(status: string, name: string): { subject: string; message: string } {
  switch (status) {
    case 'Hired':
      return {
        subject: `Congratulations! You're Hired for MLSC 3.0!`,
        message: `We are thrilled to offer you a position with the MLSC 3.0 program! Your skills and passion stood out to us, and we can't wait for you to join the team. You will receive another email soon with onboarding details. Welcome aboard!`
      };
    case 'Interviewing':
      return {
        subject: `You're Invited for an Interview with MLSC 3.0`,
        message: `Your application has impressed us, and we would like to invite you for an interview to discuss your skills and experience further. You will receive a separate communication shortly with details on how to schedule your interview slot. Congratulations on making it to the next round!`
      };
    case 'Under Processing':
        return {
            subject: `Update on Your MLSC 3.0 Application`,
            message: `Your application has successfully passed our initial screening and is now under review by our domain leads. We appreciate your patience and will get back to you with the next steps as soon as possible.`
        };
    case 'Recommended':
        return {
            subject: `Great News Regarding Your MLSC 3.0 Interview`,
            message: `Congratulations on successfully clearing the interview round! Your performance was impressive, and your application has been recommended for the final review. We will notify you with the final decision soon.`
        };
    case 'Rejected':
      return {
        subject: `Update on Your MLSC 3.0 Application`,
        message: `Thank you for your interest in the MLSC 3.0 Hiring Program and for the time you invested in your application. While your profile is impressive, we have decided not to move forward at this time. We encourage you to apply for future openings and wish you the best in your endeavors.`
      };
    default:
      return {
        subject: `Update on Your MLSC 3.0 Application`,
        message: `This is just to let you know that your application status has been updated to "${status}". Please stay tuned for more information.`
      };
  }
}


export async function sendStatusUpdateEmail(input: StatusUpdateEmailInput): Promise<void> {
  const { name, email, status } = StatusUpdateEmailInputSchema.parse(input);

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping status update email to ${email} because GMAIL credentials are not configured.`);
    return;
  }
  
  try {
    const { subject, message } = getEmailContent(status, name);

    const htmlBody = `
      <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
        
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
        
        <div style="background-color: #0056b3; height: 6px;"></div>
        
        <div style="padding: 20px;">
          <h2 style="color: #222; font-size: 20px; font-weight: 600;">Hi ${name},</h2>
          
          <p style="font-size: 16px; font-weight: 400;">
            This is an update regarding your application for the <strong>MLSC 3.0 Hiring Program</strong>.
          </p>

          <div style="background-color: #f1f5f9; border: 1px solid #d1d5db; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px; font-weight: 500;"><strong>New Status:</strong> 
              <span style="background-color: #facc15; color: #1f2937; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${status}</span>
            </p>
            <p style="font-size: 15px; color: #333; margin-top: 12px; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="font-size: 16px; font-weight: 400;">Thank you for your time and interest in MLSC.</p>
          <p style="margin-top: 30px; font-weight: 500;">Best regards,<br><strong>MLSC Hiring Team</strong></p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 15px; font-size: 12px; color: #555;">
          <p style="margin: 0; font-weight: 500;">📌 Please Note:</p>
          <ul style="padding-left: 20px; margin: 5px 0 0 0;">
            <li>All official communication will be sent to this email address.</li>
            <li>For any queries, contact us at <a href="tel:+919849372827" style="color: #0056b3; text-decoration: none;">Contact Us</a>.</li>
          </ul>
        </div>

        <div style="background-color: #0056b3; text-align: center; padding: 12px; font-size: 12px; color: #ffffff;">
          🚀 #MLSC3.0 #DreamBig #FutureReady
        </div>
      </div>
    `;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"MLSC Hiring" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subject,
        html: htmlBody,
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent '${status}' status update email to ${email}`);

  } catch (error) {
    console.error(`Failed to send status update email to ${email}:`, error);
  }
}
