import { clearSession, getAccessToken } from "../utils/storage.js";

const configuredApiUrl = import.meta.env.VITE_API_URL || "/api/v1";
export const API_BASE_URL = (
  import.meta.env.DEV ? "/api/v1" : configuredApiUrl
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const accessToken = getAccessToken();

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Could not reach the API. Check your connection and try again.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      if (!["/login", "/register"].includes(window.location.pathname)) {
        window.location.assign("/login");
      }
    }
    throw new Error(
      payload.message || "Something went wrong. Please try again.",
    );
  }

  return payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) =>
    request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
