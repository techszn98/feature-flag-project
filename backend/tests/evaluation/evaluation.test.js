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
  evaluate,
} = require("./helpers");

before(connectDatabase);
afterEach(clearDatabase);
after(disconnectDatabase);

describe("Flag evaluation", () => {
  let context;

  beforeEach(async () => {
    context = await createEvaluationContext("evaluation-defaults");
  });

  it("returns each environment flag default for an identity without stored traits", async () => {
    await createFlag(context.environment._id, "new_checkout", false);
    await createFlag(context.environment._id, "dark_mode", true);

    const response = await evaluate(context.rawKey, "new_user").expect(200);
    assert.deepEqual(response.body.data.flags, {
      dark_mode: true,
      new_checkout: false,
    });
    assert.equal(
      String(response.body.data.environmentId),
      String(context.environment._id),
    );
  });
});
