import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { listProjects } from "../api/projects.api.js";
import { AuthContext } from "./AuthContext.jsx";

export const ProjectContext = createContext(null);

const getId = (project) => project?.id ?? project?._id;

export function ProjectProvider({ children }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(null);

  const refreshProjects = useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError("");
    try {
      const ownedProjects = await listProjects();
      setProjects(ownedProjects);
      return ownedProjects;
    } catch (error) {
      setProjectsError(error.message);
      throw error;
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return undefined;
    if (!user) {
      setProjects([]);
      setProjectsLoading(false);
      setProjectsError("");
      setProject(null);
      setSelectedProjectId(null);
      setSelectedEnvironmentId(null);
      return undefined;
    }

    refreshProjects().catch(() => {});
    return undefined;
  }, [authLoading, refreshProjects, user?.id, user?.email]);

  useEffect(() => {
    if (projectsLoading) return;
    if (!projects.length) {
      setProject(null);
      setSelectedProjectId(null);
      setSelectedEnvironmentId(null);
      return;
    }

    const selected = projects.find(
      (item) => String(getId(item)) === String(selectedProjectId),
    );
    if (selected) {
      setProject(selected);
      return;
    }

    setProject(projects[0]);
    setSelectedProjectId(getId(projects[0]));
    setSelectedEnvironmentId(null);
  }, [projects, projectsLoading, selectedProjectId]);

  const selectProject = useCallback(
    (id) => {
      const nextProject =
        projects.find((item) => String(getId(item)) === String(id)) ?? null;
      setProject(nextProject);
      setSelectedProjectId(id || null);
      setSelectedEnvironmentId(null);
    },
    [projects],
  );

  const value = useMemo(
    () => ({
      project,
      setProject,
      projects,
      projectsLoading,
      projectsError,
      refreshProjects,
      selectedProjectId,
      selectProject,
      selectedEnvironmentId,
      setSelectedEnvironmentId,
    }),
    [
      project,
      projects,
      projectsLoading,
      projectsError,
      refreshProjects,
      selectedProjectId,
      selectProject,
      selectedEnvironmentId,
    ],
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
