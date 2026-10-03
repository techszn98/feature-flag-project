import { useState } from "react";
import { ArrowRight, Layers3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import Input from "../../components/common/Input.jsx";
import PasswordInput from "../../components/common/PasswordInput.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { API_BASE_URL } from "../../api/client.js";
import ThemeToggle from "../../components/common/ThemeToggle.jsx";
import GoogleSignInButton from "../../components/common/GoogleSignInButton.jsx";

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleGoogleSignIn(credential) {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle(credential);
      navigate("/dashboard", { replace: true });
    } catch (signInError) {
      setError(signInError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn({ email, password });
      navigate("/dashboard", { replace: true });
    } catch (signInError) {
      setError(signInError.message);
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
      <ThemeToggle variant="auth" />
      <section className="auth-panel">
        <div className="auth-eyebrow">YOUR WORKSPACE, IN CONTROL</div>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to manage your flags and environments.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email address"
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
            autoComplete="current-password"
            placeholder="Your password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <ErrorMessage>{error}</ErrorMessage>
          <Button
            className="primary-button submit-button"
            type="submit"
            loading={loading}
          >
            Sign in <ArrowRight size={17} />
          </Button>
        </form>
        <GoogleSignInButton
          onSuccess={handleGoogleSignIn}
          onError={(googleError) => setError(googleError.message)}
        />
        <p className="auth-switch">
          New to the workspace? <Link to="/register">Create an account</Link>
        </p>
        <p className="api-caption">
          <span className="status-dot" /> API endpoint{" "}
          <code>{API_BASE_URL}</code>
        </p>
      </section>
      <footer className="auth-footer">Built for careful releases.</footer>
    </main>
  );
}
