import { createContext, useState } from "react";

export const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [project, setProject] = useState({ name: "Feature Flag Workspace" });

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
}
