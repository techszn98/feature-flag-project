import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const responsiveCss = await readFile(
  fileURLToPath(new URL("../../src/styles/responsive.css", import.meta.url)),
  "utf8",
);
const homepageMarkup = await readFile(
  fileURLToPath(new URL("../../src/pages/home/Homepage.jsx", import.meta.url)),
  "utf8",
);
const homepageCss = await readFile(
  fileURLToPath(new URL("../../src/styles/homepage.css", import.meta.url)),
  "utf8",
);

test("workspace navigation and content have tablet and phone layouts", () => {
  assert.match(responsiveCss, /@media\s*\(max-width:\s*1000px\)/);
  assert.match(responsiveCss, /@media\s*\(max-width:\s*760px\)/);
  assert.match(
    responsiveCss,
    /\.workspace-toolbar\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
  );
});

test("code blocks preserve readable horizontal scrolling", async () => {
  const baseCss = await readFile(
    fileURLToPath(new URL("../../src/styles.css", import.meta.url)),
    "utf8",
  );
  assert.match(baseCss, /\.code-block\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(responsiveCss, /\.code-block-shell\s*\{[^}]*min-width:\s*0/s);
});

test("interactive controls keep a practical touch target", () => {
  assert.match(
    responsiveCss,
    /\.button-secondary\s*\{[^}]*min-height:\s*42px/s,
  );
  assert.match(responsiveCss, /\.flag-toggle\s*input\s*\{[^}]*width:\s*20px/s);
});

test("phone navigation exposes theme control beside the menu button", () => {
  assert.match(
    homepageMarkup,
    /<div className="home-header-controls">[\s\S]*?<ThemeToggle variant="home" \/>[\s\S]*?className="home-menu-button"/,
  );
  assert.match(
    homepageCss,
    /@media\s*\(max-width:\s*820px\)[\s\S]*?\.home-header-controls\s*\{[^}]*display:\s*flex/s,
  );
  assert.match(
    homepageCss,
    /@media\s*\(max-width:\s*560px\)[\s\S]*?\.home-hero h1\s*\{[^}]*font-size:/s,
  );
});
