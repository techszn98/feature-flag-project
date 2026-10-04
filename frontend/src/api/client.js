import { clearSession, getAccessToken } from "../utils/storage.js";

const configuredApiUrl = import.meta.env.VITE_API_URL || "/api/v1";
export const API_BASE_URL = (
  import.meta.env.DEV ? "/api/v1" : configuredApiUrl
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const { auth = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});
  const accessToken = auth ? getAccessToken() : null;

  if (fetchOptions.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
    });
  } catch {
    throw new Error(
      "Could not reach the API. Check your connection and try again.",
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearSession();
      if (!["/login", "/register"].includes(window.location.pathname)) {
        window.location.assign("/login");
      }
    }
    const error = new Error(
      payload.message || "Something went wrong. Please try again.",
    );
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return {
    ...payload,
    status: response.status,
    data: payload.data ?? payload,
  };
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) =>
    request(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (path, body, options) =>
    request(path, { ...options, method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body, options) =>
    request(path, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
