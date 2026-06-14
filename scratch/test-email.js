const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;

console.log('GMAIL_USER:', gmailUser);
console.log('GMAIL_APP_PASSWORD length:', gmailPass ? gmailPass.length : 0);

if (!gmailUser || !gmailPass) {
  console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD');
  process.exit(1);
}

async function main() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    console.log('Attempting to send email...');
    const info = await transporter.sendMail({
      from: `"MLSC Test" <${gmailUser}>`,
      to: 'vinaysiddha19@gmail.com',
      subject: 'Test Email - MLSC SVEC',
      html: '<h1>Nodemailer Test</h1><p>If you receive this, the email function works!</p>',
    });

    console.log('Email sent successfully! MessageId:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

main();
