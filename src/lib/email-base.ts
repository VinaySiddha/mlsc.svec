/**
 * @fileOverview Shared Google-Arcade-styled HTML email base layout for all MLSC email flows.
 * Provides consistent fonts, CSS resets, table-based layout, and header/footer structure.
 */

const FONT_FACE = `
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
`;

/** Wraps any HTML body content in the shared Google-Arcade-styled shell. */
export function buildEmailHtml({
  eyebrow = '#MLSC4.0 · Microsoft Learn Student Chapter',
  headline,
  ctaLabel,
  ctaUrl,
  accentColor = '#4285F4',
  bodyHtml,
}: {
  eyebrow?: string;
  headline: string;
  ctaLabel?: string;
  ctaUrl?: string;
  accentColor?: string;
  bodyHtml: string;
}): string {
  const ctaButton = ctaLabel && ctaUrl
    ? `<table cellpadding="0" cellspacing="0" border="0">
        <tbody>
          <tr>
            <td align="center" style="border-radius:6px;" bgcolor="${accentColor}">
              <a href="${ctaUrl}" target="_blank"
                style="font-size:14px;line-height:18px;
                  font-family:'Google Sans',Arial,sans-serif;
                  color:#ffffff;text-decoration:none;border-radius:6px;
                  padding:10px 20px;display:inline-block;font-weight:500;
                  letter-spacing:0.5px;border:1px solid ${accentColor};">
                ${ctaLabel}
              </a>
            </td>
          </tr>
        </tbody>
      </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>MLSC SVEC</title>
  <style type="text/css">${FONT_FACE}</style>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;">
  <center>
    <table width="600" class="container" cellspacing="0" cellpadding="0" border="0" align="center"
      style="max-width:600px;width:100%;background-color:#ffffff;word-break:break-word;">
      <tbody>
        <tr>
          <td align="center" valign="top">

            <!-- HEADER -->
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

            <!-- HERO -->
            <table width="600" cellspacing="0" cellpadding="0" border="0" align="center"
              style="max-width:600px;width:100%;border-bottom:solid 1px #d7d7d7;">
              <tbody>
                <tr>
                  <td align="left" valign="top" style="padding:32px 40px 28px 40px;" class="hero-text">
                    <p style="margin:0 0 8px 0;font-family:'Google Sans','Roboto',Helvetica,Arial,sans-serif;
                      font-size:13px;font-weight:400;line-height:20px;color:#5f6368;">
                      ${eyebrow}
                    </p>
                    <h1 style="margin:0 0 20px 0;font-family:'Google Sans','Roboto',Helvetica,Arial,sans-serif;
                      font-size:28px;font-weight:700;line-height:36px;color:#202124;">
                      ${headline}
                    </h1>
                    ${ctaButton}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- CONTENT -->
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
                            ${bodyHtml}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- FOOTER -->
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
                            This is an automated email. Please do not reply directly to this message.
                            For support, contact us at microsoftlearnstudentclub@gmail.com.
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
}

/** Reusable detail row for info tables inside email body */
export function emailDetailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:7px 0;color:#5f6368;font-family:'Roboto',Arial,sans-serif;font-size:13px;font-weight:500;border-bottom:1px solid #f1f3f4;">${label}</td>
    <td style="padding:7px 0;text-align:right;color:#202124;font-family:'Google Sans',Arial,sans-serif;font-size:13px;font-weight:700;border-bottom:1px solid #f1f3f4;">${value}</td>
  </tr>`;
}

/** Standard info-box/card used for reference IDs, event details etc. */
export function emailInfoBox(contentHtml: string): string {
  return `<table width="100%" cellspacing="0" cellpadding="0" border="0"
    style="border-radius:10px;border:1px solid #e0e0e0;background:#f8f9fa;margin:0 0 24px 0;">
    <tbody>
      <tr>
        <td style="padding:20px;">
          ${contentHtml}
        </td>
      </tr>
    </tbody>
  </table>`;
}

/** Blue/accent badge for reference IDs, status pills etc. */
export function emailBadge(text: string, color = '#4285F4'): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td align="center" bgcolor="${color}" style="border-radius:8px;padding:10px 24px;">
        <span style="color:#ffffff;font-weight:700;font-family:monospace;font-size:18px;letter-spacing:1.5px;">${text}</span>
      </td>
    </tr>
  </table>`;
}

/** Closing signature block */
export function emailSignature(teamName = 'MLSC 4.0 Recruitment Team'): string {
  return `<div style="border-top:1px solid #e0e0e0;padding-top:20px;margin-top:8px;">
    <p style="margin:0 0 4px 0;font-size:14px;color:#5f6368;">All the best &amp; happy building,</p>
    <p style="margin:0;font-size:15px;font-weight:700;font-family:'Google Sans',Arial,sans-serif;color:#202124;">${teamName}</p>
  </div>`;
}
