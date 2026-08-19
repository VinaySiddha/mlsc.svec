import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env / .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error("Error: GMAIL_USER or GMAIL_APP_PASSWORD is not set in environment.");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  const name = "Vinay Siddha";
  const email = "vinaysiddha.20@gmail.com";
  const facilitator_name = "Vinay Siddha";
  const facilitator_email = "vinaysiddha.20@gmail.com";

  const rawHtml = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>
    Google Cloud Arcade Facilitator 2026 - User Progress Report Email  </title>
  <style type="text/css">
    .dotted-box {
      width: 600px;
      height: 100px;
      border: 2px dotted #333;
      margin-left: 20px;
    }

    @font-face {
      font-family: 'Google Sans';
      font-style: normal;
      font-weight: 400;
      mso-font-alt: Arial;
      src: local('Google Sans Regular'), local('GoogleSans-Regular'), url('https://fonts.gstatic.com/s/googlesans/v6/4UaGrENHsxJlGDuGo1OIlL3Owps.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Google Sans';
      font-style: normal;
      font-weight: 500;
      mso-font-alt: Arial;
      src: local('Google Sans Medium'), local('GoogleSans-Medium'), url('https://fonts.gstatic.com/s/googlesans/v6/4UabrENHsxJlGDuGo1OIlLU94YtzCwM.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Google Sans';
      font-style: normal;
      font-weight: 700;
      mso-font-alt: Arial;
      src: local('Google Sans Bold'), local('GoogleSans-Bold'), url('https://fonts.gstatic.com/s/googlesans/v6/4UabrENHsxJlGDuGo1OIlLV154tzCwM.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 400;
      mso-font-alt: Arial;
      src: local('Roboto'), local('Roboto-Regular'), url('https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxP.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 500;
      mso-font-alt: Arial;
      src: local('Roboto Medium'), local('Roboto-Medium'), url('https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmEU9fBBc9.ttf') format('truetype');
    }

    body,
    table,
    td,
    a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      -ms-interpolation-mode: bicubic;
    }

    img {
      border: 0;
      outline: none;
      text-decoration: none;
    }

    table {
      border-collapse: collapse !important;
    }

    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }

    a[x-apple-data-detectors] {
      color: inherit !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    div[style*="margin: 16px 0;"] {
      margin: 0 !important;
    }

    @media screen and (max-width: 600px) {
      img {
        height: auto;
        max-width: 100% !important;
      }

      img.logo {
        width: 140px !important;
      }

      img.partner-logo {
        max-height: 30px !important;
        width: auto !important;
      }

      .header {
        padding: 16px 10px !important;
      }

      .hero-image-mobile {
        display: block !important;
        border-bottom: solid 1px #D7D7D7;
      }

      .normal-image-mobile {
        display: block !important;
      }

      .hom {
        display: none !important;
      }

      .width100 {
        display: block;
        width: 100% !important;
      }

      .hero-text {
        padding: 24px !important;
        padding-bottom: 5px !important;
      }

      .hero-wrap {
        border-bottom: none !important;
      }

      .container {
        width: 95% !important;
      }

      .event-data .border-me {
        padding-bottom: 30px !important;
        border-bottom: solid 1px #D7D7D7;
      }

      .border-me {
        padding-bottom: 30px !important;
        border-bottom: solid 1px #D7D7D7;
      }

      p {
        Margin: 0;
      }

      .inner-container {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }

      .map-image-mobile {
        display: block !important;
      }

      .td-paddit {
        padding-bottom: 16px !important;
      }

      .agenda-cell {
        display: block !important;
        width: 100% !important;
      }

      .agenda-cell.time {
        border-bottom: none !important;
        padding-bottom: 0 !important;
      }

      .agenda-cell.info {
        padding-top: 0 !important;
      }

      a {
        color: #1A73E8;
      }

      .prefooter-parent {
        padding-bottom: 22px !important;
      }
    }

    img.no-arrow+div {
      display: none !important;
    }
  </style>
</head>

<body style="margin:0;padding:0;background-color:#f8f9fa">
  <style type="text/css">
    div#emailPreHeader {
      display: none !important;
    }
  </style>
  <div id="emailPreHeader" style="opacity:0;color:transparent;line-height:0;font-size:0px;overflow:hidden;border-width:0;display:none!important">
    Your Arcade Facilitator '26 user progress report for today is here!  </div>
  <center>
    <div style="background-color:#f8f9fa;max-width:600px;margin:auto">
      
      <table width="600" class="container" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;width:100%;word-break:break-word" bgcolor="#FFFFFF">
        <tbody>
          <tr>
            <td class="mktoContainer" id="theBigContainer" align="center" valign="top">
              <table class="mktoModule" id="headerModule" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;width:100%;background:#f8f9fa">
                <tbody>
                  <tr>
                    <td align="center" valign="top" style="padding:32px 24px 22px 24px" class="header mktoText" id="header-logos">
                      <table width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;width:100%">
                        <tbody>
                          <tr>
                            <td width="300" align="left" valign="top" style="font-family:'Google Sans','Roboto',Helvetica,Arial,sans-serif;font-size:14px;vertical-align:middle">
                              <img src="https://lp.cloudplatformonline.com/rs/808-GJW-314/images/google-cloud-2021-em.png" alt="Google Cloud" class="logo no-arrow" width="180" height="28">
                            </td>
                            <td width="300" align="right" valign="top" style="font-family:'Google Sans','Roboto',Helvetica,Arial,sans-serif;font-size:14px;vertical-align:middle">
                              Arcade Facilitator 2026</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table class="mktoModule" id="heroModuleb29c98b4-7be1-44cf-b196-0ff1e11e3bbb" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;width:100%">
                <tbody>
                  <tr>
                    <td align="center" class="hero-wrap" valign="top" style="padding:0;border-bottom:solid 1px #d7d7d7">
                      <table class="hero-content" border="0" cellspacing="0" cellpadding="0">
                        
                        <tbody>
                          <tr>
                            <td class="hero-image-mobile mktoText" id="emMobileHeroImageb29c98b4-7be1-44cf-b196-0ff1e11e3bbb" colspan="2" style="display:none"><a href="https://rsvp.withgoogle.com/events/arcade-facilitator/home" target="_blank"><img class="no-arrow" style="display: block; Margin: 0; border: 0;" src="https://services.google.com/fh/files/emails/gcaf26_email_mobile_header.png" alt=""></a>
                            </td>
                          </tr>
                          
                          <tr>
                            <td width="360" style="width:360px;vertical-align:middle" class="width100">
                              <table cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;width:100%">
                                <tbody>
                                  <tr>
                                    <td class="hero-text" style="padding:20px 10px 20px 40px;text-align:left;vertical-align:middle">
                                      <table cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;width:100%">
                                        <tbody>
                                          <tr>
                                            <td>
                                              <div class="mktoText" id="hero-eyebrowb29c98b4-7be1-44cf-b196-0ff1e11e3bbb">
                                                <table cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;width:100%">
                                                  <tbody>
                                                    <tr>
                                                      <td class="hero-eyebrow" style="margin:0;border-collapse:collapse!important;color:#3c4043;font-family:'Google Sans','Roboto',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:24px;padding:0;padding-bottom:8px;text-align:left;vertical-align:top;word-wrap:break-word">
                                                        #GoogleSkillsArcade
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </div>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td class="hero-title mktoText" id="hero-titleb29c98b4-7be1-44cf-b196-0ff1e11e3bbb" style="Margin:0;border-collapse:collapse!important;color:#3c4043;font-family:'Google Sans','Roboto',Helvetica,Arial,sans-serif;font-size:32px;font-weight:bold;line-height:40px;margin:0;padding:0;padding-bottom:20px;text-align:left;vertical-align:top;word-wrap:break-word">
                                              <div>
                                                Google Skills Challenge Kickoff!                                              </div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table class="event-data" cellpadding="0" cellspacing="0" border="0" style="width:100%">
                                        <tbody>
                                          <tr>
                                            <td class="border-me" style="padding:24px 0px 12px 0px">
                                              <div class="mktoText" id="hero-date-timeb29c98b4-7be1-44cf-b196-0ff1e11e3bbb">
                                                <table cellpadding="0" cellspacing="0" border="0" style="width:100%">
                                                  <tbody>
                                                    <tr>
                                                      <td align="center" style="border-radius:3px;vertical-align:top;min-width:24px;max-width:24px;width:24px" width="24" bgcolor="#1a73e8" class="mktoText" id="ctaContent6fa0ac52-c25f-4856-bba7-63a4050698f6">
                                                        <div>
                                                          <a href="https://rsvp.withgoogle.com/events/arcade-facilitator/home" target="_blank" style="font-size:14px;line-height:18px;font-family:'Google Sans',Arial,sans-serif;color:#ffffff;text-decoration:none;border-radius:5px;padding:10px 16px 10px 16px;letter-spacing:1px;border:1px solid #1a73e8;display:inline-block;font-weight:500">Go
                                                            to Website</a>
                                                        </div>
                                                      </td>
                                                      <td width="10" style="line-height:24px"> </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </div>
                                              <table cellpadding="0" cellspacing="0" border="0" style="width:100%">
                                                <tbody>
                                                  <tr>
                                                    <td colspan="3" style="line-height:10px;font-size:10px">
                                                       
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                              <div class="mktoText" id="hero-locationb29c98b4-7be1-44cf-b196-0ff1e11e3bbb">
                                              </div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td width="265" style="width:265px;vertical-align:center" class="hom">
                              <div class="inner-img mktoText" id="emDesktopHeroImageb29c98b4-7be1-44cf-b196-0ff1e11e3bbb">
                                <a href="https://rsvp.withgoogle.com/events/arcade-facilitator/home" target="_blank"><img class="no-arrow" src="https://services.google.com/fh/files/emails/gcaf26_email_desktop_header.png" width="240" height="300" alt="" style="width: 240px; height: 300px; display: block; border: 0; Margin: 0;"></a>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <table class="mktoModule" id="contentModule" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;width:100%">
                <tbody>
                  <tr>
                    <td align="center" valign="top" style="padding:20px 40px 20px 40px" class="inner-container">
                      <table width="520" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:520px;width:100%">
                        <tbody style="color:#3c4043;font-family:'Google Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:24px;margin:0;text-align:left;word-break:break-word">
                          <tr>
                            <td>
                              
    <div style="font-size:18px;font-weight:bold;color:#ec4899;padding-bottom:10px">🚀 Cohort Kickoff Session</div>
    Hello ${name},
    <br><br>
    We are officially kicking off the challenge cohort! Access your student portal dashboard to view onboarding details, schedule times, and track your progress:
    <br><br>
    <div style="text-align:center;padding:15px 0">
      <a href="https://arcade-ops26--arcadeops-gcaf26.us-east4.hosted.app/" target="_blank" style="background-color:#ec4899;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;box-shadow:0 4px 6px rgba(236,72,153,0.15)">Open Student Portal 🚀</a>
    </div>
    <br>
    Please make sure your Google Skills and Developer profiles are configured and linked to your email:
    <br><br>
    <table cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:8px;border:1px solid #e0e0e0;background-color:#f8f9fa;font-weight:bold" width="50%">Sync Profile Email</td>
        <td style="padding:8px;border:1px solid #e0e0e0;color:#1a73e8;font-weight:bold" width="50%">${email}</td>
      </tr>
    </table>
    <br>
    Good luck, and let's get ready to become #GoogleCloudReady!
    
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
    
              <table class="mktoModule" id="signatureModule" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:600px;width:100%">
                <tbody>
                  <tr>
                    <td align="center" valign="top" style="padding:0px 40px 20px 40px" class="inner-container">
                      <table width="520" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:520px;width:100%">
                        <tbody style="color:#3c4043;font-family:'Google Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:24px;margin:0;text-align:left;word-break:break-word">
                          <tr>
                            <td>
                              <div style="border-top:1px solid #e0e0e0;padding-top:20px"></div>
                              <div style="font-weight:bold;color:#3c4043;padding-bottom:8px">Use the following resources to track and complete your labs:</div>
                              <ul style="margin:0;padding-left:20px">
                                <li style="padding-bottom:6px">Open the <a href="https://www.cloudskillsboost.google" target="_blank" style="color:#1a73e8;text-decoration:none">Google Cloud Skills Boost console</a> to start your next lab.</li>
                                <li style="padding-bottom:6px">Follow your customized Study Schedule calendar on your <a href="https://arcade-ops26--arcadeops-gcaf26.us-east4.hosted.app/" target="_blank" style="color:#1a73e8;text-decoration:none">student portal dashboard</a>.</li>
                                <li style="padding-bottom:6px">Join our official <a href="https://chat.whatsapp.com/LXsHWtnGXJACKOXwuhueBy" style="color:#1a73e8;text-decoration:none">WhatsApp community group</a> to ask questions and discuss with peers.</li>
                              </ul>
                              <br>
                              <div>As always, please feel free to ask any questions or queries by replying back to this email or on our <a href="https://chat.whatsapp.com/LXsHWtnGXJACKOXwuhueBy" style="text-decoration:none;color:#4285f4;font-weight:normal">WhatsApp community group</a>.</div>
                              <div style="padding-top:12px">All the best &amp; happy coding,</div>
                              <div style="padding-top:8px"></div>
                              <strong>Your Facilitator:</strong> ${facilitator_name}<br>
                              <strong>Email:</strong> <a href="mailto:${facilitator_email}" style="color:#1a73e8;text-decoration:none">${facilitator_email}</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
    <table class="mktoModule container" id="footerModule" width="600" border="0" cellpadding="0" cellspacing="0" style="width:600px">
        <tbody>
          <tr>
            <td style="padding:40px" class="pad-mobile">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tbody>
                  <tr>
                    <td style="padding-bottom:25px">
                      <div class="mktoImg" id="footerLogo">
                        <img src="https://lp.cloudplatformonline.com/rs/808-GJW-314/images/cloud-logo-footer.png" alt="Google Cloud" width="140" height="25">
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-family:'Roboto',sans-serif;font-size:12px;line-height:16px;color:#3c4043">
                      <div class="mktoText" id="footerText" style="font-family:'Roboto',sans-serif;font-size:12px;line-height:16px;color:#3c4043">
                        © 2026 Arcade Facilitator Cohort<br><br>
                        This email was sent by your Google Cloud Arcade Facilitator, ${facilitator_name} (${facilitator_email}). You are receiving this because you registered for the Google Cloud Ready / Arcade program under our facilitator cohort. If you do not wish to receive further progress updates, please reply directly to this email to opt out.<br><br>*By joining the community, you will be agreeing to the community guidelines for our <a href="https://chat.whatsapp.com/LXsHWtnGXJACKOXwuhueBy" style="text-decoration:none;color:#4285f4;font-weight:normal">WhatsApp community group</a>.                        
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:25px">
                      <div class="mktoText" id="footerSocial">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                            <tr>
                              <td style="padding-right:10px"> <a href="https://cloud.google.com/blog/"> <img src="https://lp.cloudplatformonline.com/rs/808-GJW-314/images/logo-blogger.png" alt="" width="30" height="30" style="margin: 0; display: block;">
                                </a> </td>
                              <td style="padding-right:10px"> <a href="https://github.com/GoogleCloudPlatform"> <img src="https://lp.cloudplatformonline.com/rs/808-GJW-314/images/icon-git.png" alt="" width="30" height="30" style="margin: 0; display: block;">
                                </a> </td>
                              <td style="padding-right:10px"> <a href="https://www.linkedin.com/company/google-cloud">
                                  <img src="https://lp.cloudplatformonline.com/rs/808-GJW-314/images/icon-linkedin.png" alt="" width="30" height="30" style="margin: 0; display: block;">
                                </a> </td>
                              <td style="padding-right:10px"> <a href="https://twitter.com/googlecloud"> <img src="https://lp.cloudplatformonline.com/rs/808-GJW-314/images/icon-twitter.png" alt="" width="30" height="30" style="margin: 0; display: block;">
                                </a> </td>
                              <td style="padding-right:10px"> <a href="https://www.facebook.com/googlecloud"> <img src="https://lp.cloudplatformonline.com/rs/808-GJW-314/images/icon-facebook.png" alt="" width="30" height="30" style="margin: 0; display: block;">
                                </a> </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      
    </div>
  </center>
</body>

</html>`;

  const mailOptions = {
    from: `"Google Cloud Arcade" <${GMAIL_USER}>`,
    to: "vinaysiddha.20@gmail.com",
    subject: "Google Skills Challenge Kickoff Event!",
    html: rawHtml
  };

  console.log("Attempting to send email...");
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: " + info.messageId);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

main();
