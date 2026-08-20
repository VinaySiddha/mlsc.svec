'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const AssignmentEmailInputSchema = z.object({
  panelMemberName: z.string().describe("The panel member's name."),
  panelMemberEmail: z.string().email().describe("The panel member's email address."),
  applicantName: z.string().describe("The applicant's name."),
  applicantDomain: z.string().describe("The technical domain."),
  referenceId: z.string().describe('The unique reference ID for the application.'),
});
export type AssignmentEmailInput = z.infer<typeof AssignmentEmailInputSchema>;

export async function sendAssignmentEmail(input: AssignmentEmailInput) {
  try {
    const parsedInput = AssignmentEmailInputSchema.parse(input);

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log(`[Email Mock] Assignment email to ${parsedInput.panelMemberEmail} for applicant ${parsedInput.applicantName}`);
      return { success: true, message: 'Mock email sent (credentials missing)' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"MLSC SVEC Hiring" <${process.env.GMAIL_USER}>`,
      to: parsedInput.panelMemberEmail,
      subject: `New Applicant Assigned: ${parsedInput.applicantName} (${parsedInput.applicantDomain})`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #4285F4;">New Application Assigned</h2>
          <p>Hi ${parsedInput.panelMemberName},</p>
          <p>A new candidate has applied and been automatically assigned to you for review.</p>
          <p>
            <strong>Applicant Name:</strong> ${parsedInput.applicantName}<br>
            <strong>Domain:</strong> ${parsedInput.applicantDomain}<br>
            <strong>Reference ID:</strong> ${parsedInput.referenceId}
          </p>
          <p>You are now the primary point of contact for this applicant. Please log into the Admin Dashboard to review their details and begin the assessment process.</p>
          <p>Thank you,<br><strong>MLSC SVEC Hiring Team</strong></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending assignment email:", error);
    throw error;
  }
}
