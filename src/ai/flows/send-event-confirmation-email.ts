
'use server';

/**
 * @fileOverview A utility for sending an event registration confirmation email.
 */

import {z} from 'zod';
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const EventConfirmationEmailInputSchema = z.object({
  name: z.string().describe("The user's name."),
  email: z.string().email().describe("The user's email address."),
  eventName: z.string().describe("The name of the event."),
  eventDate: z.string().describe("The date of the event in ISO format."),
  registrationId: z.string().describe('The unique ID for the registration.'),
});
export type EventConfirmationEmailInput = z.infer<typeof EventConfirmationEmailInputSchema>;

export async function sendEventConfirmationEmail(input: EventConfirmationEmailInput): Promise<void> {
  const { name, email, eventName, eventDate, registrationId } = EventConfirmationEmailInputSchema.parse(input);

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping event confirmation email to ${email} because GMAIL credentials are not configured.`);
    return;
  }

  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD, 
      },
  });

  const formattedDate = format(new Date(eventDate), "EEEE, MMMM d, yyyy 'at' h:mm a");

  const subject = `✅ Your Ticket for ${eventName}`;
  const htmlBody = `
  <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #d4edda; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
    
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <div style="background: linear-gradient(135deg, #0056b3 0%, #007bff 100%); height: 8px;"></div>
    
    <div style="padding: 30px 25px;">
        <h1 style="color: #222; font-size: 26px; font-weight: 700; text-align: center; margin-bottom: 10px;">Registration Confirmed!</h1>
        <p style="text-align: center; font-size: 17px; color: #555; margin-bottom: 25px;">
            Hi ${name}, thank you for registering for our upcoming event.
        </p>

        <div style="background-color: #f1f8ff; border: 1px solid #d1e7fd; border-radius: 6px; padding: 20px; margin: 25px 0; text-align: center;">
            <h2 style="font-size: 22px; font-weight: 600; color: #0056b3; margin: 0 0 10px 0;">${eventName}</h2>
            <p style="margin: 0; font-size: 16px; color: #333;">${formattedDate}</p>
            <div style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #555;">Registration ID (Your Ticket):</p>
                <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 600; color: #000; font-family: monospace;">${registrationId}</p>
            </div>
        </div>

        <h3 style="font-size: 18px; font-weight: 600; color: #333; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 30px;">What's Next?</h3>
        <p style="font-size: 16px;">
            We'll send you a reminder closer to the event date. Please keep this email for your records.
        </p>
        
        <p style="margin-top: 30px; font-weight: 500;">We look forward to seeing you there,<br><strong>The MLSC Team</strong></p>
    </div>
    
    <div style="background-color: #0056b3; text-align: center; padding: 12px; font-size: 12px; color: #ffffff;">
        🚀 #MLSC3.0 #DreamBig #FutureReady
    </div>
</div>
`;
  
  const mailOptions = {
      from: `"MLSC Events" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent event confirmation to ${email}`);
  } catch (error) {
    console.error(`Failed to send event confirmation to ${email} via Nodemailer:`, error);
  }
}
