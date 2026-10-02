import { useState } from "react";
import { ArrowRight, Check, Layers3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../../api/auth.api.js";
import Button from "../../components/common/Button.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import Input from "../../components/common/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export default function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authApi.register({ email, password });
      setVerificationRequired(true);
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

  return (
    <main className="auth-page">
      <Link to="/login" className="auth-brand">
        <span className="brand-mark">
          <Layers3 size={19} />
        </span>{" "}
        Feature Flag API
      </Link>
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
              <Input
                id="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                placeholder="At least 8 characters"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Input
                id="confirm-password"
                label="Confirm password"
                type="password"
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
