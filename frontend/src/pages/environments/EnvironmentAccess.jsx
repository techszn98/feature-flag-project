import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout.jsx";
import Button from "../../components/common/Button.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import Input from "../../components/common/Input.jsx";
import Select from "../../components/common/Select.jsx";
import { useProject } from "../../hooks/useProject.js";
import { listProjects } from "../../api/projects.api.js";
import {
  createEnvironment,
  deleteEnvironment,
  listEnvironments,
} from "../../api/environments.api.js";
import {
  createEnvironmentKey,
  listEnvironmentKeys,
  revokeEnvironmentKey,
} from "../../api/keys.api.js";

const ENV_TYPES = ["development", "staging", "production"];
const getId = (item) => item?._id ?? item?.id;

export default function EnvironmentAccess() {
  const {
    selectedProjectId,
    selectProject,
    selectedEnvironmentId,
    setSelectedEnvironmentId,
  } = useProject();

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [environments, setEnvironments] = useState([]);
  const [envsLoading, setEnvsLoading] = useState(false);
  const [keys, setKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [error, setError] = useState("");

  const [envName, setEnvName] = useState("");
  const [envNameError, setEnvNameError] = useState("");
  const [envType, setEnvType] = useState("development");
  const [creatingEnv, setCreatingEnv] = useState(false);

  const [keyLabel, setKeyLabel] = useState("");
  const [generating, setGenerating] = useState(false);
  const [createdKey, setCreatedKey] = useState(null); // lives in memory only
  const [copied, setCopied] = useState(false);

  // Load projects once
  useEffect(() => {
    let active = true;
    listProjects()
      .then((list) => active && setProjects(list))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setProjectsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Load environments whenever the project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setEnvironments([]);
      return;
    }
    let active = true;
    setEnvsLoading(true);
    listEnvironments(selectedProjectId)
      .then((list) => active && setEnvironments(list))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setEnvsLoading(false));
    return () => {
      active = false;
    };
  }, [selectedProjectId]);

  // Load keys whenever the environment changes, and forget any revealed key
  useEffect(() => {
    setCreatedKey(null);
    setCopied(false);
    if (!selectedEnvironmentId) {
      setKeys([]);
      return;
    }
    let active = true;
    setKeysLoading(true);
    listEnvironmentKeys(selectedEnvironmentId)
      .then((list) => active && setKeys(list))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setKeysLoading(false));
    return () => {
      active = false;
    };
  }, [selectedEnvironmentId]);

  // A project can only have one environment per type, so only offer unused types
  const usedTypes = environments.map((env) => env.type);
  const availableTypes = ENV_TYPES.filter((type) => !usedTypes.includes(type));
  const effectiveType = availableTypes.includes(envType)
    ? envType
    : (availableTypes[0] ?? "");

  async function handleCreateEnvironment(event) {
    event.preventDefault();
    setError("");
    if (!envName.trim()) {
      setEnvNameError("Environment name is required");
      return;
    }
    setEnvNameError("");
    setCreatingEnv(true);
    try {
      const created = await createEnvironment(selectedProjectId, {
        name: envName.trim(),
        type: effectiveType,
      });
      setEnvironments((prev) => [...prev, created]);
      setSelectedEnvironmentId(getId(created));
      setEnvName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingEnv(false);
    }
  }

  async function handleDeleteEnvironment(env) {
    const confirmed = window.confirm(
      `Delete "${env.name}"? This also deletes its keys, flags and identities. This cannot be undone.`,
    );
    if (!confirmed) return;
    setError("");
    try {
      await deleteEnvironment(getId(env));
      setEnvironments((prev) => prev.filter((e) => getId(e) !== getId(env)));
      if (selectedEnvironmentId === getId(env)) setSelectedEnvironmentId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGenerateKey(event) {
    event.preventDefault();
    setError("");
    setCopied(false);
    setGenerating(true);
    try {
      const result = await createEnvironmentKey(selectedEnvironmentId, {
        label: keyLabel.trim(),
      });
      setCreatedKey(result);
      setKeyLabel("");
      setKeys(await listEnvironmentKeys(selectedEnvironmentId));
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
    } catch {
      setError("Copy failed. Select the key text and copy it manually.");
    }
  }

  async function handleRevoke(key) {
    const confirmed = window.confirm(
      `Revoke "${key.label || key.keyPreview}"? Apps using it will stop working immediately.`,
    );
    if (!confirmed) return;
    setError("");
    try {
      await revokeEnvironmentKey(selectedEnvironmentId, getId(key));
      setKeys(await listEnvironmentKeys(selectedEnvironmentId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppLayout>
      <main className="workspace-content">
        <div className="page-heading">
          <div>
            <div className="section-eyebrow">CLIENT / PROJECT OWNER</div>
            <h1>Environment Access</h1>
            <p>
              Manage environments and generate runtime keys. A key is shown
              once, when it is created.
            </p>
          </div>
        </div>

        <ErrorMessage>{error}</ErrorMessage>

        <section className="panel">
          <div className="panel-header">
            <h2>Project</h2>
            <p>Environments belong to a project.</p>
          </div>
          <div className="panel-body">
            {projectsLoading ? (
              <p className="field-hint">Loading projects…</p>
            ) : projects.length === 0 ? (
              <p className="empty-state">
                You have no projects yet. Create a project first.
              </p>
            ) : (
              <Select
                id="project"
                label="Select a project"
                value={selectedProjectId ?? ""}
                onChange={(e) => selectProject(e.target.value || null)}
              >
                <option value="">Choose a project…</option>
                {projects.map((p) => (
                  <option key={getId(p)} value={getId(p)}>
                    {p.name || getId(p)}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </section>

        {selectedProjectId && (
          <section className="panel">
            <div className="panel-header">
              <h2>Environments</h2>
              <p>Select the environment you want to generate keys for.</p>
            </div>
            {envsLoading ? (
              <p className="empty-state">Loading environments…</p>
            ) : environments.length === 0 ? (
              <p className="empty-state">No environments in this project yet.</p>
            ) : (
              <div>
                {environments.map((env) => {
                  const isSelected = getId(env) === selectedEnvironmentId;
                  return (
                    <div className="list-row" key={getId(env)}>
                      <div className="list-row-main">
                        <strong>{env.name}</strong>
                        <span>{env.type}</span>
                      </div>
                      <div className="button-row">
                        <Button
                          type="button"
                          className="secondary-button"
                          disabled={isSelected}
                          onClick={() => setSelectedEnvironmentId(getId(env))}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </Button>
                        <Button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDeleteEnvironment(env)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {availableTypes.length > 0 ? (
              <form className="panel-body" onSubmit={handleCreateEnvironment}>
                <div className="form-row">
                  <Input
                    id="env-name"
                    label="New environment name"
                    placeholder="e.g. Production"
                    value={envName}
                    error={envNameError}
                    onChange={(e) => setEnvName(e.target.value)}
                  />
                  <Select
                    id="env-type"
                    label="Type"
                    value={effectiveType}
                    onChange={(e) => setEnvType(e.target.value)}
                  >
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="button-row">
                  <Button
                    type="submit"
                    className="primary-button"
                    loading={creatingEnv}
                  >
                    Create environment
                  </Button>
                </div>
              </form>
            ) : (
              <p className="empty-state">
                This project already has all three environment types.
              </p>
            )}
          </section>
        )}

        {selectedEnvironmentId && (
          <section className="panel">
            <div className="panel-header">
              <h2>Environment keys</h2>
              <p>
                Management uses your login. Runtime apps send the key in the
                X-Environment-Key header.
              </p>
            </div>

            <form className="panel-body" onSubmit={handleGenerateKey}>
              <Input
                id="key-label"
                label="Descriptive name (optional)"
                placeholder="e.g. Production SDK key"
                value={keyLabel}
                onChange={(e) => setKeyLabel(e.target.value)}
              />
              <div className="button-row">
                <Button
                  type="submit"
                  className="primary-button"
                  loading={generating}
                >
                  Generate environment key
                </Button>
              </div>

              {createdKey && (
                <>
                  <div className="alert success" role="status">
                    <strong>Key generated. Copy it now.</strong>
                    For security it cannot be shown again.
                  </div>
                  <div className="key-reveal">
                    <pre className="code-block">{createdKey.key}</pre>
                    <Button
                      type="button"
                      className="secondary-button"
                      onClick={handleCopy}
                    >
                      {copied ? "Copied" : "Copy key"}
                    </Button>
                  </div>
                </>
              )}
            </form>

            {keysLoading ? (
              <p className="empty-state">Loading keys…</p>
            ) : keys.length === 0 ? (
              <p className="empty-state">No keys for this environment yet.</p>
            ) : (
              <div>
                {keys.map((key) => (
                  <div className="list-row" key={getId(key)}>
                    <div className="list-row-main">
                      <strong>{key.label || "Unlabelled key"}</strong>
                      <span>
                        {key.keyPreview} · {key.revoked ? "Revoked" : "Active"}
                        {key.createdAt &&
                          ` · created ${new Date(key.createdAt).toLocaleDateString()}`}
                      </span>
                    </div>
                    {!key.revoked && (
                      <Button
                        type="button"
                        className="danger-button"
                        onClick={() => handleRevoke(key)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </AppLayout>
  );
}