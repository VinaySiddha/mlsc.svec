
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
    referenceId: z.string().optional().default('MLSC-SVEC').describe("Unique Reference ID for the applicant."),
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
        case 'Interviewed':
        case 'Interview Done':
        case 'Thank You For Attending':
            return {
                subject: `✨ Thank You for Applying & Attending Your Interview — MLSC SVEC`,
                headline: `Thank You for Interviewing with Us! ✨`,
                eyebrow: '#MLSC4.0 · Interview & Application Update',
                accent: '#4285F4',
                message: `A big, heartfelt thank you for applying to the <strong>MLSC 4.0 Recruitment Drive</strong> and taking the time to attend your interview evaluation with our panel! We truly appreciate your enthusiasm, effort, and interest in joining the Microsoft Learn Student Chapter community.<br><br>Our panel leads and mentors are currently conducting final deliberations and reviewing all interview evaluations.<br><br><strong>What's Next?</strong><br>• <strong>If you are selected / hired:</strong> You will receive an official selection and onboarding email shortly with details on the next steps.<br>• <strong>If not selected this time:</strong> That will conclude your application process for this chapter. Please know that we are immensely grateful for the time, passion, and effort you dedicated to this process, and we encourage you to keep building, learning, and participating in our upcoming chapter events and workshops.<br><br>Thanks a lot for being part of this journey!`,
            };
        case 'Interviewing':
        case 'Invited to Interview':
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
