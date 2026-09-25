const { SUBJECTS } = require('./email.constants');

const baseWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feature Flag API</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #172b4d;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden;">
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">Feature Flag API</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0;">This is an automated security transmission from Feature Flag API. Please do not reply directly to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

function welcomeTemplate({ name }) {
  const recipient = name || 'there';
  const text = `Hi ${recipient},

Welcome to Feature Flag API! Your account has been registered successfully.
To access protected project management and feature flag operations, please ensure your email is verified.

If you have any questions or did not initiate this registration, please contact our support team.

The Feature Flag API Team`;

  const html = baseWrapper(`
    <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">Welcome to Feature Flag API!</h2>
    <p>Hi ${recipient},</p>
    <p>Your account has been registered successfully. You're ready to start building and managing powerful dynamic feature flags across your applications and environments.</p>
    <p style="margin-top: 24px;"><strong>Next step:</strong> Please verify your email address using the one-time code sent to your inbox to unlock all platform capabilities.</p>
    <p style="margin-top: 28px; color: #64748b; font-size: 13px;">If you did not register for an account, please disregard this email or notify security.</p>
  `);

  return { subject: SUBJECTS.WELCOME, html, text };
}

function verificationOtpTemplate({ name, otp }) {
  const recipient = name || 'there';
  const text = `Hi ${recipient},

Your Feature Flag API verification code is: ${otp}

This code will expire in 10 minutes.
For security reasons, never share this code or your password with anyone.

If you did not request this verification, you can safely ignore this email.

The Feature Flag API Team`;

  const html = baseWrapper(`
    <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">Verify your email address</h2>
    <p>Hi ${recipient},</p>
    <p>Please enter the following one-time verification code to confirm your email address and activate your account:</p>
    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 28px 0;">
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">${otp}</span>
    </div>
    <p style="color: #475569; font-size: 14px;">⏱️ This code will expire in <strong>10 minutes</strong>.</p>
    <p style="color: #64748b; font-size: 13px; margin-top: 24px;">If you did not request this verification code, please ignore this email.</p>
  `);

  return { subject: SUBJECTS.VERIFY_EMAIL, html, text };
}

function passwordResetTemplate({ name, otp }) {
  const recipient = name || 'there';
  const text = `Hi ${recipient},

We received a request to reset the password for your Feature Flag API account.

Your password reset code is: ${otp}

This code will expire in 10 minutes.
If you did not request a password reset, please secure your account immediately.

The Feature Flag API Team`;

  const html = baseWrapper(`
    <h2 style="margin-top: 0; color: #dc2626; font-size: 22px;">Reset your password</h2>
    <p>Hi ${recipient},</p>
    <p>We received a request to reset the password for your account. Use the one-time code below to complete the reset process:</p>
    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; text-align: center; margin: 28px 0;">
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #b91c1c;">${otp}</span>
    </div>
    <p style="color: #475569; font-size: 14px;">⏱️ This code expires in <strong>10 minutes</strong> and can only be used once.</p>
    <p style="color: #dc2626; font-size: 13px; margin-top: 24px;"><strong>Security notice:</strong> If you did not make this request, someone else may be attempting to access your account. Please check your credentials.</p>
  `);

  return { subject: SUBJECTS.PASSWORD_RESET, html, text };
}

function passwordChangedTemplate({ name }) {
  const recipient = name || 'there';
  const time = new Date().toUTCString();
  const text = `Hi ${recipient},

Your Feature Flag API account password was successfully changed on ${time}.

If you made this change, no further action is required.
If you did NOT change your password, please contact our security team immediately to protect your account.

The Feature Flag API Team`;

  const html = baseWrapper(`
    <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">Your password was changed</h2>
    <p>Hi ${recipient},</p>
    <p>This is confirmation that the password for your Feature Flag API account was successfully changed on <strong>${time}</strong>.</p>
    <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #065f46; font-size: 14px;">All previous sessions and active refresh tokens have been revoked for your safety.</p>
    </div>
    <p style="color: #dc2626; font-size: 13px; margin-top: 24px;">If you did not initiate this change, please contact your administrator or support immediately.</p>
  `);

  return { subject: SUBJECTS.PASSWORD_CHANGED, html, text };
}

function googleWelcomeTemplate({ name }) {
  const recipient = name || 'there';
  const text = `Hi ${recipient},

Welcome to Feature Flag API! Your account was successfully created using Google Single Sign-On (SSO).
Your email address has been automatically verified through your Google Identity provider.

The Feature Flag API Team`;

  const html = baseWrapper(`
    <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">Welcome to Feature Flag API!</h2>
    <p>Hi ${recipient},</p>
    <p>Your account has been created via <strong>Google Single Sign-On (SSO)</strong>.</p>
    <p>Your email has been automatically verified through Google, giving you instant access to projects, environments, and feature flag management.</p>
    <p style="margin-top: 28px; color: #64748b; font-size: 13px;">If you did not authorize this sign-in, please revoke access in your Google Account security settings.</p>
  `);

  return { subject: SUBJECTS.GOOGLE_WELCOME, html, text };
}

module.exports = {
  welcomeTemplate,
  verificationOtpTemplate,
  passwordResetTemplate,
  passwordChangedTemplate,
  googleWelcomeTemplate,
};
