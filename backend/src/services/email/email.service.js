const transporter = require('../../config/mail');
const { email: emailConfig } = require('../../config/env');
const {
  welcomeTemplate,
  verificationOtpTemplate,
  passwordResetTemplate,
  passwordChangedTemplate,
  googleWelcomeTemplate,
} = require('./email.templates');

const from = {
  name: emailConfig.fromName,
  address: emailConfig.fromAddress,
};

/**
 * Dispatch an email safely without leaking credentials or terminating parent process on network errors
 */
async function sendMailSafely(options) {
  if (process.env.NODE_ENV === 'test') {
    // In test environment, skip external SMTP to prevent hitting third-party rate limits
    return { success: true, messageId: 'test-mock-message-id' };
  }

  try {
    const info = await transporter.sendMail({
      from,
      ...options,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log the operational error server-side without exposing credentials to caller
    console.error(`[EmailService] Failed to send email to ${options.to}:`, error.message);
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
