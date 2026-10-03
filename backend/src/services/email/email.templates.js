const { SUBJECTS } = require("./email.constants");

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

const recipientName = (name) => escapeHtml(name || "there");

const baseWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Feature Flag API</title>
</head>
<body style="margin:0;padding:0;background-color:#f2f5fb;font-family:Arial,Helvetica,sans-serif;color:#152340;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f2f5fb;">
    <tr>
      <td align="center" style="padding:36px 14px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #d8e0ed;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px 30px;background-color:#101f39;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="40" height="40" align="center" valign="middle" style="width:40px;height:40px;border-radius:9px;background-color:#3954d7;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:700;">F</td>
                  <td style="padding-left:12px;">
                    <div style="color:#ffffff;font-size:16px;font-weight:700;line-height:1.25;">Feature Flag API</div>
                    <div style="padding-top:4px;color:#aab9d1;font-size:9px;font-weight:700;letter-spacing:1px;">SELF-HOSTED COMMUNITY EDITION</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 30px 30px;line-height:1.6;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:19px 30px;background-color:#f8faff;border-top:1px solid #e3e9f3;">
              <p style="margin:0;color:#657590;font-size:11px;line-height:1.6;">Feature control for your applications, through a developer-focused API.</p>
              <p style="margin:7px 0 0;color:#8794a8;font-size:10px;line-height:1.6;">This is an automated message from Feature Flag API. Please do not reply directly to this email.</p>
            </td>
          </tr>
        </table>
        <div style="padding:14px 8px 0;color:#8492a8;font-size:10px;line-height:1.5;text-align:center;">Feature Flag API · Community Edition</div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

function welcomeTemplate({ name }) {
  const recipient = name || "there";
  const safeRecipient = recipientName(name);
  const text = `Hi ${recipient},

Welcome to Feature Flag API! Your account has been registered successfully.
To access protected project management and feature flag operations, please verify your email address with the code sent to your inbox.

If you did not register for an account, you can safely ignore this email.

The Feature Flag API Team`;

  const html = baseWrapper(`
    <div style="margin:0 0 12px;color:#3954d7;font-size:10px;font-weight:700;letter-spacing:1px;">YOUR WORKSPACE IS READY</div>
    <h1 style="margin:0 0 12px;color:#152340;font-size:25px;font-weight:700;line-height:1.25;">Welcome to Feature Flag API</h1>
    <p style="margin:0 0 18px;color:#566985;font-size:14px;">Hi ${safeRecipient}, your account has been created. Verify your email to unlock project and feature-flag management.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:22px 0;border:1px solid #d8e0ed;border-radius:8px;background-color:#f8faff;">
      <tr><td style="padding:15px 16px;color:#233653;font-size:12px;line-height:1.5;"><strong style="color:#3954d7;">NEXT STEP</strong><br>Enter the one-time code from your verification email to confirm your address.</td></tr>
    </table>
    <p style="margin:20px 0 0;color:#8290a5;font-size:11px;line-height:1.6;">If you did not create this account, you can safely ignore this message.</p>
  `);

  return { subject: SUBJECTS.WELCOME, html, text };
}

function verificationOtpTemplate({ name, otp }) {
  const recipient = name || "there";
  const safeRecipient = recipientName(name);
  const safeOtp = escapeHtml(otp);
  const text = `Hi ${recipient},

Your Feature Flag API verification code is: ${otp}

This code will expire in 10 minutes. For security reasons, never share this code or your password with anyone.

If you did not request this verification, you can safely ignore this email.

The Feature Flag API Team`;

  const html = baseWrapper(`
    <div style="margin:0 0 12px;color:#3954d7;font-size:10px;font-weight:700;letter-spacing:1px;">ACCOUNT VERIFICATION</div>
    <h1 style="margin:0 0 12px;color:#152340;font-size:25px;font-weight:700;line-height:1.25;">Verify your email address</h1>
    <p style="margin:0 0 20px;color:#566985;font-size:14px;">Hi ${safeRecipient}, enter this one-time code to confirm your email and activate your account.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:22px 0;border:1px solid #ccd7ff;border-radius:9px;background-color:#f0f3ff;">
      <tr><td align="center" style="padding:20px 12px 18px;">
        <div style="margin-bottom:8px;color:#667697;font-size:9px;font-weight:700;letter-spacing:1px;">YOUR VERIFICATION CODE</div>
        <div style="color:#3450d4;font-family:Courier New,Courier,monospace;font-size:34px;font-weight:700;letter-spacing:8px;line-height:1.3;">${safeOtp}</div>
      </td></tr>
    </table>
    <p style="margin:0;color:#566985;font-size:12px;">This code expires in <strong style="color:#233653;">10 minutes</strong>.</p>
    <p style="margin:18px 0 0;color:#8290a5;font-size:11px;line-height:1.6;">For your security, never share this code. If you did not request it, you can safely ignore this email.</p>
  `);

  return { subject: SUBJECTS.VERIFY_EMAIL, html, text };
}

