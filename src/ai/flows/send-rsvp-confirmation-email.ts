
'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const RsvpConfirmationEmailInputSchema = z.object({
    name: z.string().describe("The user's name."),
    email: z.string().email().describe("The user's email address."),
    eventName: z.string().describe('The name of the event.'),
    eventDate: z.string().describe('The date of the event.'),
});
export type RsvpConfirmationEmailInput = z.infer<typeof RsvpConfirmationEmailInputSchema>;

export async function sendRsvpConfirmationEmail(input: RsvpConfirmationEmailInput): Promise<void> {
    const { name, email, eventName, eventDate } = RsvpConfirmationEmailInputSchema.parse(input);

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.log(`Skipping RSVP email to ${email} because GMAIL credentials are not configured.`);
        return;
    }

    try {
        const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const subject = `Confirmation for ${eventName}`;
        const htmlBody = `
        <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
            <div style="background-color: #0056b3; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0;">You're Registered!</h1>
            </div>
            <div style="padding: 30px 25px;">
                <h2 style="color: #222; font-size: 22px; font-weight: 600;">Hi ${name},</h2>
                <p style="font-size: 16px;">
                    Thank you for registering for our event: <strong>${eventName}</strong>. We're excited to have you join us!
                </p>
                <div style="background-color: #f1f8ff; border: 1px solid #d1d5db; border-radius: 6px; padding: 20px; margin: 25px 0; text-align: center;">
                    <h3 style="font-size: 18px; font-weight: 600; color: #333; margin-top: 0;">Event Details</h3>
                    <p style="font-size: 16px; margin: 5px 0;"><strong>Event:</strong> ${eventName}</p>
                    <p style="font-size: 16px; margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
                </div>
                <p style="font-size: 16px;">
                    This email serves as your confirmation ticket. Please keep it for your records. We'll send you a reminder closer to the event date.
                </p>
                <p style="margin-top: 30px; font-weight: 500;">Best regards,<br><strong>The MLSC Team</strong></p>
            </div>
            <div style="background-color: #f1f5f9; text-align: center; padding: 15px; font-size: 12px; color: #555;">
                This is an automated email. Please do not reply.
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
            from: `"MLSC Events" <${process.env.GMAIL_USER}>`,
            to: email,
            subject,
            html: htmlBody,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Successfully sent RSVP confirmation to ${email}`);

    } catch (error) {
        console.error(`Failed to send RSVP email to ${email}:`, error);
    }
}
