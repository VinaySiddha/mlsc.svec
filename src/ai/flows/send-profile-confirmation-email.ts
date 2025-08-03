
'use server';

/**
 * @fileOverview A utility for sending an email to a new team member after they've created their profile.
 */

import {z} from 'zod';
import nodemailer from 'nodemailer';

// Log a warning at startup if credentials are not provided.
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const ProfileConfirmationEmailInputSchema = z.object({
  name: z.string().describe("The new member's name."),
  email: z.string().email().describe("The new member's email address."),
  memberId: z.string().describe("The member's unique Firestore ID."),
  editLink: z.string().url().describe("The permanent link for the member to edit their profile."),
});
export type ProfileConfirmationEmailInput = z.infer<typeof ProfileConfirmationEmailInputSchema>;


/**
 * Sends a profile confirmation email directly using Nodemailer.
 * @param input - The new member's details (name, email, editLink).
 */
export async function sendProfileConfirmationEmail(input: ProfileConfirmationEmailInput): Promise<void> {
  const { name, email, editLink, memberId } = ProfileConfirmationEmailInputSchema.parse(input);

  // Check for credentials at the time of execution.
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping profile confirmation email to ${email} because GMAIL credentials are not configured in .env.`);
    return;
  }

  // Create a Nodemailer transporter inside the handler.
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD, 
      },
  });

  const idCardLink = `https://mlscsvec.in/id/${memberId}`;
  const subject = `Your MLSC Profile is Active!`;
  const htmlBody = `
  <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #d4edda; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
    
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <div style="background: linear-gradient(135deg, #0056b3 0%, #007bff 100%); height: 8px;"></div>
    
    <div style="padding: 30px 25px;">
        <h1 style="color: #222; font-size: 26px; font-weight: 700; text-align: center; margin-bottom: 10px;">Profile Confirmed, ${name}!</h1>
        <p style="text-align: center; font-size: 17px; color: #555; margin-bottom: 25px;">
            Your profile for the <strong>Microsoft Learn Student Club (MLSC)</strong> is now active and live on our team page.
        </p>

        <div style="background-color: #f1f8ff; border-left: 4px solid #007bff; padding: 15px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; font-size: 16px;">Welcome aboard! We are excited to start this journey with you.</p>
        </div>

        <h3 style="font-size: 18px; font-weight: 600; color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 30px;">Manage Your Profile</h3>
        <p style="font-size: 16px;">
            You can update your profile at any time using your personal edit link below. Please bookmark it for future use.
        </p>

        <!-- Edit Profile Button -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="${editLink}" target="_blank" style="background-color: #007bff; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: background-color 0.3s ease;">
                Edit Your Profile
            </a>
            <a href="${idCardLink}" target="_blank" style="background-color: #6c757d; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: background-color 0.3s ease; margin-left: 10px;">
                View Your ID Card
            </a>
        </div>
        
        <p style="margin-top: 30px; font-weight: 500;">Best regards,<br><strong>The MLSC Hiring Team</strong></p>
    </div>
    
    <!-- Footer -->
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
    console.log(`Successfully sent profile confirmation email to ${email}`);
  } catch (error) {
    console.error(`Failed to send profile confirmation email to ${email} via Nodemailer:`, error);
  }
}
