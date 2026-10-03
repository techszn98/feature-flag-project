import { useState } from "react";
import AppLayout from "../../components/layout/AppLayout.jsx";
import Button from "../../components/common/Button.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import Input from "../../components/common/Input.jsx";
import { evaluate } from "../../api/evaluation.api.js";

// Same rule the backend enforces, so we can catch mistakes before sending
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export default function Evaluation() {
  const [environmentKey, setEnvironmentKey] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [keyError, setKeyError] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    const trimmedKey = environmentKey.trim();
    const trimmedId = identifier.trim();
    const nextKeyError = trimmedKey ? "" : "Environment key is required";
    const nextIdError = !trimmedId
      ? "Identity identifier is required"
      : IDENTIFIER_PATTERN.test(trimmedId)
        ? ""
        : "Use 1-128 characters: letters, numbers, ., _, : or - (must start with a letter or number)";
    setKeyError(nextKeyError);
    setIdentifierError(nextIdError);
    if (nextKeyError || nextIdError) return;

    setLoading(true);
    try {
      setResult(await evaluate(trimmedKey, trimmedId));
    } catch (err) {
      if (err.status === 401) {
        setKeyError("Invalid or revoked environment key");
      } else if (err.status === 400) {
        setIdentifierError(err.message);
      } else if (err.status === 429) {
        setError("Too many requests. Wait a moment and try again.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const flagEntries = result ? Object.entries(result.flags ?? {}) : [];

  return (
    <AppLayout>
      <main className="workspace-content">
        <div className="page-heading">
          <div>
            <div className="section-eyebrow">RUNTIME · X-ENVIRONMENT-KEY</div>
            <h1>Evaluation</h1>
            <p>
              Paste an Environment Key and an identity identifier to see which
              flags are on for that identity. This call does not use your login.
            </p>
          </div>
        </div>

        <ErrorMessage>{error}</ErrorMessage>

        <section className="panel">
          <div className="panel-header">
            <h2>Evaluate flags</h2>
            <p>POST /api/v1/evaluate</p>
          </div>
          <form className="panel-body" onSubmit={handleSubmit} noValidate>
            <Input
              id="eval-key"
              label="Environment key"
              placeholder="Paste the key you copied from Environment Access"
              autoComplete="off"
              spellCheck={false}
              value={environmentKey}
              error={keyError}
              onChange={(e) => setEnvironmentKey(e.target.value)}
            />
            <Input
              id="eval-identifier"
              label="Identity identifier"
              placeholder="e.g. user_123"
              autoComplete="off"
              value={identifier}
              error={identifierError}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <div className="button-row">
              <Button type="submit" className="primary-button" loading={loading}>
                Evaluate flags
              </Button>
            </div>
          </form>
        </section>

        {result && (
          <section className="panel" aria-live="polite">
            <div className="panel-header">
              <h2>Result for {result.identifier}</h2>
              <p>
                {flagEntries.length === 0
                  ? "This environment has no flags yet."
                  : `${flagEntries.length} flag(s) evaluated.`}
              </p>
            </div>
            {flagEntries.length > 0 && (
              <div>
                {flagEntries.map(([name, enabled]) => (
                  <div className="list-row" key={name}>
                    <div className="list-row-main">
                      <strong>{name}</strong>
                    </div>
                    <span className={`alert ${enabled ? "success" : "warning"}`}>
                      {enabled ? "ON" : "OFF"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="panel-body">
              <pre className="code-block">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </section>
        )}
      </main>
    </AppLayout>
  );
}