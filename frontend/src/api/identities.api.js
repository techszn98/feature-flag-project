import { api } from "./client.js";

export async function updateIdentityTraits(environmentId, identifier, traits) {
  const path = `/identities/${encodeURIComponent(identifier)}/traits?environmentId=${encodeURIComponent(environmentId)}`;
  return (await api.put(path, { traits })).data.identity;
}

export async function createIdentity(environmentId, identifier, traits) {
  return (await api.post("/identities", { environmentId, identifier, traits }))
    .data.identity;
}