function passwordResetTemplate({ name, otp }) {
  const recipient = name || "there";
  const safeRecipient = recipientName(name);
  const safeOtp = escapeHtml(otp);
  const text = `Hi ${recipient},

We received a request to reset the password for your Feature Flag API account.

Your password reset code is: ${otp}

This code will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.

The Feature Flag API Team`;

  const html = baseWrapper(`
    <div style="margin:0 0 12px;color:#b43c50;font-size:10px;font-weight:700;letter-spacing:1px;">ACCOUNT SECURITY</div>
    <h1 style="margin:0 0 12px;color:#152340;font-size:25px;font-weight:700;line-height:1.25;">Reset your password</h1>
    <p style="margin:0 0 20px;color:#566985;font-size:14px;">Hi ${safeRecipient}, we received a request to reset your Feature Flag API password. Use this one-time code to continue.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:22px 0;border:1px solid #f0cbd1;border-radius:9px;background-color:#fff5f6;">
      <tr><td align="center" style="padding:20px 12px 18px;">
        <div style="margin-bottom:8px;color:#986d76;font-size:9px;font-weight:700;letter-spacing:1px;">PASSWORD RESET CODE</div>
        <div style="color:#b43c50;font-family:Courier New,Courier,monospace;font-size:34px;font-weight:700;letter-spacing:8px;line-height:1.3;">${safeOtp}</div>
      </td></tr>
    </table>
    <p style="margin:0;color:#566985;font-size:12px;">This code expires in <strong style="color:#233653;">10 minutes</strong> and can only be used once.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:20px 0 0;border-left:3px solid #c34b5e;background-color:#fff7f8;">
      <tr><td style="padding:12px 14px;color:#7e4650;font-size:11px;line-height:1.6;"><strong>Didn’t request this?</strong> Ignore this email; your password will remain unchanged.</td></tr>
    </table>
  `);

  return { subject: SUBJECTS.PASSWORD_RESET, html, text };
}

function passwordChangedTemplate({ name }) {
  const recipient = name || "there";
  const safeRecipient = recipientName(name);
  const time = new Date().toUTCString();
  const text = `Hi ${recipient},

Your Feature Flag API account password was successfully changed on ${time}.

All previous sessions and active refresh tokens have been revoked for your safety.
If you did not change your password, contact your administrator or support immediately.

The Feature Flag API Team`;

  const html = baseWrapper(`
    <div style="margin:0 0 12px;color:#168360;font-size:10px;font-weight:700;letter-spacing:1px;">SECURITY UPDATE</div>
    <h1 style="margin:0 0 12px;color:#152340;font-size:25px;font-weight:700;line-height:1.25;">Your password was changed</h1>
    <p style="margin:0 0 18px;color:#566985;font-size:14px;">Hi ${safeRecipient}, the password for your Feature Flag API account was changed on <strong style="color:#233653;">${escapeHtml(time)}</strong>.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:20px 0;border:1px solid #c5e8d8;border-radius:8px;background-color:#effaf4;">
      <tr><td style="padding:15px 16px;color:#356e58;font-size:12px;line-height:1.6;"><strong style="color:#168360;">SESSION PROTECTION</strong><br>All previous sessions and active refresh tokens have been revoked.</td></tr>
    </table>
    <p style="margin:18px 0 0;color:#9a4957;font-size:11px;line-height:1.6;">If you did not make this change, contact your administrator or support immediately.</p>
  `);

  return { subject: SUBJECTS.PASSWORD_CHANGED, html, text };
}

function googleWelcomeTemplate({ name }) {
  const recipient = name || "there";
  const safeRecipient = recipientName(name);
  const text = `Hi ${recipient},

Welcome to Feature Flag API! Your account was created using Google Single Sign-On (SSO).
Your email address has been verified through Google, so you can continue to your workspace.

The Feature Flag API Team`;

  const html = baseWrapper(`
    <div style="margin:0 0 12px;color:#3954d7;font-size:10px;font-weight:700;letter-spacing:1px;">GOOGLE SIGN-IN</div>
    <h1 style="margin:0 0 12px;color:#152340;font-size:25px;font-weight:700;line-height:1.25;">Welcome to Feature Flag API</h1>
    <p style="margin:0 0 18px;color:#566985;font-size:14px;">Hi ${safeRecipient}, your account is ready. You signed in with Google and your email address has been verified.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:22px 0;border:1px solid #c5e8d8;border-radius:8px;background-color:#effaf4;">
      <tr><td style="padding:14px 16px;color:#356e58;font-size:12px;line-height:1.6;"><strong style="color:#168360;">EMAIL VERIFIED</strong><br>Your account is ready for project, environment, and feature-flag management.</td></tr>
    </table>
    <p style="margin:18px 0 0;color:#8290a5;font-size:11px;line-height:1.6;">If you did not authorize this sign-in, review connected apps in your Google Account security settings.</p>
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
