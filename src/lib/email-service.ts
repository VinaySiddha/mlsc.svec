/**
 * Email service compatible with Cloudflare Workers
 * Replaces nodemailer functionality using fetch API
 */

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface EmailProvider {
  send(options: EmailOptions): Promise<boolean>;
}

/**
 * SendGrid email provider for Cloudflare Workers
 */
export class SendGridProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async send(options: EmailOptions): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: options.to }],
              subject: options.subject,
            },
          ],
          from: { email: this.fromEmail },
          content: [
            {
              type: options.html ? 'text/html' : 'text/plain',
              value: options.html || options.text || '',
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }
}

/**
 * Resend email provider for Cloudflare Workers
 */
export class ResendProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async send(options: EmailOptions): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Resend email error:', error);
      return false;
    }
  }
}

/**
 * Mailgun email provider for Cloudflare Workers
 */
export class MailgunProvider implements EmailProvider {
  private apiKey: string;
  private domain: string;
  private fromEmail: string;

  constructor(apiKey: string, domain: string, fromEmail: string) {
    this.apiKey = apiKey;
    this.domain = domain;
    this.fromEmail = fromEmail;
  }

  async send(options: EmailOptions): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('from', this.fromEmail);
      formData.append('to', options.to);
      formData.append('subject', options.subject);
      
      if (options.html) {
        formData.append('html', options.html);
      }
      if (options.text) {
        formData.append('text', options.text);
      }

      const response = await fetch(
        `https://api.mailgun.net/v3/${this.domain}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`api:${this.apiKey}`)}`,
          },
          body: formData,
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Mailgun email error:', error);
      return false;
    }
  }
}

/**
 * Email service factory
 */
export class EmailService {
  private provider: EmailProvider;

  constructor(provider: EmailProvider) {
    this.provider = provider;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    return this.provider.send(options);
  }

  static create(): EmailService {
    // Choose provider based on environment variables
    const sendgridKey = process.env.SENDGRID_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    const mailgunKey = process.env.MAILGUN_API_KEY;
    const mailgunDomain = process.env.MAILGUN_DOMAIN;
    const fromEmail = process.env.FROM_EMAIL || 'noreply@mlscsvec.in';

    if (sendgridKey) {
      return new EmailService(new SendGridProvider(sendgridKey, fromEmail));
    } else if (resendKey) {
      return new EmailService(new ResendProvider(resendKey, fromEmail));
    } else if (mailgunKey && mailgunDomain) {
      return new EmailService(new MailgunProvider(mailgunKey, mailgunDomain, fromEmail));
    } else {
      throw new Error('No email provider configured. Please set SENDGRID_API_KEY, RESEND_API_KEY, or MAILGUN_API_KEY');
    }
  }
}

export default EmailService;
