
'use server';

/**
 * @fileOverview A utility for sending a confirmation email to an applicant using Nodemailer and Gmail.
 *
 * - sendConfirmationEmail - A direct function to handle sending the email.
 * - ConfirmationEmailInput - The input type for the sendConfirmationEmail function.
 */

import {z} from 'zod';
import nodemailer from 'nodemailer';

// Log a warning at startup if credentials are not provided.
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env. Real emails will not be sent.");
}

const ConfirmationEmailInputSchema = z.object({
  name: z.string().describe("The applicant's name."),
  email: z.string().email().describe("The applicant's email address."),
  referenceId: z.string().describe('The unique reference ID for the application.'),
});
export type ConfirmationEmailInput = z.infer<typeof ConfirmationEmailInputSchema>;


/**
 * Sends a confirmation email directly using Nodemailer.
 * @param input - The applicant's details (name, email, referenceId).
 */
export async function sendConfirmationEmail(input: ConfirmationEmailInput): Promise<void> {
  const { name, email, referenceId } = ConfirmationEmailInputSchema.parse(input);

  // Check for credentials at the time of execution.
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`Skipping email to ${email} because GMAIL credentials are not configured in .env.`);
    return;
  }

  // Create a Nodemailer transporter inside the handler to ensure it's only created when needed.
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD, 
      },
  });

  const subject = "Your MLSC 4.0 Application has been Received! 🚀";
  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>MLSC 4.0 Application Confirmation</title>
  <style type="text/css">
    @font-face {
      font-family: 'Google Sans';
      font-style: normal;
      font-weight: 400;
      mso-font-alt: Arial;
      src: local('Google Sans Regular'), local('GoogleSans-Regular'),
           url('https://fonts.gstatic.com/s/googlesans/v6/4UaGrENHsxJlGDuGo1OIlL3Owps.ttf') format('truetype');
    }
    @font-face {
      font-family: 'Google Sans';
      font-style: normal;
      font-weight: 500;
      mso-font-alt: Arial;
      src: local('Google Sans Medium'), local('GoogleSans-Medium'),
           url('https://fonts.gstatic.com/s/googlesans/v6/4UabrENHsxJlGDuGo1OIlLU94YtzCwM.ttf') format('truetype');
    }
    @font-face {
      font-family: 'Google Sans';
      font-style: normal;
      font-weight: 700;
      mso-font-alt: Arial;
      src: local('Google Sans Bold'), local('GoogleSans-Bold'),
           url('https://fonts.gstatic.com/s/googlesans/v6/4UabrENHsxJlGDuGo1OIlLV154tzCwM.ttf') format('truetype');
    }
    @font-face {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 400;
      mso-font-alt: Arial;
      src: local('Roboto'), local('Roboto-Regular'),
           url('https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxP.ttf') format('truetype');
    }
    @font-face {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 500;
      mso-font-alt: Arial;
      src: local('Roboto Medium'), local('Roboto-Medium'),
           url('https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmEU9fBBc9.ttf') format('truetype');
    }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8f9fa; }
    a[x-apple-data-detectors] { color: inherit !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    div[style*="margin: 16px 0;"] { margin: 0 !important; }
    @media screen and (max-width: 600px) {
      .container { width: 95% !important; }
      .inner-container { padding-left: 24px !important; padding-right: 24px !important; }
      .header { padding: 16px 10px !important; }
      .hero-text { padding: 24px !important; }
      img.logo { width: 64px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;">
  <center>
    <table width="600" class="container" cellspacing="0" cellpadding="0" border="0" align="center"
      style="max-width:600px;width:100%;background-color:#ffffff;word-break:break-word;">
      <tbody>
        <tr>
          <td align="center" valign="top">

            <!-- ===== HEADER ===== -->
            <table width="600" cellspacing="0" cellpadding="0" border="0" align="center"
              style="max-width:600px;width:100%;background:#f8f9fa;">
              <tbody>
                <tr>
                  <td align="center" valign="top" style="padding:32px 24px 22px 24px;" class="header">
                    <table width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;width:100%;">
                      <tbody>
                        <tr>
                          <td width="300" align="left" valign="middle"
                            style="font-family:'Google Sans','Roboto',Helvetica,Arial,sans-serif;font-size:14px;">
                            <img src="https://mlscsvec.com/logo.png" alt="MLSC SVEC"
                              class="logo" width="80" style="display:block;border:0;" />
                          </td>
                          <td width="300" align="right" valign="middle"
                            style="font-family:'Google Sans','Roboto',Helvetica,Arial,sans-serif;font-size:14px;color:#5f6368;">
                            MLSC SVEC 4.0
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- ===== HERO ===== -->
            <table width="600" cellspacing="0" cellpadding="0" border="0" align="center"
              style="max-width:600px;width:100%;border-bottom:solid 1px #d7d7d7;">
              <tbody>
                <tr>
                  <td align="left" valign="top" style="padding:32px 40px 28px 40px;" class="hero-text">
                    <p style="margin:0 0 8px 0;font-family:'Google Sans','Roboto',Helvetica,Arial,sans-serif;
                      font-size:13px;font-weight:400;line-height:20px;color:#5f6368;">
                      #MLSC4.0 · Microsoft Learn Student Chapter
                    </p>
                    <h1 style="margin:0 0 20px 0;font-family:'Google Sans','Roboto',Helvetica,Arial,sans-serif;
                      font-size:28px;font-weight:700;line-height:36px;color:#202124;">
                      Application Received! 🎉
                    </h1>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tbody>
                        <tr>
                          <td align="center" style="border-radius:6px;" bgcolor="#4285F4">
                            <a href="https://mlscsvec.com/track" target="_blank"
                              style="font-size:14px;line-height:18px;
                                font-family:'Google Sans',Arial,sans-serif;
                                color:#ffffff;text-decoration:none;border-radius:6px;
                                padding:10px 20px;display:inline-block;font-weight:500;
                                letter-spacing:0.5px;border:1px solid #4285F4;">
                              Check Application Status →
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- ===== CONTENT ===== -->
            <table width="600" cellspacing="0" cellpadding="0" border="0" align="center"
              style="max-width:600px;width:100%;">
              <tbody>
                <tr>
                  <td align="left" valign="top" style="padding:28px 40px;" class="inner-container">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tbody>
                        <tr>
                          <td style="font-family:'Google Sans','Roboto',Helvetica,Arial,sans-serif;
                            font-size:16px;font-weight:400;line-height:26px;color:#3c4043;">

                            <p style="margin:0 0 16px 0;">Hello <strong>${name}</strong>,</p>
                            <p style="margin:0 0 20px 0;">
                              Thank you for applying to the <strong>MLSC 4.0 Hiring Program</strong>.
                              We have successfully received your application and assigned you a unique
                              reference ID below.
                            </p>

                            <!-- Reference ID Box -->
                            <table width="100%" cellspacing="0" cellpadding="0" border="0"
                              style="border-radius:10px;border:1px solid #e0e0e0;background:#f8f9fa;margin:0 0 24px 0;">
                              <tbody>
                                <tr>
                                  <td align="center" style="padding:22px 20px;">
                                    <p style="margin:0 0 10px 0;
                                      font-family:'Google Sans',Arial,sans-serif;
                                      font-size:11px;font-weight:500;color:#5f6368;
                                      letter-spacing:1.5px;text-transform:uppercase;">
                                      Your Reference ID
                                    </p>
                                    <table cellpadding="0" cellspacing="0" border="0">
                                      <tr>
                                        <td align="center" bgcolor="#4285F4" style="border-radius:8px;padding:10px 24px;">
                                          <span style="color:#ffffff;font-weight:700;
                                            font-family:monospace;font-size:20px;
                                            letter-spacing:1.5px;">
                                            ${referenceId}
                                          </span>
                                        </td>
                                      </tr>
                                    </table>
                                    <p style="margin:10px 0 0 0;font-family:'Roboto',Arial,sans-serif;
                                      font-size:12px;color:#80868b;">
                                      Save this ID to track your interview status on our portal.
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>

                            <p style="margin:0 0 16px 0;">
                              Our domain panels are reviewing all submissions. Shortlisted candidates
                              will be contacted with details for the peer interaction rounds.
                            </p>

                            <p style="margin:0 0 10px 0;font-weight:700;color:#202124;">What's next:</p>
                            <ul style="margin:0 0 24px 0;padding-left:20px;color:#3c4043;line-height:26px;">
                              <li style="padding-bottom:6px;">
                                Use your Reference ID on the
                                <a href="https://mlscsvec.com/track" style="color:#1a73e8;text-decoration:none;">status portal</a>
                                to track your application.
                              </li>
                              <li style="padding-bottom:6px;">
                                Keep an eye on this inbox — shortlist notifications will arrive here.
                              </li>
                              <li style="padding-bottom:6px;">
                                Stay connected with the MLSC community for upcoming events and updates.
                              </li>
                            </ul>

                            <div style="border-top:1px solid #e0e0e0;padding-top:20px;">
                              <p style="margin:0 0 4px 0;font-size:14px;color:#5f6368;">All the best &amp; happy building,</p>
                              <p style="margin:0;font-size:15px;font-weight:700;
                                font-family:'Google Sans',Arial,sans-serif;color:#202124;">
                                MLSC 4.0 Recruitment Team
                              </p>
                            </div>

                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- ===== FOOTER ===== -->
            <table width="600" cellspacing="0" cellpadding="0" border="0" align="center"
              style="max-width:600px;width:100%;border-top:solid 1px #e0e0e0;background:#f8f9fa;">
              <tbody>
                <tr>
                  <td style="padding:28px 40px;" class="inner-container">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tbody>
                        <tr>
                          <td style="padding-bottom:16px;">
                            <img src="https://mlscsvec.com/logo.png" alt="MLSC SVEC"
                              width="48" style="display:block;border:0;" />
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family:'Roboto',Arial,sans-serif;font-size:12px;
                            line-height:18px;color:#80868b;">
                            © 2026 Microsoft Learn Student Chapter — SVEC<br><br>
                            This is an automated confirmation email sent because you submitted an
                            application through our MLSC 4.0 recruitment portal. Please do not
                            reply directly to this message. For support, contact the club representatives.
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top:14px;font-family:'Roboto',Arial,sans-serif;
                            font-size:12px;color:#80868b;">
                            🚀 #MLSC4.0 &nbsp;·&nbsp; #DreamBig &nbsp;·&nbsp; #FutureReady
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

          </td>
        </tr>
      </tbody>
    </table>
  </center>
</body>
</html>`;
  
  const mailOptions = {
      from: `"MLSC Hiring" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent email to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email} via Nodemailer:`, error);
    // We'll just log it and not throw an error to avoid halting the parent process.
  }
}
