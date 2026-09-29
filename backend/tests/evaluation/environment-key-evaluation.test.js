const {
  describe,
  it,
  before,
  after,
  beforeEach,
  afterEach,
} = require("node:test");
const {
  request,
  app,
  connectDatabase,
  disconnectDatabase,
  clearDatabase,
  createEvaluationContext,
  createFlag,
  evaluate,
  keyService,
} = require("./helpers");

before(connectDatabase);
afterEach(clearDatabase);
after(disconnectDatabase);

describe("Environment-key evaluation authentication", () => {
  let context;

  beforeEach(async () => {
    context = await createEvaluationContext("evaluation-key-auth");
  });

  it("rejects missing, invalid, and revoked environment keys", async () => {
    await createFlag(context.environment._id, "checkout", true);
    await request(app)
      .post("/api/v1/evaluate")
      .send({ identifier: "user_1" })
      .expect(401);
    await evaluate("not-a-real-key", "user_1").expect(401);

    await keyService.revokeKey(
      context.environment._id,
      context.keyDoc._id,
      context.ownerId,
    );
    await evaluate(context.rawKey, "user_1").expect(401);
  });
});
