import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const registerPage = await readFile(
  fileURLToPath(new URL("../../src/pages/auth/Register.jsx", import.meta.url)),
  "utf8",
);
const authApi = await readFile(
  fileURLToPath(new URL("../../src/api/auth.api.js", import.meta.url)),
  "utf8",
);
const loginPage = await readFile(
  fileURLToPath(new URL("../../src/pages/auth/Login.jsx", import.meta.url)),
  "utf8",
);

test("email verification offers a resend code action with feedback", () => {
  assert.match(authApi, /\/auth\/resend-otp/);
  assert.match(registerPage, /Resend code/);
  assert.match(registerPage, /Didn't receive the code\?/);
  assert.match(registerPage, /role="status"/);
  assert.match(registerPage, /resendCooldown/);
});

test("Google sign-in is available from both login and registration", () => {
  assert.match(loginPage, /<GoogleSignInButton/);
  assert.match(registerPage, /<GoogleSignInButton/);
  assert.match(registerPage, /signInWithGoogle\(credential\)/);
  assert.match(registerPage, /navigate\("\/dashboard"/);
  assert.match(authApi, /api\.post\("\/auth\/google", \{ idToken \}\)/);
});
