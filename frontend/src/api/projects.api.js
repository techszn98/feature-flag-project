import { api } from "./client.js";

export async function listProjects() {
  const data = (await api.get("/projects")).data;
  return Array.isArray(data) ? data : (data?.projects ?? []);
}

export async function createProject(payload) {
  const data = (await api.post("/projects", payload)).data;
  return data?.project ?? data;
}

export async function getProject(projectId) {
  const data = (await api.get(`/projects/${projectId}`)).data;
  return data?.project ?? data;
}

export async function updateProject(projectId, payload) {
  const data = (await api.patch(`/projects/${projectId}`, payload)).data;
  return data?.project ?? data;
}

export async function deleteProject(projectId) {
  return api.delete(`/projects/${projectId}`);
}
