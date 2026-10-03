export function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

export function formatApiBaseUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

export const API_REFERENCE_GROUPS = [
  {
    id: "authentication",
    title: "Authentication",
    auth: "Public, except session endpoints",
    endpoints: [
      {
        method: "POST",
        path: "/auth/register",
        summary: "Create a client account",
        request: { email: "dev@example.com", password: "••••••••" },
        response: { success: true, data: { userId: "user_id" } },
      },
      {
        method: "POST",
        path: "/auth/verify-email",
        summary: "Verify the email with its six-digit code",
        request: { email: "dev@example.com", otp: "123456" },
        response: { success: true, data: { verified: true } },
      },
      {
        method: "POST",
        path: "/auth/login",
        summary: "Exchange email and password for access tokens",
        request: { email: "dev@example.com", password: "••••••••" },
        response: {
          success: true,
          data: {
            accessToken: "<JWT>",
            refreshToken: "<refresh token>",
            user: { email: "dev@example.com" },
          },
        },
      },
      {
        method: "POST",
        path: "/auth/google",
        summary: "Authenticate with a Google ID token",
        request: { idToken: "<Google ID token>" },
        response: {
          success: true,
          data: { accessToken: "<JWT>", refreshToken: "<refresh token>" },
        },
      },
      {
        method: "GET",
        path: "/auth/me",
        summary: "Get the current authenticated user",
        auth: "Bearer JWT",
        response: {
          success: true,
          data: { user: { email: "dev@example.com" } },
        },
      },
      {
        method: "POST",
        path: "/auth/refresh",
        summary: "Rotate an access and refresh token",
        request: { refreshToken: "<refresh token>" },
        response: {
          success: true,
          data: { accessToken: "<JWT>", refreshToken: "<refresh token>" },
        },
      },
      {
        method: "POST",
        path: "/auth/logout",
        summary: "Revoke a refresh-token session",
        request: { refreshToken: "<refresh token>" },
        response: { success: true, message: "Logged out successfully" },
      },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    auth: "Bearer JWT · owned resources",
    endpoints: [
      {
        method: "POST",
        path: "/projects",
        summary: "Create an owned project",
        request: { name: "Web application", description: "Release controls" },
        response: {
          success: true,
          data: { project: { id: "project_id", name: "Web application" } },
        },
      },
      {
        method: "GET",
        path: "/projects",
        summary: "List the current user's projects",
        response: { success: true, data: { projects: [] } },
      },
      {
        method: "GET",
        path: "/projects/:projectId",
        summary: "Get an owned project",
      },
      {
        method: "PATCH",
        path: "/projects/:projectId",
        summary: "Update an owned project",
        request: { name: "Web application" },
      },
      {
        method: "DELETE",
        path: "/projects/:projectId",
        summary: "Delete a project without environments",
      },
    ],
  },
  {
    id: "environments",
    title: "Environments",
    auth: "Bearer JWT · project ownership required",
    endpoints: [
      {
        method: "POST",
        path: "/projects/:projectId/environments",
        summary: "Create an environment",
        request: { name: "Production", type: "production" },
      },
      {
        method: "GET",
        path: "/projects/:projectId/environments",
        summary: "List environments for an owned project",
      },
      {
        method: "GET",
        path: "/environments/:id",
        summary: "Get an owned environment",
      },
      {
        method: "PUT",
        path: "/environments/:id",
        summary: "Update an environment",
        request: { name: "Production" },
      },
      {
        method: "DELETE",
        path: "/environments/:id",
        summary: "Delete an environment and its runtime data",
      },
    ],
  },
  {
    id: "flags",
    title: "Feature flags",
    auth: "Bearer JWT · owned project environment required",
    endpoints: [
      {
        method: "POST",
        path: "/flags",
        summary: "Create a flag in an environment",
        request: {
          name: "checkout_redesign",
          environmentId: "<environment id>",
          enabled: false,
          targetingRules: [],
        },
        response: {
          success: true,
          data: {
            flag: {
              id: "flag_id",
              name: "checkout_redesign",
              enabled: false,
              targetingRules: [],
            },
          },
        },
      },
      {
        method: "GET",
        path: "/flags?environmentId=:environmentId",
        summary: "List flags, optionally filtered by environment",
        response: { success: true, data: { flags: [] } },
      },
      { method: "GET", path: "/flags/:id", summary: "Get an owned flag" },
      {
        method: "PUT",
        path: "/flags/:id",
        summary: "Update an owned flag",
        request: {
          name: "checkout_redesign",
          enabled: true,
          targetingRules: [],
        },
      },
      { method: "DELETE", path: "/flags/:id", summary: "Delete an owned flag" },
    ],
  },
  {
    id: "environment-keys",
    title: "Environment keys",
    auth: "Bearer JWT",
    endpoints: [
      {
        method: "POST",
        path: "/environments/:id/keys",
        summary: "Generate a runtime key",
        request: { name: "Production SDK" },
      },
    ],
  },
  {
    id: "runtime",
    title: "Runtime operations",
    auth: "X-Environment-Key",
    endpoints: [
      {
        method: "POST",
        path: "/evaluate",
        summary: "Evaluate flags for an identity",
        request: { identifier: "user_123", traits: { beta_tester: true } },
        response: {
          success: true,
          data: { flags: { checkout_redesign: false } },
        },
      },
      {
        method: "POST",
        path: "/identities",
        summary: "Create an identity",
        request: {
          environmentId: "<environment id>",
          identifier: "user_123",
          traits: {},
        },
      },
      {
        method: "GET",
        path: "/identities/:identifier?environmentId=:environmentId",
        summary: "Get an identity in an environment",
      },
      {
        method: "PUT",
        path: "/identities/:identifier/traits?environmentId=:environmentId",
        summary: "Merge traits into an identity",
        request: { traits: { beta_tester: true } },
      },
      {
        method: "DELETE",
        path: "/identities/:identifier?environmentId=:environmentId",
        summary: "Delete an identity from an environment",
      },
    ],
  },
];
