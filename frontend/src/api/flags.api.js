import { api } from "./client.js";

export async function listFlags(environmentId) {
  const query = environmentId
    ? `?environmentId=${encodeURIComponent(environmentId)}`
    : "";
  const data = (await api.get(`/flags${query}`)).data;
  return Array.isArray(data) ? data : (data?.flags ?? []);
}

export async function getFlag(flagId) {
  const data = (await api.get(`/flags/${flagId}`)).data;
  return data?.flag ?? data;
}

export async function createFlag(payload) {
  const data = (await api.post("/flags", payload)).data;
  return data?.flag ?? data;
}

export async function updateFlag(flagId, payload) {
  const data = (await api.put(`/flags/${flagId}`, payload)).data;
  return data?.flag ?? data;
}

export async function deleteFlag(flagId) {
  return api.delete(`/flags/${flagId}`);
}
