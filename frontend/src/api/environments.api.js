import { api } from "./client.js";

export async function createEnvironment(projectId, payload) {
  const data = (await api.post(`/projects/${projectId}/environments`, payload))
    .data;
  return data?.environment ?? data;
}

export async function listEnvironments(projectId) {
  const data = (await api.get(`/projects/${projectId}/environments`)).data;
  return Array.isArray(data) ? data : (data?.environments ?? []);
}

export async function getEnvironment(id) {
  return (await api.get(`/environments/${id}`)).data;
}

export async function updateEnvironment(id, payload) {
  return (await api.put(`/environments/${id}`, payload)).data;
}

export async function deleteEnvironment(id) {
  return api.delete(`/environments/${id}`);
}
