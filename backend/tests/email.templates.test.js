const test = require("node:test");
const assert = require("node:assert/strict");
const {
  welcomeTemplate,
  verificationOtpTemplate,
  passwordResetTemplate,
  passwordChangedTemplate,
  googleWelcomeTemplate,
} = require("../src/services/email/email.templates");

const templateCases = [
  ["welcome", () => welcomeTemplate({ name: "Ari" })],
  [
    "verification",
    () => verificationOtpTemplate({ name: "Ari", otp: "123456" }),
  ],
  [
    "password reset",
    () => passwordResetTemplate({ name: "Ari", otp: "654321" }),
  ],
  ["password changed", () => passwordChangedTemplate({ name: "Ari" })],
  ["Google welcome", () => googleWelcomeTemplate({ name: "Ari" })],
];

test("account emails share the frontend-aligned brand wrapper and text fallback", () => {
  for (const [label, render] of templateCases) {
    const email = render();
    assert.ok(email.subject, `${label} should have a subject`);
    assert.match(
      email.html,
      /Feature Flag API/,
      `${label} should have the brand header`,
    );
    assert.match(
      email.html,
      /#101f39/,
      `${label} should use the navy brand color`,
    );
    assert.match(
      email.html,
      /#3954d7/,
      `${label} should use the cobalt accent`,
    );
    assert.match(
      email.html,
      /role="presentation"/,
      `${label} should use email-safe tables`,
    );
    assert.ok(email.text, `${label} should keep its plain-text alternative`);
  }
});

test("dynamic names and one-time codes are escaped in HTML", () => {
  const unsafeName = '<img src=x onerror="alert(1)">';
  const unsafeOtp = '<svg onload="alert(1)">';
  const welcome = welcomeTemplate({ name: unsafeName });
  const verification = verificationOtpTemplate({
    name: unsafeName,
    otp: unsafeOtp,
  });

  assert.ok(!welcome.html.includes(unsafeName));
  assert.ok(!verification.html.includes(unsafeName));
  assert.ok(!verification.html.includes(unsafeOtp));
  assert.match(verification.html, /&lt;svg onload=&quot;alert\(1\)&quot;&gt;/);
});
