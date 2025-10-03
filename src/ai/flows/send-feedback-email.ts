
'use server';

import nodemailer from 'nodemailer';

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Event feedback emails will not be sent.");
}

interface EventFeedbackEmailInput {
  name: string;
  email: string;
  eventName: string;
  feedbackLink: string;
}

export async function sendFeedbackEmail(input: EventFeedbackEmailInput): Promise<void> {
  const { name, email, eventName, feedbackLink } = input;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping event feedback email to ${email} because GMAIL credentials are not configured.`);
    return;
  }

  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
      },
  });

  const subject = `We Value Your Feedback for ${eventName}!`;
  const htmlBody = `
  <div style="font-family: 'Poppins', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <div style="background-color: #0056b3; height: 6px;"></div>
    <div style="padding: 20px;">
      <h2 style="color: #222; font-size: 20px; font-weight: 600;">Hi ${name},</h2>
      <p style="font-size: 16px;">
        Thank you for attending <strong>${eventName}</strong>. We hope you had a great time and learned a lot!
      </p>
      <p>Your feedback is very important to us and helps us improve our future events. Please take a moment to fill out our feedback form.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${feedbackLink}" target="_blank" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Share Your Feedback</a>
      </div>
      <p>We appreciate your valuable input and look forward to seeing you at our next event.</p>
      <p style="margin-top: 30px; font-weight: 500;">Best regards,<br><strong>The MLSC Team</strong></p>
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
    console.log(`Successfully sent event feedback email to ${email}`);
  } catch (error) {
    console.error(`Failed to send event feedback email to ${email}:`, error);
  }
}
