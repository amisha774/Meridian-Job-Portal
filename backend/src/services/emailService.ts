import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env.ts';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
  return transporter;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  try {
    const client = getTransporter();
    if (!client) {
      // Gracefully skip external SMTP when not configured in local dev
      console.log(`[Email Preview] To: ${payload.to} | Subject: ${payload.subject}`);
      return;
    }

    await client.sendMail({
      from: env.smtp.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
  } catch (err) {
    console.warn('[Email] Delivery skipped:', (err as Error).message);
  }
}
