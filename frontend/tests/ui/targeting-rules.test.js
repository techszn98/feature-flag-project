import test from "node:test";
import assert from "node:assert/strict";
import {
  createRuleDraft,
  serializeTargetingRules,
} from "../../src/utils/targetingRules.js";

test("flag targeting rules serialize to the backend schema", () => {
  const drafts = [
    {
      trait: "plan",
      operator: "equals",
      value: "pro",
      valueType: "text",
      enabled: true,
    },
    {
      trait: "country",
      operator: "in",
      value: "US, CA, GB",
      valueType: "text-list",
      enabled: true,
    },
    {
      trait: "beta_tester",
      operator: "equals",
      value: "true",
      valueType: "boolean",
      enabled: false,
    },
  ];

  assert.deepEqual(serializeTargetingRules(drafts), {
    targetingRules: [
      { trait: "plan", operator: "equals", value: "pro", enabled: true },
      {
        trait: "country",
        operator: "in",
        value: ["US", "CA", "GB"],
        enabled: true,
      },
      { trait: "beta_tester", operator: "equals", value: true, enabled: false },
    ],
  });
});

test("blank targeting rules and invalid rules are handled explicitly", () => {
  assert.deepEqual(serializeTargetingRules([]), { targetingRules: [] });
  assert.match(
    serializeTargetingRules([
      { ...createRuleDraft(), trait: "bad trait", value: "x" },
    ]).error,
    /valid trait path/i,
  );
});
