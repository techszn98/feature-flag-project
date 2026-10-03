import test from "node:test";
import assert from "node:assert/strict";
import {
  API_REFERENCE_GROUPS,
  formatApiBaseUrl,
  formatJson,
} from "../../src/utils/formatters.js";

test("reference covers actual project and flag CRUD verbs and paths", () => {
  const endpoints = API_REFERENCE_GROUPS.flatMap((group) => group.endpoints);
  const paths = new Set(
    endpoints.map(({ method, path }) => `${method} ${path}`),
  );
  for (const endpoint of [
    "POST /projects",
    "GET /projects",
    "GET /projects/:projectId",
    "PATCH /projects/:projectId",
    "DELETE /projects/:projectId",
    "POST /flags",
    "GET /flags?environmentId=:environmentId",
    "GET /flags/:id",
    "PUT /flags/:id",
    "DELETE /flags/:id",
  ])
    assert.ok(paths.has(endpoint), `${endpoint} should be documented`);
});

test("base URL and request examples format predictably", () => {
  assert.equal(
    formatApiBaseUrl("https://api.example.test/api/v1///"),
    "https://api.example.test/api/v1",
  );
  assert.equal(formatJson({ enabled: true }), '{\n  "enabled": true\n}');
});
