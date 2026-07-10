import nodemailer from 'nodemailer';
import { config } from '../config/index';
import { logger } from '../logger/index';

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    // Prefer EMAIL_ prefixed vars, fallback to SMTP_ for backward compatibility
    const host = config.EMAIL_HOST || config.SMTP_HOST;
    const port = config.EMAIL_PORT || config.SMTP_PORT || 587;
    const user = config.EMAIL_USER || config.SMTP_USER;
    const pass = config.EMAIL_PASS || config.SMTP_PASS;
    const from = config.EMAIL_FROM || config.SMTP_FROM || '"PC INFOTECH Support" <no-reply@pcinfotech.com>';

    // If credentials are not configured, print to logs/console as fallback (for dev)
    if (!host || !user || !pass) {
      logger.warn(
        `🚨 SMTP is not configured. Logging email instead:\n` +
        `-----------------------------------------\n` +
        `To: ${to}\n` +
        `Subject: ${subject}\n` +
        `Content: ${html.replace(/<[^>]*>/g, '')}\n` +
        `-----------------------------------------`
      );
      return true;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587 (STARTTLS)
      auth: { user, pass },
    });

    const info = await transporter.sendMail({ from, to, subject, html });

    logger.info(`📧 Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error: any) {
    logger.error(`❌ Error sending email to ${to}: ${error.message}`);
    return false;
  }
};
