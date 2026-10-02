import { api } from "./client.js";

export async function listProjects() {
  return (await api.get("/projects")).data.projects;
}