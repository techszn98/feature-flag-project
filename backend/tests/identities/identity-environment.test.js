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
  registerAndLogin,
  createEnvironment,
} = require("./helpers");

before(connectDatabase);
afterEach(clearDatabase);
after(disconnectDatabase);

describe("Identity environment isolation", () => {
  let user;
  let otherUser;
  let production;
  let staging;
  let otherEnvironment;

  beforeEach(async () => {
    user = await registerAndLogin("identity-owner@example.com");
    otherUser = await registerAndLogin("identity-other@example.com");
    production = await createEnvironment(user.id, "identity-production");
    staging = await createEnvironment(user.id, "identity-staging");
    otherEnvironment = await createEnvironment(
      otherUser.id,
      "other-identity-project",
    );
  });

  it("keeps matching identifiers isolated between environments", async () => {
    const auth = { Authorization: `Bearer ${user.token}` };
    const create = (environmentId, plan) =>
      request(app)
        .post("/api/v1/identities")
        .set(auth)
        .send({
          environmentId: String(environmentId),
          identifier: "user_123",
          traits: { plan },
        });

    await create(production._id, "premium").expect(201);
    await create(staging._id, "free").expect(201);

    const productionIdentity = await request(app)
      .get(`/api/v1/identities/user_123?environmentId=${production._id}`)
      .set(auth)
      .expect(200);
    const stagingIdentity = await request(app)
      .get(`/api/v1/identities/user_123?environmentId=${staging._id}`)
      .set(auth)
      .expect(200);

    assert.equal(productionIdentity.body.data.identity.traits.plan, "premium");
    assert.equal(stagingIdentity.body.data.identity.traits.plan, "free");
    await create(production._id, "duplicate").expect(409);
  });

  it("prevents accessing identities through another client or the wrong environment", async () => {
    const ownerAuth = { Authorization: `Bearer ${user.token}` };
    const otherAuth = { Authorization: `Bearer ${otherUser.token}` };
    await request(app)
      .post("/api/v1/identities")
      .set(ownerAuth)
      .send({
        environmentId: String(production._id),
        identifier: "user_123",
        traits: { plan: "premium" },
      })
      .expect(201);

    await request(app)
      .get(`/api/v1/identities/user_123?environmentId=${staging._id}`)
      .set(ownerAuth)
      .expect(404);
    await request(app)
      .get(`/api/v1/identities/user_123?environmentId=${production._id}`)
      .set(otherAuth)
      .expect(404);
    await request(app)
      .post("/api/v1/identities")
      .set(ownerAuth)
      .send({
        environmentId: String(otherEnvironment._id),
        identifier: "foreign_user",
      })
      .expect(404);
    await request(app)
      .put(`/api/v1/identities/user_123/traits?environmentId=${production._id}`)
      .set(otherAuth)
      .send({ traits: { plan: "hacked" } })
      .expect(404);
  });
});
