const ACCESS_TOKEN_KEY = "feature-flag.access-token";
const REFRESH_TOKEN_KEY = "feature-flag.refresh-token";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeSession({ accessToken, token, refreshToken }) {
  const resolvedAccessToken = accessToken || token;
  if (!resolvedAccessToken)
    throw new Error("The API did not return an access token.");
  localStorage.setItem(ACCESS_TOKEN_KEY, resolvedAccessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
