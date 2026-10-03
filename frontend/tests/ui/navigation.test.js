import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const routes = await readFile(
  fileURLToPath(new URL("../../src/routes/AppRoutes.jsx", import.meta.url)),
  "utf8",
);
const sidebar = await readFile(
  fileURLToPath(
    new URL("../../src/components/layout/Sidebar.jsx", import.meta.url),
  ),
  "utf8",
);

test("workspace routes are nested under the protected route", () => {
  const protectedGroup =
    routes.match(
      /<Route element={<ProtectedRoute\s*\/>}>([\s\S]*?)<\/Route>/,
    )?.[1] ?? "";
  for (const route of [
    "/dashboard",
    "/feature-flags",
    "/feature-flags/new",
    "/feature-flags/:flagId/edit",
  ]) {
    assert.ok(
      protectedGroup.includes(`path="${route}"`),
      `${route} should be protected`,
    );
  }
});

test("homepage and API reference remain public", () => {
  assert.match(routes, /<Route path="\/" element={<Homepage\s*\/>}\s*\/>/);
  assert.match(
    routes,
    /<Route path="\/api-reference" element={<ApiReference\s*\/>}\s*\/>/,
  );
});

test("sidebar exposes feature flag and API reference navigation", () => {
  assert.match(sidebar, /to:\s*"\/feature-flags"/);
  assert.match(sidebar, /to:\s*"\/api-reference"/);
});
