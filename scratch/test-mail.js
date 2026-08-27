const nodemailer = require('nodemailer');

async function test() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vinaysiddha.20@gmail.com',
      pass: 'rdavlxhcsyravhix',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"MLSC Test" <vinaysiddha.20@gmail.com>',
      to: 'vinaysiddha.20@gmail.com',
      subject: 'Test Email - MLSC Mail Debug',
      html: '<p>This is a test email to verify the mail system is working.</p>',
    });
    console.log('SUCCESS - MessageId:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.log('FAILED:', err.message);
    console.log('Code:', err.code);
    console.log('Response:', err.response);
    console.log('ResponseCode:', err.responseCode);
  }
}

test();
