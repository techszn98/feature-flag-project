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
  request,
  app,
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

describe("Evaluation environment isolation", () => {
  let first;
  let second;

  beforeEach(async () => {
    first = await createEvaluationContext("evaluation-first-client");
    second = await createEvaluationContext("evaluation-second-client");
  });

  it("only returns flags for the environment bound to the supplied key", async () => {
    await createFlag(first.environment._id, "first_environment_flag", true);
    await createFlag(second.environment._id, "second_environment_flag", true);

    const response = await evaluate(first.rawKey, "user_1").expect(200);
    assert.deepEqual(response.body.data.flags, {
      first_environment_flag: true,
    });
  });

  it("does not allow callers to override key environment or submit invalid identities", async () => {
    await evaluate(first.rawKey, "bad identifier").expect(400);
    await request(app)
      .post("/api/v1/evaluate")
      .set("x-environment-key", first.rawKey)
      .send({
        identifier: "user_1",
        environmentId: String(second.environment._id),
      })
      .expect(400);
  });
});
