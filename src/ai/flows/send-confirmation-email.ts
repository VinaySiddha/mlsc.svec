
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
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <div style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px;">
        🚨💥 MLSC HIRING 3.0 IS HERE! 💥🚨
      </div>
      <div style="text-align: center; font-size: 18px; margin-bottom: 20px;">
        <p>🌟 Are you ready to LEVEL UP your skills? 🌟</p>
        <p>💻✨ Whether you're a coder 👨‍💻, designer 🎨, marketer 📈, or tech geek 🤓 - this is YOUR moment!</p>
      </div>
      
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for applying to the MLSC! We have successfully received your application and are thrilled to see your interest.</p>
      
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0056b3;">Application Details</h3>
        <p>Your unique reference ID is: <span style="background-color: yellow; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${referenceId}</span></p>
        <p><span style="background-color: yellow;">Please save this ID to check your application status later on our portal.</span></p>
      </div>

      <h2 style="color: #0056b3; text-align: center;">🔥 Why Join MLSC? 🔥</h2>
      <ul style="list-style-type: '✅ '; padding-left: 20px;">
        <li>Build REAL-WORLD projects 🚀</li>
        <li>Get hands-on with Microsoft tools ⚙️</li>
        <li>Network with top talents 🌐</li>
        <li>Shine at hackathons & events 🏆</li>
        <li>Boost your resume with global recognition 💼</li>
      </ul>

      <div style="text-align: center; margin-top: 30px;">
        <p style="font-size: 18px; font-weight: bold;">📢 This is your CALL TO ACTION – the future won’t wait… why should you? ⏳</p>
        <p>Keep an eye on your email for updates regarding the next steps.</p>
      </div>
      
      <p>Best regards,<br>The MLSC Hiring Team</p>

      <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #777;">
        <p>✨ Don’t just scroll. Make your mark! ✨</p>
        <p>🚀 #MLSC3.0 #HiringNow #DreamBig 🚀</p>
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
