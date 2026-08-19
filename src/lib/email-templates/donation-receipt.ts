import { buildEmailHtml, emailDetailRow, emailSignature } from '@/lib/email-base';

export function donationReceiptEmailTemplate(data: {
  customerName: string;
  amount: number;
  orderId: string;
  date: string;
  purpose?: string;
}): { subject: string; html: string } {
  const purposeText = data.purpose ? ` for "${data.purpose}"` : '';
  const subjectLine = data.purpose
    ? `Payment Receipt - ${data.purpose} - MLSC SVEC`
    : 'Donation Receipt - Thank you for supporting MLSC SVEC! 💜';

  const detailsTable = `
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        ${emailDetailRow('Receipt Number', data.orderId)}
        ${data.purpose ? emailDetailRow('Purpose', data.purpose.toUpperCase()) : ''}
        ${emailDetailRow('Amount Received', `₹${data.amount}`)}
        ${emailDetailRow('Date', data.date)}
        ${emailDetailRow('Payment Gateway', 'Cashfree PG')}
        ${emailDetailRow('Status', '✅ Successful')}
      </tbody>
    </table>`;

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello <strong>${data.customerName}</strong>,</p>
    <p style="margin:0 0 20px 0;">
      We have successfully received your contribution of 
      <strong style="color:#7C3AED;font-size:17px;">₹${data.amount}</strong>${purposeText} to the 
      <strong>Microsoft Learn Student Chapter SVEC</strong>. Your support directly helps us fund 
      cloud server hosting, hands-on hardware workshop kits, and prizes for student hackathons.
    </p>
    <table width="100%" cellspacing="0" cellpadding="0" border="0"
      style="border-radius:10px;border:1px solid #e0e0e0;background:#f8f9fa;margin:0 0 24px 0;">
      <tbody>
        <tr>
          <td style="padding:20px;">
            <p style="margin:0 0 12px 0;font-family:'Google Sans',Arial,sans-serif;font-size:11px;font-weight:500;color:#5f6368;letter-spacing:1.5px;text-transform:uppercase;">Transaction Details</p>
            ${detailsTable}
          </td>
        </tr>
      </tbody>
    </table>
    <p style="margin:0 0 24px 0;font-size:14px;color:#5f6368;text-align:center;">
      As a supporter, you are featured on our website's supporters ledger. Thank you for empowering student developers!
    </p>
    ${emailSignature('MLSC SVEC Team')}
  `;

  return {
    subject: subjectLine,
    html: buildEmailHtml({
      eyebrow: '#MLSC4.0 · Donation Receipt',
      headline: `Thank you, ${data.customerName}! 💜`,
      ctaLabel: 'Explore Roadmaps →',
      ctaUrl: 'https://mlscsvec.com/study',
      accentColor: '#7C3AED',
      bodyHtml,
    }),
  };
}
