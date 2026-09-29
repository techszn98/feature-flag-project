export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export class ApiClient {
  constructor({
    baseUrl = "http://localhost:3000/api/v1",
    accessToken,
    fetchImpl = globalThis.fetch,
  } = {}) {
    if (typeof fetchImpl !== "function") {
      throw new TypeError("A fetch implementation is required");
    }

    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.accessToken = accessToken;
    this.fetch = fetchImpl;
  }

  async request(path, { method = "GET", body, headers } = {}) {
    const requestHeaders = new Headers(headers);
    requestHeaders.set("Accept", "application/json");

    if (body !== undefined)
      requestHeaders.set("Content-Type", "application/json");

    const token =
      typeof this.accessToken === "function"
        ? await this.accessToken()
        : this.accessToken;
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

    const response = await this.fetch(`${this.baseUrl}${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok || payload?.success === false) {
      throw new ApiError(
        payload?.message || `Request failed with status ${response.status}`,
        response.status,
        payload,
      );
    }

    return payload?.data ?? null;
  }
}
