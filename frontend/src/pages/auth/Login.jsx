import { useEffect, useRef, useState } from "react";
import { ArrowRight, Layers3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import Input from "../../components/common/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { API_BASE_URL } from "../../api/client.js";

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const googleButton = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId || !googleButton.current) return undefined;
    let cancelled = false;

    function renderGoogleButton() {
      if (cancelled || !window.google?.accounts?.id || !googleButton.current)
        return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
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
        },
      });
      window.google.accounts.id.renderButton(googleButton.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: Math.min(360, googleButton.current.clientWidth),
      });
    }

    let script = document.querySelector("script[data-google-identity]");
    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else if (script) {
      script.addEventListener("load", renderGoogleButton, { once: true });
    } else {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = "true";
      script.addEventListener("load", renderGoogleButton, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [googleClientId, navigate]);

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
          <Input
            id="password"
            label="Password"
            type="password"
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
        {googleClientId && (
          <>
            <div className="auth-divider">
              <span>or continue with</span>
            </div>
            <div className="google-button" ref={googleButton} />
          </>
        )}
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
