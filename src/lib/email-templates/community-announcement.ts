import { buildEmailHtml, emailDetailRow, emailInfoBox, emailSignature } from '@/lib/email-base';

export function communityAnnouncementTemplate(title: string, message: string): { subject: string; html: string } {
  const bodyHtml = `
    <p style="margin:0 0 16px 0;font-weight:700;font-size:18px;color:#202124;">${title}</p>
    <p style="margin:0 0 24px 0;">${message}</p>
    <p style="margin:0 0 24px 0;font-size:13px;color:#80868b;">
      You're receiving this because you have email notifications enabled. 
      Manage preferences in your profile settings.
    </p>
    ${emailSignature('MLSC SVEC Team')}
  `;

  return {
    subject: `MLSC Announcement: ${title}`,
    html: buildEmailHtml({
      eyebrow: '#MLSC4.0 · Community Announcement',
      headline: title,
      ctaLabel: 'Visit MLSC Hub →',
      ctaUrl: 'https://mlscsvec.com',
      accentColor: '#4285F4',
      bodyHtml,
    }),
  };
}
