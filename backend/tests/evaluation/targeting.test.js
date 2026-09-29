const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  evaluateFlag,
  matchesRule,
} = require("../../src/modules/evaluation/evaluation.service");

test("targeting rules support nested equality, membership, and numeric comparisons", () => {
  const traits = { account: { plan: "premium" }, age: 25, country: "Nigeria" };

  assert.equal(
    matchesRule(
      { trait: "account.plan", operator: "equals", value: "premium" },
      traits,
    ),
    true,
  );
  assert.equal(
    matchesRule(
      { trait: "country", operator: "in", value: ["Nigeria", "Ghana"] },
      traits,
    ),
    true,
  );
  assert.equal(
    matchesRule(
      { trait: "age", operator: "greaterThanOrEqual", value: 18 },
      traits,
    ),
    true,
  );
  assert.equal(
    matchesRule({ trait: "missing", operator: "exists", value: false }, traits),
    true,
  );
});

test("the first matching targeting rule overrides the flag default", () => {
  const flag = {
    enabled: false,
    targetingRules: [
      { trait: "plan", operator: "equals", value: "premium", enabled: true },
      {
        trait: "country",
        operator: "equals",
        value: "Nigeria",
        enabled: false,
      },
    ],
  };

  assert.equal(
    evaluateFlag(flag, { plan: "premium", country: "Nigeria" }),
    true,
  );
  assert.equal(evaluateFlag(flag, { plan: "free", country: "Nigeria" }), false);
  assert.equal(evaluateFlag(flag, { plan: "free", country: "Canada" }), false);
});
