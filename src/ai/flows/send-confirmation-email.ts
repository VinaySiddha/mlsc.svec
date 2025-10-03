
'use server';

/**
 * @fileOverview A utility for sending a confirmation email to an applicant using Nodemailer and Gmail.
 *
 * - sendConfirmationEmail - A direct function to handle sending the email.
 * - ConfirmationEmailInput - The input type for the sendConfirmationEmail function.
 */

import {z} from 'zod';
import nodemailer from 'nodemailer';

// Log a warning at startup if credentials are not provided.
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const ConfirmationEmailInputSchema = z.object({
  name: z.string().describe("The applicant's name."),
  email: z.string().email().describe("The applicant's email address."),
  referenceId: z.string().describe('The unique reference ID for the application.'),
});
export type ConfirmationEmailInput = z.infer<typeof ConfirmationEmailInputSchema>;


/**
 * Sends a confirmation email directly using Nodemailer.
 * @param input - The applicant's details (name, email, referenceId).
 */
export async function sendConfirmationEmail(input: ConfirmationEmailInput): Promise<void> {
  const { name, email, referenceId } = ConfirmationEmailInputSchema.parse(input);

  // Check for credentials at the time of execution.
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping email to ${email} because GMAIL credentials are not configured in .env.`);
    return;
  }

  // Create a Nodemailer transporter inside the handler to ensure it's only created when needed.
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD, 
      },
  });

  const subject = "Your MLSC Application has been Received!";
  const htmlBody = `
  <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
    
    <!-- Google Fonts Link -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    
    <!-- Header Bar -->
    <div style="background-color: #0056b3; height: 6px;"></div>
    
    <!-- Content -->
    <div style="padding: 20px;">
      <h2 style="color: #222; font-size: 20px; font-weight: 600;">Hi ${name},</h2>
      <p style="font-size: 16px; font-weight: 400;">
        Thank you for applying for the <strong>MLSC 3.0 Hiring Program</strong>. We have successfully received your application and assigned you a unique reference ID for tracking purposes.
      </p>
      
      <!-- Reference ID -->
      <div style="background-color: #f1f5f9; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px; font-weight: 500;"><strong>Reference ID:</strong> 
          <span style="background-color: #facc15; color: #1f2937; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${referenceId}</span>
        </p>
        <p style="font-size: 14px; color: #555; margin-top: 8px;"><em>Please save this ID for future reference.</em></p>
      </div>
      
      <!-- Next Steps -->
      <p style="font-size: 16px; font-weight: 400;">
        Our team is currently reviewing applications. If you are shortlisted, you will receive further communication with instructions for the next stage.
      </p>

      <p style="font-size: 16px; font-weight: 400;">We appreciate your interest in becoming part of MLSC.</p>
      <p style="margin-top: 30px; font-weight: 500;">Best regards,<br><strong>MLSC Hiring Team</strong></p>
    </div>
    
    <!-- Disclaimer Section -->
    <div style="background-color: #f1f5f9; padding: 15px; font-size: 12px; color: #555;">
      <p style="margin: 0 0 5px 0; font-weight: 500;">📌 Disclaimer:</p>
      <ul style="padding-left: 20px; margin: 0;">
        <li>This email is intended for the recipient only. Do not share or forward without permission.</li>
        <li>Your data is protected in compliance with our privacy policies.</li>
        <li>Please save your Reference ID for tracking application status.</li>
        <li>All communications will be sent via the registered email address.</li>
        <li>Ensure to check your spam/junk folder for any missed communications.</li>
        <li>Do not reply to this email as this inbox is not monitored.</li>
        <li>For any queries, contact us at <a href="tel:+919849372827" style="color: #0056b3; text-decoration: none;">Contact Us</a></li>
      </ul>
    </div>

    <!-- Footer Bar -->
    <div style="background-color: #0056b3; text-align: center; padding: 12px; font-size: 12px; color: #ffffff;">
      🚀 #MLSC3.0 #DreamBig #FutureReady
    </div>
  </div>
`;
  
  const mailOptions = {
      from: `"MLSC Hiring" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent email to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email} via Nodemailer:`, error);
    // We'll just log it and not throw an error to avoid halting the parent process.
  }
}
