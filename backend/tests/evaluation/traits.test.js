const {
  describe,
  it,
  before,
  after,
  beforeEach,
  afterEach,
} = require("node:test");
const assert = require("node:assert/strict");
const {
  connectDatabase,
  disconnectDatabase,
  clearDatabase,
  createEvaluationContext,
  createFlag,
  createIdentity,
  evaluate,
} = require("./helpers");

before(connectDatabase);
afterEach(clearDatabase);
after(disconnectDatabase);

describe("Trait-based evaluation", () => {
  let context;

  beforeEach(async () => {
    context = await createEvaluationContext("evaluation-traits");
  });

  it("reads traits from the existing identity model to determine flag results", async () => {
    await createIdentity(context.environment._id, "user_123", {
      plan: "premium",
      country: "Nigeria",
    });
    await createFlag(context.environment._id, "premium_reports", false, [
      { trait: "plan", operator: "equals", value: "premium", enabled: true },
    ]);
    await createFlag(context.environment._id, "nigeria_only", false, [
      { trait: "country", operator: "equals", value: "Nigeria", enabled: true },
    ]);

    const response = await evaluate(context.rawKey, "user_123").expect(200);
    assert.deepEqual(response.body.data.flags, {
      nigeria_only: true,
      premium_reports: true,
    });
  });
});
