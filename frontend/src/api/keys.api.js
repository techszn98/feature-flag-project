import { api } from "./client.js";

export async function createEnvironmentKey(environmentId, payload) {
  return (await api.post(`/environments/${environmentId}/keys`, payload)).data;
}

// These two are in the guide but not confirmed on your backend yet
export async function listEnvironmentKeys(environmentId) {
  return (await api.get(`/environments/${environmentId}/keys`)).data ?? [];
}

export async function revokeEnvironmentKey(environmentId, keyId) {
  return api.delete(`/environments/${environmentId}/keys/${keyId}`);
}