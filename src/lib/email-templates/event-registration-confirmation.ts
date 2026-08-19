import { buildEmailHtml, emailDetailRow, emailSignature } from '@/lib/email-base';

export function eventRegistrationConfirmationTemplate(data: {
  customerName: string;
  eventTitle: string;
  amount: number;
  orderId: string;
  date: string;
  venue: string;
  time: string;
  eventLink?: string;
}): { subject: string; html: string } {
  const detailsTable = `
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        ${emailDetailRow('Event Title', data.eventTitle)}
        ${emailDetailRow('Date', data.date)}
        ${emailDetailRow('Time', data.time)}
        ${emailDetailRow('Venue', data.venue)}
        ${emailDetailRow('Ticket Reference', `<span style="font-family:monospace;font-weight:700;">${data.orderId}</span>`)}
        ${data.amount > 0 ? emailDetailRow('Fee Paid', `<span style="color:#34A853;font-weight:700;">₹${data.amount}.00</span>`) : emailDetailRow('Entry', 'Free Registration')}
      </tbody>
    </table>`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(data.orderId)}&margin=10&color=333333`;

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello <strong>${data.customerName}</strong>,</p>
    <p style="margin:0 0 20px 0;">
      Your seat for <strong style="color:#34A853;">${data.eventTitle}</strong> has been confirmed!
      ${data.amount > 0
        ? ` We have received your registration payment of <strong style="color:#34A853;">₹${data.amount}</strong>.`
        : ' This is a free entry registration.'}
    </p>

    <!-- Event Details Box -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0"
      style="border-radius:10px;border:1px solid #e0e0e0;background:#f8f9fa;margin:0 0 24px 0;">
      <tbody>
        <tr>
          <td style="padding:20px;">
            <p style="margin:0 0 12px 0;font-family:'Google Sans',Arial,sans-serif;font-size:11px;font-weight:500;color:#5f6368;letter-spacing:1.5px;text-transform:uppercase;">Event &amp; Pass Details</p>
            ${detailsTable}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Digital QR Ticket -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0"
      style="border-radius:10px;border:2px dashed #34A853;background:#fcfcfc;margin:0 0 24px 0;">
      <tbody>
        <tr>
          <td align="center" style="padding:24px 20px;">
            <p style="margin:0 0 12px 0;font-family:'Google Sans',Arial,sans-serif;font-size:11px;font-weight:700;color:#34A853;letter-spacing:2px;text-transform:uppercase;">Digital Entrance Ticket</p>
            <img
              src="${qrCodeUrl}"
              alt="QR Code Pass"
              width="160" height="160"
              style="display:block;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;background:#ffffff;"
            />
            <p style="margin:12px 0 0 0;font-family:monospace;font-size:14px;color:#202124;font-weight:700;letter-spacing:0.5px;">${data.orderId}</p>
            <p style="margin:6px 0 0 0;font-family:'Roboto',Arial,sans-serif;font-size:12px;color:#80868b;">Present this QR code at the venue entrance for entry verification.</p>
          </td>
        </tr>
      </tbody>
    </table>

    ${data.eventLink ? `
    <!-- WhatsApp Group CTA -->
    <table width="100%" cellspacing="0" cellpadding="0" border="0"
      style="border-radius:10px;border:1px solid #bbf7d0;background:#f0fdf4;margin:0 0 24px 0;">
      <tbody>
        <tr>
          <td align="center" style="padding:20px;">
            <p style="margin:0 0 12px 0;font-family:'Google Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#166534;">
              📲 Join the Event WhatsApp Group
            </p>
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" bgcolor="#25D366" style="border-radius:6px;padding:10px 20px;">
                  <a href="${data.eventLink}" target="_blank"
                    style="font-size:14px;font-family:'Google Sans',Arial,sans-serif;
                      color:#ffffff;text-decoration:none;font-weight:600;display:inline-block;">
                    Join WhatsApp Group →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>` : ''}

    <p style="margin:0 0 24px 0;font-size:14px;color:#5f6368;text-align:center;">
      Please present this email or your Ticket Reference ID at the entry desk for scanning.
    </p>
    ${emailSignature('MLSC SVEC Team')}
  `;

  return {
    subject: `Registration Confirmed: ${data.eventTitle} — MLSC SVEC ✅`,
    html: buildEmailHtml({
      eyebrow: '#MLSC4.0 · Event Registration',
      headline: `Seat Confirmed, ${data.customerName}! ✅`,
      ctaLabel: 'View Event Details →',
      ctaUrl: 'https://mlscsvec.com/events',
      accentColor: '#34A853',
      bodyHtml,
    }),
  };
}
