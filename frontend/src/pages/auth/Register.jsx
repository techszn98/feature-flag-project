import { useEffect, useState } from "react";
import { ArrowRight, Check, Layers3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../../api/auth.api.js";
import Button from "../../components/common/Button.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import Input from "../../components/common/Input.jsx";
import PasswordInput from "../../components/common/PasswordInput.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import ThemeToggle from "../../components/common/ThemeToggle.jsx";
import GoogleSignInButton from "../../components/common/GoogleSignInButton.jsx";

export default function Register() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setTimeout(() => {
      setResendCooldown((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const registration = await authApi.register({ email, password });
      setVerificationRequired(true);
      setResendError(
        registration?.verificationEmailSent === false
          ? "Your account was created, but the verification email could not be sent. Use Resend code to try again."
          : "",
      );
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.verifyEmail({ email, otp });
      await signIn({ email, password });
      navigate("/dashboard", { replace: true });
    } catch (verificationError) {
      setError(verificationError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn(credential) {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle(credential);
      navigate("/dashboard", { replace: true });
    } catch (googleError) {
      setError(googleError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setResendMessage("");
    setResendError("");
    setResending(true);
    try {
      const message = await authApi.resendOtp(email);
      setResendMessage(
        message ||
          "If an account exists with this email, a new verification code has been sent.",
      );
      setResendCooldown(30);
    } catch (resendRequestError) {
      setResendError(resendRequestError.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="auth-page">
      <Link to="/login" className="auth-brand">
        <span className="brand-mark">
          <Layers3 size={19} />
        </span>{" "}
        Feature Flag API
      </Link>
      <ThemeToggle variant="auth" />
      <section className="auth-panel">
        <div className="auth-eyebrow">A CLEARER WAY TO SHIP</div>
        {!verificationRequired ? (
          <>
            <h1>Create your workspace account</h1>
            <p className="auth-subtitle">
              Start managing feature releases with confidence.
            </p>
            <form className="auth-form" onSubmit={handleRegister}>
              <Input
                id="email"
                label="Work email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <PasswordInput
                id="password"
                label="Password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                placeholder="At least 8 characters"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <PasswordInput
                id="confirm-password"
                label="Confirm password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                placeholder="Enter your password again"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <ErrorMessage>{error}</ErrorMessage>
              <Button
                className="primary-button submit-button"
                type="submit"
                loading={loading}
              >
                Create account <ArrowRight size={17} />
              </Button>
            </form>
            <GoogleSignInButton
              onSuccess={handleGoogleSignIn}
              onError={(googleError) => setError(googleError.message)}
            />
          </>
        ) : (
          <>
            <div className="verification-mark">
              <Check size={21} />
            </div>
            <h1>Check your inbox</h1>
            <p className="auth-subtitle">
              We sent a six-digit verification code to <strong>{email}</strong>.
            </p>
            <form className="auth-form" onSubmit={handleVerify}>
              <Input
                id="otp"
                label="Verification code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                required
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
              <ErrorMessage>{error}</ErrorMessage>
              <Button
                className="primary-button submit-button"
                type="submit"
                loading={loading}
              >
                Verify and continue <ArrowRight size={17} />
              </Button>
              <div className="resend-code">
                <p>Didn't receive the code? Check your spam folder.</p>
                <Button
                  className="resend-code-button"
                  type="button"
                  loading={resending}
                  disabled={resendCooldown > 0}
                  onClick={handleResendOtp}
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend code"}
                </Button>
                {resendMessage && (
                  <p className="resend-success" role="status">
                    {resendMessage}
                  </p>
                )}
                <ErrorMessage>{resendError}</ErrorMessage>
              </div>
            </form>
          </>
        )}
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
      <footer className="auth-footer">Built for careful releases.</footer>
    </main>
  );
}
