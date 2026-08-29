import nodemailer from 'nodemailer';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || `"SID Managed Cloud" <${user || 'no-reply@localhost'}>`;

  if (!host || !user || !pass) {
    console.warn('⚠️ SMTP configuration is missing (SMTP_HOST, SMTP_USER, SMTP_PASSWORD). Logging email to console:');
    console.log(`\n========================================\n[EMAIL TO]: ${to}\n[SUBJECT]: ${subject}\n========================================\n`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
      connectionTimeout: 5000, // 5s timeout
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('❌ Failed to send email via SMTP:', err);
    console.log(`\n========================================\n[FALLBACK EMAIL TO]: ${to}\n[SUBJECT]: ${subject}\n========================================\n`);
  }
}

export async function sendOtpEmail(email: string, code: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #1f2937; margin-bottom: 6px;">Verify your email</h2>
      <p style="color: #4b5563; font-size: 14px; margin-bottom: 24px;">Use the following one-time code to sign in to your SID Managed Cloud account. This code is valid for 10 minutes.</p>
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #7c3aed; background-color: #f3e8ff; padding: 12px 24px; border-radius: 8px; font-family: monospace;">${code}</span>
      </div>
      <p style="color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; padding-top: 16px; margin: 0;">If you did not request this code, you can safely ignore this email.</p>
    </div>
  `;

  await sendMail({
    to: email,
    subject: `Your Verification Code: ${code}`,
    html,
  });
}
