import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronDown,
  CirclePlus,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import AppLayout from "../../components/layout/AppLayout.jsx";
import Button from "../../components/common/Button.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import Input from "../../components/common/Input.jsx";
import Loading from "../../components/common/Loading.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import {
  createEnvironment,
  listEnvironments,
} from "../../api/environments.api.js";
import {
  createProject,
  deleteProject,
  updateProject,
} from "../../api/projects.api.js";
import { deleteFlag, listFlags } from "../../api/flags.api.js";
import { useProject } from "../../hooks/useProject.js";

const getId = (item) => item?.id ?? item?._id;

export default function FeatureFlags() {
  const navigate = useNavigate();
  const {
    projects,
    projectsLoading,
    projectsError,
    refreshProjects,
    selectedProjectId,
    selectProject,
    selectedEnvironmentId,
    setSelectedEnvironmentId,
  } = useProject();
  const [environments, setEnvironments] = useState([]);
  const [environmentsLoading, setEnvironmentsLoading] = useState(false);
  const [flags, setFlags] = useState([]);
  const [flagsLoading, setFlagsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [projectDialog, setProjectDialog] = useState(false);
  const [projectDraft, setProjectDraft] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectSaving, setProjectSaving] = useState(false);
  const [environmentForm, setEnvironmentForm] = useState(false);
  const [environmentName, setEnvironmentName] = useState("");
  const [environmentType, setEnvironmentType] = useState("development");
  const [environmentSaving, setEnvironmentSaving] = useState(false);

  const selectedProject = useMemo(
    () =>
      projects.find(
        (project) => String(getId(project)) === String(selectedProjectId),
      ) ?? null,
    [projects, selectedProjectId],
  );
  const selectedEnvironment =
    environments.find(
      (environment) =>
        String(getId(environment)) === String(selectedEnvironmentId),
    ) ?? null;

  useEffect(() => {
    if (
      !projectsLoading &&
      projects.length &&
      !projects.some(
        (project) => String(getId(project)) === String(selectedProjectId),
      )
    ) {
      selectProject(getId(projects[0]));
    } else if (!projectsLoading && !projects.length && selectedProjectId) {
      selectProject(null);
    }
  }, [projects, projectsLoading, selectProject, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setEnvironments([]);
      setSelectedEnvironmentId(null);
      return undefined;
    }
    let active = true;
    setEnvironmentsLoading(true);
    setPageError("");
    listEnvironments(selectedProjectId)
      .then((items) => {
        if (!active) return;
        setEnvironments(items);
        if (
          !items.some(
            (item) => String(getId(item)) === String(selectedEnvironmentId),
          )
        ) {
          setSelectedEnvironmentId(items.length ? getId(items[0]) : null);
        }
      })
      .catch((error) => active && setPageError(error.message))
      .finally(() => active && setEnvironmentsLoading(false));
    return () => {
      active = false;
    };
  }, [selectedProjectId, selectedEnvironmentId, setSelectedEnvironmentId]);

  useEffect(() => {
    if (!selectedEnvironmentId) {
      setFlags([]);
      return undefined;
    }
    let active = true;
    setFlagsLoading(true);
    setPageError("");
    listFlags(selectedEnvironmentId)
      .then((items) => active && setFlags(items))
      .catch((error) => active && setPageError(error.message))
      .finally(() => active && setFlagsLoading(false));
    return () => {
      active = false;
    };
  }, [selectedEnvironmentId]);

  async function handleSaveProject(event) {
    event.preventDefault();
    setPageError("");
    setProjectSaving(true);
    try {
      const payload = {
        name: projectName.trim(),
        description: projectDescription.trim(),
      };
      const saved = projectDraft
        ? await updateProject(getId(projectDraft), payload)
        : await createProject(payload);
      const updatedProjects = await refreshProjects();
      const savedProject =
        updatedProjects.find(
          (project) => String(getId(project)) === String(getId(saved)),
        ) ?? saved;
      selectProject(getId(savedProject));
      setProjectDraft(null);
      setProjectName("");
      setProjectDescription("");
    } catch (error) {
      setPageError(error.message);
    } finally {
      setProjectSaving(false);
    }
  }

  async function handleDeleteProject(project) {
    if (
      !window.confirm(
        `Delete project "${project.name}"? Projects with environments cannot be deleted.`,
      )
    )
      return;
    setPageError("");
    try {
      await deleteProject(getId(project));
      await refreshProjects();
      if (String(selectedProjectId) === String(getId(project)))
        selectProject(null);
    } catch (error) {
      setPageError(error.message);
    }
  }

  async function handleCreateEnvironment(event) {
    event.preventDefault();
    if (!selectedProjectId) return;
    setPageError("");
    setEnvironmentSaving(true);
    try {
      const created = await createEnvironment(selectedProjectId, {
        name: environmentName.trim(),
        type: environmentType,
      });
      const items = await listEnvironments(selectedProjectId);
      setEnvironments(items);
      setSelectedEnvironmentId(getId(created));
      setEnvironmentName("");
      setEnvironmentForm(false);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setEnvironmentSaving(false);
    }
  }

  async function handleDeleteFlag(flag) {
    if (
      !window.confirm(
        `Delete "${flag.name}" from this environment? This cannot be undone.`,
      )
    )
      return;
    setPageError("");
    try {
      await deleteFlag(getId(flag));
      setFlags((current) =>
        current.filter((item) => String(getId(item)) !== String(getId(flag))),
      );
    } catch (error) {
      setPageError(error.message);
    }
  }

  function beginProjectEdit(project) {
    setProjectDraft(project);
    setProjectName(project.name ?? "");
    setProjectDescription(project.description ?? "");
  }

  if (projectsLoading) return <Loading label="Loading your projects" />;

  return (
    <AppLayout>
      <main className="workspace-content flags-page">
        <div className="page-heading flags-heading">
          <div>
            <div className="section-eyebrow">MANAGEMENT · BEARER JWT</div>
            <h1>Feature Flags</h1>
            <p>
              Manage the rollout state and targeting rules for each environment.
            </p>
          </div>
          <Button
            type="button"
            className="primary-button"
            disabled={!selectedEnvironment}
            onClick={() => navigate("/feature-flags/new")}
          >
            <Plus size={17} /> Create feature flag
          </Button>
        </div>

        <ErrorMessage>{projectsError || pageError}</ErrorMessage>

        <section
          className="workspace-toolbar"
          aria-label="Project and environment selection"
        >
          <div className="selector-field">
            <label htmlFor="project-select">Project</label>
            <div className="select-wrap">
              <Building2 size={16} aria-hidden="true" />
              <select
                id="project-select"
                value={selectedProjectId ?? ""}
                onChange={(event) => selectProject(event.target.value || null)}
                disabled={!projects.length}
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={getId(project)} value={getId(project)}>
                    {project.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </div>
          </div>
          <div className="selector-field">
            <label htmlFor="environment-select">Environment</label>
            <div className="select-wrap">
              <select
                id="environment-select"
                value={selectedEnvironmentId ?? ""}
                onChange={(event) =>
                  setSelectedEnvironmentId(event.target.value || null)
                }
                disabled={
                  !selectedProjectId ||
                  environmentsLoading ||
                  !environments.length
                }
              >
                <option value="">Select an environment</option>
                {environments.map((environment) => (
                  <option key={getId(environment)} value={getId(environment)}>
                    {environment.name} · {environment.type}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </div>
          </div>
          <Button
            type="button"
            className="button-secondary toolbar-button"
            onClick={() => {
              setProjectDraft(null);
              setProjectName("");
              setProjectDescription("");
              setProjectDialog(true);
            }}
          >
            <Building2 size={16} /> Manage projects
          </Button>
          {selectedProject && (
            <Button
              type="button"
              className="button-secondary toolbar-button"
              onClick={() => setEnvironmentForm((current) => !current)}
            >
              <CirclePlus size={16} /> Add environment
            </Button>
          )}
        </section>

        {environmentForm && selectedProject && (
          <form
            className="inline-create-panel"
            onSubmit={handleCreateEnvironment}
          >
            <Input
              id="new-environment-name"
              label="Environment name"
              value={environmentName}
              onChange={(event) => setEnvironmentName(event.target.value)}
              placeholder="e.g. Production"
              required
            />
            <div className="field">
              <label htmlFor="new-environment-type">Type</label>
              <select
                id="new-environment-type"
                value={environmentType}
                onChange={(event) => setEnvironmentType(event.target.value)}
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div className="button-row">
              <Button
                className="primary-button"
                type="submit"
                loading={environmentSaving}
              >
                Create environment
              </Button>
              <Button
                className="button-secondary"
                type="button"
                onClick={() => setEnvironmentForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {projectDialog && (
          <div
            className="dialog-backdrop"
            role="presentation"
            onMouseDown={(event) =>
              event.target === event.currentTarget && setProjectDialog(false)
            }
          >
            <section
              className="project-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-dialog-title"
            >
              <div className="project-dialog-heading">
                <div>
                  <div className="section-eyebrow">OWNED PROJECTS</div>
                  <h2 id="project-dialog-title">Manage projects</h2>
                </div>
                <Button
                  className="icon-button"
                  type="button"
                  aria-label="Close project manager"
                  onClick={() => setProjectDialog(false)}
                >
                  <X size={18} />
                </Button>
              </div>
              <div className="project-manager-list">
                {projects.map((project) => (
                  <div className="project-manager-row" key={getId(project)}>
                    <div>
                      <strong>{project.name}</strong>
                      <span>
                        {project.slug ||
                          project.description ||
                          "Client-owned project"}
                      </span>
                    </div>
                    <Button
                      className="icon-button"
                      type="button"
                      aria-label={`Edit ${project.name}`}
                      title="Edit project"
                      onClick={() => beginProjectEdit(project)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      className="icon-button danger-icon"
                      type="button"
                      aria-label={`Delete ${project.name}`}
                      title="Delete project"
                      onClick={() => handleDeleteProject(project)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                {!projects.length && (
                  <p className="empty-inline">
                    No projects yet. Create one to get started.
                  </p>
                )}
              </div>
              <form className="project-edit-form" onSubmit={handleSaveProject}>
                <h3>
                  {projectDraft
                    ? `Edit ${projectDraft.name}`
                    : "Create a project"}
                </h3>
                <Input
                  id="project-name"
                  label="Project name"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  maxLength={100}
                  required
                />
                <Input
                  id="project-description"
                  label="Description (optional)"
                  value={projectDescription}
                  onChange={(event) =>
                    setProjectDescription(event.target.value)
                  }
                  maxLength={500}
                />
                <ErrorMessage>{pageError}</ErrorMessage>
                <div className="button-row">
                  <Button
                    className="primary-button"
                    type="submit"
                    loading={projectSaving}
                  >
                    {projectDraft ? "Save changes" : "Create project"}
                  </Button>
                  {projectDraft && (
                    <Button
                      className="button-secondary"
                      type="button"
                      onClick={() => {
                        setProjectDraft(null);
                        setProjectName("");
                        setProjectDescription("");
                      }}
                    >
                      New project
                    </Button>
                  )}
                  <Button
                    className="button-secondary"
                    type="button"
                    onClick={() => setProjectDialog(false)}
                  >
                    Done
                  </Button>
                </div>
              </form>
            </section>
          </div>
        )}

        {!projects.length && !projectsError && (
          <section className="empty-state panel">
            <div className="empty-state-mark">
              <Building2 size={20} />
            </div>
            <h2>Create your first project</h2>
            <p>
              Projects belong to your account. Add one, then create an
              environment to hold its flags.
            </p>
            <Button
              className="primary-button"
              type="button"
              onClick={() => setProjectDialog(true)}
            >
              <Plus size={17} /> Create project
            </Button>
          </section>
        )}

        {projects.length > 0 &&
          !environmentsLoading &&
          selectedProject &&
          environments.length === 0 && (
            <section className="empty-state panel">
              <div className="empty-state-mark">
                <CirclePlus size={20} />
              </div>
              <h2>Add an environment</h2>
              <p>
                Flags belong to an environment within{" "}
                <strong>{selectedProject.name}</strong>.
              </p>
              <Button
                className="primary-button"
                type="button"
                onClick={() => setEnvironmentForm(true)}
              >
                <Plus size={17} /> Create environment
              </Button>
            </section>
          )}

        {selectedEnvironment && (
          <section
            className="flags-list-section"
            aria-labelledby="flag-list-title"
          >
            <div className="flags-list-heading">
              <div>
                <div className="section-eyebrow">
                  {selectedProject?.name} / {selectedEnvironment.name}
                </div>
                <h2 id="flag-list-title">Flags in this environment</h2>
              </div>
              <span className="count-label">
                {flags.length} {flags.length === 1 ? "flag" : "flags"}
              </span>
            </div>
            {flagsLoading ? (
              <div className="inline-loading">
                <span className="loading-mark" /> Loading flags
              </div>
            ) : flags.length ? (
              <div className="flag-list" aria-live="polite">
                {flags.map((flag) => (
                  <article className="flag-list-row" key={getId(flag)}>
                    <div className="flag-row-copy">
                      <code>{flag.name}</code>
                      <p>
                        {flag.targetingRules?.length
                          ? `${flag.targetingRules.length} targeting ${flag.targetingRules.length === 1 ? "rule" : "rules"}`
                          : "No targeting rules"}
                      </p>
                    </div>
                    <StatusBadge enabled={flag.enabled} />
                    <div className="flag-row-actions">
                      <Button
                        className="icon-button edit-icon"
                        type="button"
                        aria-label={`Edit ${flag.name}`}
                        title="Edit flag"
                        onClick={() =>
                          navigate(`/feature-flags/${getId(flag)}/edit`)
                        }
                      >
                        <Pencil size={17} />
                      </Button>
                      <Button
                        className="icon-button danger-icon"
                        type="button"
                        aria-label={`Delete ${flag.name}`}
                        title="Delete flag"
                        onClick={() => handleDeleteFlag(flag)}
                      >
                        <Trash2 size={17} />
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <section className="empty-state panel">
                <div className="empty-state-mark">
                  <RefreshCw size={19} />
                </div>
                <h2>No flags here yet</h2>
                <p>
                  Create your first feature flag for the selected environment.
                </p>
                <Button
                  className="primary-button"
                  type="button"
                  onClick={() => navigate("/feature-flags/new")}
                >
                  <Plus size={17} /> Create feature flag
                </Button>
              </section>
            )}
          </section>
        )}
      </main>
    </AppLayout>
  );
}
