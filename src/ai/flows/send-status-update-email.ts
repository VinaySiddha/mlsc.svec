'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const StatusUpdateEmailInputSchema = z.object({
    name: z.string().describe("The applicant's name."),
    email: z.string().email().describe("The applicant's email address."),
    status: z.string().describe('The new status of the application (e.g., "Hired", "Rejected", "Interviewing").'),
    referenceId: z.string().describe("Unique Reference ID for the applicant."),
});
export type StatusUpdateEmailInput = z.infer<typeof StatusUpdateEmailInputSchema>;

function getEmailContent(status: string, name: string, referenceId: string): { subject: string; message: string } {
    let subject = '';
    let statusMessage = '';

    switch (status) {
        case 'Hired':
            subject = `🎉 Congratulations! You're Hired for MLSC 3.0!`;
            statusMessage = `We are thrilled to offer you a position in the <strong>MLSC 3.0 program</strong>! Your skills and passion stood out, and we can't wait for you to join the team. You will receive another email soon with onboarding details. Welcome aboard!`;
            break;
        case 'Interviewing':
            subject = `You're Invited for an Interview with MLSC 3.0`;
            statusMessage = `Your application impressed us! We’d like to invite you for an interview to discuss your skills and experience further. Details for scheduling your interview slot will be sent soon.`;
            break;
        case 'Under Processing':
            subject = `Update on Your MLSC 3.0 Application`;
            statusMessage = `Your application has passed the initial screening and is now under review by our domain leads. We appreciate your patience and will notify you about the next steps.`;
            break;
        case 'Recommended':
            subject = `Great News Regarding Your MLSC 3.0 Interview`;
            statusMessage = `Congratulations on successfully clearing the interview! Your performance was impressive, and your application is now recommended for final review. We’ll notify you with the final decision soon.`;
            break;
        case 'Rejected':
            subject = `Update on Your MLSC 3.0 Application`;
            statusMessage = `Thank you for your interest in the <strong>MLSC 3.0 Hiring Program</strong>. While your profile is impressive, we’ve decided not to move forward at this time. We encourage you to apply for future opportunities.`;
            break;
        default:
            subject = `Update on Your MLSC 3.0 Application`;
            statusMessage = `This is to inform you that your application status has been updated to <strong>${status}</strong>. Please stay tuned for more updates.`;
            break;
    }

    const message = `
    <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
        
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
        
        <div style="background-color: #0056b3; height: 6px;"></div>
        
        <div style="padding: 20px;">
            <h2 style="color: #222; font-size: 20px; font-weight: 600;">Hi ${name},</h2>
            <p style="font-size: 16px; font-weight: 400;">
                This is an update regarding your application for the <strong>MLSC 3.0 Hiring Program</strong>.
            </p>

            <div style="background-color: #f1f5f9; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; font-weight: 500;"><strong>New Status:</strong> 
                    <span style="background-color: #facc15; color: #1f2937; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${status}</span>
                </p>
                <p style="font-size: 15px; color: #333; margin-top: 12px; white-space: pre-wrap;">${statusMessage}</p>
            </div>

            <div style="background-color: #f1f5f9; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; font-weight: 500;"><strong>Reference ID:</strong> 
                    <span style="background-color: #facc15; color: #1f2937; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${referenceId}</span>
                </p>
                <p style="font-size: 14px; color: #555; margin-top: 8px;"><em>Please save this ID for future reference.</em></p>
            </div>

            

            <p style="font-size: 16px; font-weight: 400;">We appreciate your time and interest in MLSC.</p>
            <p style="margin-top: 30px; font-weight: 500;">Best regards,<br><strong>MLSC Hiring Team</strong></p>
        </div>

        <div style="background-color: #f1f5f9; padding: 15px; font-size: 12px; color: #555;">
            <p style="margin: 0 0 5px 0; font-weight: 500;">📌 Disclaimer:</p>
            <ul style="padding-left: 20px; margin: 0;">
                <li>This email is intended for the recipient only. Do not share or forward without permission.</li>
                <li>Your data is protected in compliance with our privacy policies.</li>
                <li>Follow WhatsApp group updates for any changes or announcements.</li>
                <li>Please save your Reference ID for tracking application status.</li>
                <li>All communications will be sent via the registered email address.</li>
                <li>Check your spam/junk folder for missed communications.</li>
                <li>Do not reply to this email as this inbox is not monitored.</li>
                <li>For queries, contact us at <a href="tel:+919849372827" style="color: #0056b3; text-decoration: none;">Contact Us</a></li>
            </ul>
        </div>

        <div style="background-color: #0056b3; text-align: center; padding: 12px; font-size: 12px; color: #ffffff;">
            🚀 #MLSC3.0 #DreamBig #FutureReady
        </div>
    </div>
    `;
    return { subject, message };
}

export async function sendStatusUpdateEmail(input: StatusUpdateEmailInput): Promise<void> {
    const { name, email, status, referenceId } = StatusUpdateEmailInputSchema.parse(input);

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.log(`Skipping email to ${email} because GMAIL credentials are not configured.`);
        return;
    }

    try {
        const { subject, message: htmlBody } = getEmailContent(status, name, referenceId);

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
            subject,
            html: htmlBody,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Successfully sent '${status}' status email to ${email}`);

    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
    }
}
