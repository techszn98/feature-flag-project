import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout.jsx";
import Button from "../../components/common/Button.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import Input from "../../components/common/Input.jsx";
import Select from "../../components/common/Select.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import { useProject } from "../../hooks/useProject.js";
import { listProjects } from "../../api/projects.api.js";
import { listEnvironments } from "../../api/environments.api.js";
import {
  createIdentity,
  updateIdentityTraits,
} from "../../api/identities.api.js";

const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const getId = (item) => item?._id ?? item?.id;

// Returns { traits } on success or { error } on failure
function parseTraits(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: "Invalid JSON. Check commas, quotes and brackets." };
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { error: 'Traits must be a JSON object, like { "plan": "premium" }' };
  }
  if (new TextEncoder().encode(JSON.stringify(parsed)).length > 8000) {
    return { error: "Traits must be at most 8000 bytes." };
  }
  return { traits: parsed };
}

export default function IdentityTraits() {
  const {
    selectedProjectId,
    selectProject,
    selectedEnvironmentId,
    setSelectedEnvironmentId,
  } = useProject();

  const [projects, setProjects] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [identifier, setIdentifier] = useState("");
  const [traitsText, setTraitsText] = useState('{ "beta_tester": true }');

  const [identifierError, setIdentifierError] = useState("");
  const [traitsError, setTraitsError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    listProjects()
      .then((list) => active && setProjects(list))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setEnvironments([]);
      return;
    }
    let active = true;
    listEnvironments(selectedProjectId)
      .then((list) => active && setEnvironments(list))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [selectedProjectId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    const trimmedId = identifier.trim();
    const nextIdError = !trimmedId
      ? "Identity identifier is required"
      : IDENTIFIER_PATTERN.test(trimmedId)
        ? ""
        : "Use 1-128 characters: letters, numbers, ., _, : or - (must start with a letter or number)";
    const parsed = parseTraits(traitsText);
    setIdentifierError(nextIdError);
    setTraitsError(parsed.error ?? "");
    if (!selectedEnvironmentId) {
      setError("Select a project and an environment first.");
      return;
    }
    if (nextIdError || parsed.error) return;

    setLoading(true);
    try {
      let identity;
      let created = false;
      try {
        identity = await updateIdentityTraits(
          selectedEnvironmentId,
          trimmedId,
          parsed.traits,
        );
      } catch (err) {
        if (err.status !== 404) throw err;
        // The identity doesn't exist yet, so create it with these traits
        identity = await createIdentity(
          selectedEnvironmentId,
          trimmedId,
          parsed.traits,
        );
        created = true;
      }
      setResult({ identity, created });
    } catch (err) {
      if (err.status === 400) setTraitsError(err.message);
      else if (err.status === 429)
        setError("Too many requests. Wait a moment and try again.");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <main className="workspace-content">
        <div className="page-heading">
          <div>
            <div className="section-eyebrow">CLIENT / PROJECT OWNER</div>
            <h1>Identity Traits</h1>
            <p>
              Set traits for an identity in an environment. New traits are
              merged into the existing ones, and the identity is created if it
              doesn't exist yet.
            </p>
          </div>
        </div>

        <ErrorMessage>{error}</ErrorMessage>

        <section className="panel">
          <div className="panel-header">
            <h2>Update traits</h2>
            <p>PUT /api/v1/identities/:identifier/traits</p>
          </div>
          <form className="panel-body" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <Select
                id="traits-project"
                label="Project"
                value={selectedProjectId ?? ""}
                onChange={(e) => selectProject(e.target.value || null)}
              >
                <option value="">Choose a project…</option>
                {projects.map((p) => (
                  <option key={getId(p)} value={getId(p)}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <Select
                id="traits-environment"
                label="Environment"
                value={selectedEnvironmentId ?? ""}
                disabled={!selectedProjectId}
                onChange={(e) => setSelectedEnvironmentId(e.target.value || null)}
              >
                <option value="">Choose an environment…</option>
                {environments.map((env) => (
                  <option key={getId(env)} value={getId(env)}>
                    {env.name} ({env.type})
                  </option>
                ))}
              </Select>
            </div>
            <Input
              id="traits-identifier"
              label="Identity identifier"
              placeholder="e.g. user_123"
              autoComplete="off"
              value={identifier}
              error={identifierError}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <Textarea
              id="traits-json"
              label="Traits JSON"
              hint="Must be a JSON object. Existing traits with other names are kept."
              value={traitsText}
              error={traitsError}
              onChange={(e) => setTraitsText(e.target.value)}
            />
            <div className="button-row">
              <Button type="submit" className="primary-button" loading={loading}>
                Update traits
              </Button>
            </div>
          </form>
        </section>

        {result && (
          <section className="panel" aria-live="polite">
            <div className="panel-header">
              <h2>
                {result.created ? "Identity created" : "Traits updated"}
              </h2>
              <p>
                Stored traits for {result.identity.identifier}:
              </p>
            </div>
            <div className="panel-body">
              <pre className="code-block">
                {JSON.stringify(result.identity.traits, null, 2)}
              </pre>
            </div>
          </section>
        )}
      </main>
    </AppLayout>
  );
}