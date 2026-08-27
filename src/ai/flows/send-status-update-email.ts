
'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';
import { buildEmailHtml, emailBadge, emailInfoBox, emailSignature } from '@/lib/email-base';

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

function getStatusConfig(status: string): { subject: string; headline: string; message: string; accent: string; eyebrow: string } {
    switch (status) {
        case 'Hired':
            return {
                subject: `🎉 Congratulations! You've been selected for MLSC 4.0`,
                headline: `You're In! Welcome to MLSC 4.0 🎉`,
                eyebrow: '#MLSC4.0 · Selection Update',
                accent: '#34A853',
                message: `We are thrilled to inform you that your application for the <strong>MLSC 4.0 Hiring Program</strong> has been successful, and you have been selected to join the team! You will receive a separate invitation email shortly with instructions on how to complete your onboarding process.`,
            };
        case 'Interviewing':
            return {
                subject: `📅 You're Invited for an Interview — MLSC 4.0`,
                headline: `Interview Invitation 📅`,
                eyebrow: '#MLSC4.0 · Interview Round',
                accent: '#4285F4',
                message: `Your application impressed us! We'd like to invite you for an interview to discuss your skills and experience further. Details for scheduling your interview slot will be sent soon. Please be prepared and stay tuned.`,
            };
        case 'Under Processing':
            return {
                subject: `🔄 Application Update — MLSC 4.0`,
                headline: `Application Under Review 🔄`,
                eyebrow: '#MLSC4.0 · Application Status',
                accent: '#FBBC05',
                message: `Your application has passed the initial screening and is now under review by our domain leads. We appreciate your patience and will notify you about the next steps shortly.`,
            };
        case 'Recommended':
            return {
                subject: `⭐ Great News on Your MLSC 4.0 Interview!`,
                headline: `Recommended for Final Review ⭐`,
                eyebrow: '#MLSC4.0 · Interview Outcome',
                accent: '#34A853',
                message: `Congratulations on successfully clearing the interview! Your performance was impressive, and your application is now recommended for final review. We'll notify you with the final decision soon.`,
            };
        case 'Rejected':
            return {
                subject: `Update on Your MLSC 4.0 Application`,
                headline: `Application Update`,
                eyebrow: '#MLSC4.0 · Application Status',
                accent: '#EA4335',
                message: `Thank you for your interest in the <strong>MLSC 4.0 Hiring Program</strong>. While your profile is impressive, we've decided not to move forward at this time. We appreciate the effort you put in and encourage you to apply for future opportunities.`,
            };
        case 'Waitlisted':
            return {
                subject: `Update on Your MLSC 4.0 Application`,
                headline: `Application Waitlisted ⏳`,
                eyebrow: '#MLSC4.0 · Application Status',
                accent: '#FBBC05',
                message: `Thank you for applying to the <strong>MLSC 4.0 Hiring Program</strong>. Your application has been placed on our waitlist. We will reach out if a position opens up. Please stay tuned for further updates.`,
            };
        case 'On Hold':
            return {
                subject: `Update on Your MLSC 4.0 Application`,
                headline: `Application On Hold ⏸️`,
                eyebrow: '#MLSC4.0 · Application Status',
                accent: '#FBBC05',
                message: `Your application for the <strong>MLSC 4.0 Hiring Program</strong> is currently on hold. This may be due to ongoing internal discussions. We will notify you as soon as there is an update. Thank you for your patience.`,
            };
        default:
            return {
                subject: `Update on Your MLSC 4.0 Application`,
                headline: `Application Status Updated`,
                eyebrow: '#MLSC4.0 · Application Status',
                accent: '#4285F4',
                message: `This is to inform you that your application status has been updated to <strong>${status}</strong>. Please stay tuned for more updates from the MLSC team.`,
            };
    }
}

export async function sendStatusUpdateEmail(input: StatusUpdateEmailInput): Promise<void> {
    const { name, email, status, referenceId } = StatusUpdateEmailInputSchema.parse(input);

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.log(`Skipping email to ${email} because GMAIL credentials are not configured.`);
        return;
    }

    try {
        const { subject, headline, message, accent, eyebrow } = getStatusConfig(status);

        const bodyHtml = `
            <p style="margin:0 0 16px 0;">Hello <strong>${name}</strong>,</p>
            <p style="margin:0 0 20px 0;">
                This is an update regarding your application for the <strong>MLSC 4.0 Hiring Program</strong>.
            </p>

            ${emailInfoBox(`
                <p style="margin:0 0 10px 0;font-family:'Google Sans',Arial,sans-serif;font-size:11px;font-weight:500;color:#5f6368;letter-spacing:1.5px;text-transform:uppercase;">New Status</p>
                <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px 0;">
                  <tr>
                    <td bgcolor="${accent}" style="border-radius:6px;padding:6px 16px;">
                      <span style="color:#ffffff;font-weight:700;font-family:'Google Sans',Arial,sans-serif;font-size:13px;letter-spacing:0.5px;text-transform:uppercase;">${status}</span>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-family:'Roboto',Arial,sans-serif;font-size:15px;color:#3c4043;line-height:24px;">${message}</p>
            `)}

            ${emailInfoBox(`
                <p style="margin:0 0 10px 0;font-family:'Google Sans',Arial,sans-serif;font-size:11px;font-weight:500;color:#5f6368;letter-spacing:1.5px;text-transform:uppercase;">Your Reference ID</p>
                ${emailBadge(referenceId, '#4285F4')}
                <p style="margin:10px 0 0 0;font-family:'Roboto',Arial,sans-serif;font-size:12px;color:#80868b;text-align:center;">Save this ID for future tracking.</p>
            `)}

            <ul style="margin:0 0 24px 0;padding-left:20px;color:#3c4043;line-height:26px;font-size:13px;">
                <li style="padding-bottom:4px;">This email is intended for the recipient only.</li>
                <li style="padding-bottom:4px;">Check your spam/junk folder for missed communications.</li>
                <li style="padding-bottom:4px;">All communications will be sent via your registered email address.</li>
            </ul>

            ${emailSignature('MLSC 4.0 Hiring Team')}
        `;

        const htmlBody = buildEmailHtml({
            eyebrow,
            headline,
            accentColor: accent,
            bodyHtml,
        });

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
