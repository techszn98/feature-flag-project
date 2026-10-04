const { email: emailConfig } = require('../../config/env');
const {
  welcomeTemplate,
  verificationOtpTemplate,
  passwordResetTemplate,
  passwordChangedTemplate,
  googleWelcomeTemplate,
} = require('./email.templates');

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send over HTTPS (Brevo API). Render's free tier blocks SMTP ports,
 * but outbound HTTPS works. Never throws: returns { success, ... }.
 */
async function sendMailSafely({ to, subject, html, text }) {
  if (process.env.NODE_ENV === 'test') {
    return { success: true, messageId: 'test-mock-message-id' };
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('[EmailService] BREVO_API_KEY is not set');
    return { success: false, error: 'Email provider is not configured' };
  }

  try {
    const response = await fetch(BREVO_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: emailConfig.fromName, email: emailConfig.fromAddress },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
      signal: AbortSignal.timeout(10000), // don't let registration hang
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(`Brevo ${response.status}: ${body.message || 'request failed'}`);
    }
    return { success: true, messageId: body.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function sendWelcomeEmail({ to, name }) {
  const { subject, html, text } = welcomeTemplate({ name });
  return sendMailSafely({ to, subject, html, text });
}

async function sendVerificationOtpEmail({ to, name, otp }) {
  const { subject, html, text } = verificationOtpTemplate({ name, otp });
  return sendMailSafely({ to, subject, html, text });
}

async function sendPasswordResetEmail({ to, name, otp }) {
  const { subject, html, text } = passwordResetTemplate({ name, otp });
  return sendMailSafely({ to, subject, html, text });
}

async function sendPasswordChangedEmail({ to, name }) {
  const { subject, html, text } = passwordChangedTemplate({ name });
  return sendMailSafely({ to, subject, html, text });
}

async function sendGoogleWelcomeEmail({ to, name }) {
  const { subject, html, text } = googleWelcomeTemplate({ name });
  return sendMailSafely({ to, subject, html, text });
}

module.exports = {
  sendWelcomeEmail,
  sendVerificationOtpEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendGoogleWelcomeEmail,
  sendMailSafely,
};
