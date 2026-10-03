import { useEffect, useRef, useState } from "react";

const GOOGLE_AUTH_STATE_KEY = "__featureFlagGoogleAuthState";

export default function GoogleSignInButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);
  const callbacks = useRef({ onSuccess, onError });
  const [loadError, setLoadError] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  callbacks.current = { onSuccess, onError };

  useEffect(() => {
    if (!clientId || !buttonRef.current) return undefined;
    let cancelled = false;

    function renderButton() {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) {
        return;
      }
      try {
        const authState = window[GOOGLE_AUTH_STATE_KEY] ?? {
          clientId: null,
          callbacks: null,
        };
        authState.callbacks = callbacks.current;
        window[GOOGLE_AUTH_STATE_KEY] = authState;

        if (authState.clientId !== clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: ({ credential }) => {
              const activeCallbacks = window[GOOGLE_AUTH_STATE_KEY]?.callbacks;
              if (!credential) {
                activeCallbacks?.onError?.(
                  new Error("Google did not return an identity token."),
                );
                return;
              }
              activeCallbacks?.onSuccess(credential);
            },
          });
          authState.clientId = clientId;
        }

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          width: Math.min(360, buttonRef.current.clientWidth),
        });
      } catch (error) {
        setLoadError(true);
        callbacks.current.onError?.(error);
      }
    }

    let script = document.querySelector("script[data-google-identity]");
    if (window.google?.accounts?.id) {
      renderButton();
    } else if (script) {
      script.addEventListener("load", renderButton, { once: true });
      script.addEventListener("error", () => setLoadError(true), {
        once: true,
      });
    } else {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = "true";
      script.addEventListener("load", renderButton, { once: true });
      script.addEventListener("error", () => setLoadError(true), {
        once: true,
      });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (!clientId) {
    return (
      <p className="google-auth-note" role="status">
        Google sign-in is not configured for this deployment.
      </p>
    );
  }

  return (
    <>
      <div className="auth-divider">
        <span>or continue with</span>
      </div>
      <div className="google-button" ref={buttonRef} />
      {loadError && (
        <p className="google-auth-note" role="status">
          Google sign-in could not load. Check the OAuth client configuration.
        </p>
      )}
    </>
  );
}
