
'use server';

/**
 * @fileOverview A utility for sending an invitation email to a new team member.
 */

import {z} from 'zod';
import nodemailer from 'nodemailer';

// Log a warning at startup if credentials are not provided.
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const InvitationEmailInputSchema = z.object({
  name: z.string().describe("The new member's name."),
  email: z.string().email().describe("The new member's email address."),
  role: z.string().describe("The new member's assigned role."),
  onboardingToken: z.string().describe('The unique token for the onboarding process.'),
});
export type InvitationEmailInput = z.infer<typeof InvitationEmailInputSchema>;


/**
 * Sends an invitation email directly using Nodemailer.
 * @param input - The new member's details (name, email, role, token).
 */
export async function sendInvitationEmail(input: InvitationEmailInput): Promise<void> {
  const { name, email, role, onboardingToken } = InvitationEmailInputSchema.parse(input);

  // Check for credentials at the time of execution.
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping invitation email to ${email} because GMAIL credentials are not configured in .env.`);
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
  
  const onboardingLink = `https://mlscsvec.in/onboard/${onboardingToken}`;

  const subject = `Welcome to the MLSC Team, ${name}!`;
  const htmlBody = `
  <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #d4edda; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
    
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Top Gradient Bar -->
    <div style="background: linear-gradient(135deg, #0056b3 0%, #007bff 100%); height: 8px;"></div>
    
    <!-- Blue Congratulations Banner -->
    <div style="background-color: #0056b3; color: #ffffff; text-align: center; padding: 16px 20px; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
        🎉 Welcome Aboard, ${name}! 🎉
    </div>
    
    <div style="padding: 30px 25px;">
        <h1 style="color: #222; font-size: 26px; font-weight: 700; text-align: center; margin-bottom: 10px;">You're Officially Part of the Team!</h1>
        <p style="text-align: center; font-size: 17px; color: #555; margin-bottom: 25px;">
            We are thrilled to welcome you to the <strong>Microsoft Learn Student Club (MLSC)</strong> as our new <strong>${role}</strong>. Your skills, passion, and performance truly stood out.
        </p>

        <div style="background-color: #f1f8ff; border-left: 4px solid #007bff; padding: 15px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; font-size: 16px;">This is the beginning of an exciting journey. We can't wait to see what you'll achieve with us.</p>
        </div>

        <h3 style="font-size: 18px; font-weight: 600; color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 30px;">Your Onboarding Pass</h3>
        <p style="font-size: 16px;">
            To get started, please complete your team profile and join our official communication channels. Click the button below to begin your onboarding process.
        </p>

        <!-- Onboarding Button -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="${onboardingLink}" target="_blank" style="background-color: #007bff; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: background-color 0.3s ease;">
                Complete Your Profile
            </a>
        </div>

        <!-- WhatsApp Group -->
        <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 16px; font-weight: 500;">📢 Stay Updated!</p>
            <p style="font-size: 15px; font-weight: 400;">Join our WhatsApp group to receive important announcements and updates directly.</p>
            <a href="https://chat.whatsapp.com/BToVAcH9Kie5pt4vSjPHHw" target="_blank" style="display: inline-block; background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Join WhatsApp Group</a>
        </div>
        
        <p style="font-size: 16px; font-weight: 400;">We can't wait for you to join us and start building the future of tech together.</p>
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
    console.log(`Successfully sent invitation email to ${email}`);
  } catch (error) {
    console.error(`Failed to send invitation email to ${email} via Nodemailer:`, error);
    // We'll just log it and not throw an error to avoid halting the parent process.
  }
}
