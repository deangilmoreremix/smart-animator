import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailWithTracking extends EmailMessage {
  trackingId?: string;
  trackingPixelUrl?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private defaultFrom: string = 'noreply@smartanimator.com';

  configure(config: EmailConfig, fromEmail?: string) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });

    if (fromEmail) {
      this.defaultFrom = fromEmail;
    }
  }

  configureGmail(email: string, password: string) {
    this.configure({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password,
      },
    }, email);
  }

  configureOutlook(email: string, password: string) {
    this.configure({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password,
      },
    }, email);
  }

  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Email service not configured. Please configure SMTP settings first.',
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: message.from || this.defaultFrom,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text || this.stripHtml(message.html),
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  async sendEmailWithTracking(message: EmailWithTracking): Promise<{ success: boolean; messageId?: string; error?: string }> {
    let html = message.html;

    if (message.trackingPixelUrl) {
      html += `<img src="${message.trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />`;
    }

    if (message.trackingId) {
      html = this.addClickTracking(html, message.trackingId);
    }

    return this.sendEmail({
      ...message,
      html,
    });
  }

  private addClickTracking(html: string, trackingId: string): string {
    const trackingBaseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
    const trackingUrl = `${trackingBaseUrl}/api/track/click/${trackingId}`;

    return html.replace(
      /<a\s+href="([^"]+)"/gi,
      (match, url) => {
        const encodedUrl = encodeURIComponent(url);
        return `<a href="${trackingUrl}?url=${encodedUrl}"`;
      }
    );
  }

  createEmailTemplate(
    videoUrl: string,
    videoTitle: string,
    personalizedMessage: string,
    recipientName?: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${videoTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              ${recipientName ? `<p style="margin: 0 0 20px 0; font-size: 16px; color: #111827;">Hi ${recipientName},</p>` : ''}
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                ${personalizedMessage}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="position: relative; width: 100%; padding-bottom: 56.25%; background-color: #000; border-radius: 8px; overflow: hidden;">
                <a href="${videoUrl}" style="display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background-color: rgba(59, 130, 246, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 0; height: 0; border-left: 25px solid white; border-top: 15px solid transparent; border-bottom: 15px solid transparent; margin-left: 8px;"></div>
                  </div>
                </a>
              </div>
              <div style="text-align: center; margin-top: 24px;">
                <a href="${videoUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Watch Video
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">
                Created with Smart Animator
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection verification failed:', error);
      return false;
    }
  }

  getStatus(): { configured: boolean; from?: string } {
    return {
      configured: this.transporter !== null,
      from: this.defaultFrom,
    };
  }
}

export const emailService = new EmailService();
