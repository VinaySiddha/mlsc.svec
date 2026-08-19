import { buildEmailHtml, emailDetailRow, emailSignature } from '@/lib/email-base';

export function welcomeEmailTemplate(name: string): { subject: string; html: string } {
  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Hello <strong>${name}</strong>,</p>
    <p style="margin:0 0 20px 0;">
      Thank you for joining the <strong>Microsoft Learn Student Club</strong> at Sri Vasavi Engineering College. 
      We're thrilled to have you with us!
    </p>
    <p style="margin:0 0 10px 0;font-weight:700;color:#202124;">Here's what you can do now:</p>
    <ul style="margin:0 0 24px 0;padding-left:20px;color:#3c4043;line-height:26px;">
      <li style="padding-bottom:6px;">Browse and register for upcoming <strong>events</strong></li>
      <li style="padding-bottom:6px;">Join the <strong>community</strong> to discuss topics with fellow students</li>
      <li style="padding-bottom:6px;">Complete your <strong>profile</strong> to let others know about you</li>
    </ul>
    ${emailSignature('MLSC SVEC Team')}
  `;

  return {
    subject: 'Welcome to MLSC SVEC! 🚀',
    html: buildEmailHtml({
      eyebrow: '#MLSC4.0 · Welcome',
      headline: `Welcome to MLSC, ${name}! 🚀`,
      ctaLabel: 'Visit Community →',
      ctaUrl: 'https://mlscsvec.com/community',
      accentColor: '#4285F4',
      bodyHtml,
    }),
  };
}
