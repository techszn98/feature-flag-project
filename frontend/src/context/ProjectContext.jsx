import { createContext, useCallback, useMemo, useState } from "react";

export const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [project, setProject] = useState({ name: "Feature Flag Workspace" });
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(null);

  // Changing project invalidates the environment choice
  const selectProject = useCallback((id) => {
    setSelectedProjectId(id);
    setSelectedEnvironmentId(null);
  }, []);

  const value = useMemo(
    () => ({
      project,
      setProject,
      selectedProjectId,
      selectProject,
      selectedEnvironmentId,
      setSelectedEnvironmentId,
    }),
    [project, selectedProjectId, selectProject, selectedEnvironmentId],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}