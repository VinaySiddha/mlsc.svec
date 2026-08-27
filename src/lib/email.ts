'use server';

import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const gmailUser = process.env.GMAIL_USER?.replace(/^["']|["']$/g, '').trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/^["']|["']$/g, '').trim();

  if (!gmailUser || !gmailPass) {
    console.warn('GMAIL credentials not configured. Emails will not be sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  return transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  const gmailUser = process.env.GMAIL_USER?.replace(/^["']|["']$/g, '').trim();

  try {
    await t.sendMail({
      from: `"MLSC SVEC" <${gmailUser}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}
