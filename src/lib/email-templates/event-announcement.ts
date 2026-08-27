import { buildEmailHtml, emailDetailRow, emailSignature } from '@/lib/email-base';

export function eventAnnouncementTemplate(eventName: string, eventDate: string, description: string): { subject: string; html: string } {
  const detailsTable = `
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tbody>
        ${emailDetailRow('Event', eventName)}
        ${emailDetailRow('Date', eventDate)}
      </tbody>
    </table>`;

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">
      We're excited to announce a new event: <strong>${eventName}</strong>
    </p>
    <p style="margin:0 0 20px 0;">${description}</p>
    <table width="100%" cellspacing="0" cellpadding="0" border="0"
      style="border-radius:10px;border:1px solid #e0e0e0;background:#f8f9fa;margin:0 0 24px 0;">
      <tbody>
        <tr>
          <td style="padding:20px;">
            <p style="margin:0 0 12px 0;font-family:'Google Sans',Arial,sans-serif;font-size:11px;font-weight:500;color:#5f6368;letter-spacing:1.5px;text-transform:uppercase;">Event Details</p>
            ${detailsTable}
          </td>
        </tr>
      </tbody>
    </table>
    <p style="margin:0 0 24px 0;font-size:13px;color:#80868b;">
      You're receiving this because you have email notifications enabled. Manage preferences in your profile settings.
    </p>
    ${emailSignature('MLSC Events Team')}
  `;

  return {
    subject: `New Event: ${eventName} 🎉`,
    html: buildEmailHtml({
      eyebrow: '#MLSC4.0 · Event Announcement',
      headline: `New Event: ${eventName} 🎉`,
      ctaLabel: 'View Events →',
      ctaUrl: 'https://mlscsvec.com/events',
      accentColor: '#4285F4',
      bodyHtml,
    }),
  };
}
