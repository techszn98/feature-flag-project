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
  Identity,
  connectDatabase,
  disconnectDatabase,
  clearDatabase,
  registerAndLogin,
  createEnvironment,
} = require("./helpers");

before(connectDatabase);
afterEach(clearDatabase);
after(disconnectDatabase);

describe("Identity validation", () => {
  let user;
  let environment;

  beforeEach(async () => {
    user = await registerAndLogin("identity-validation@example.com");
    environment = await createEnvironment(
      user.id,
      "identity-validation-project",
    );
  });

  it("rejects missing or malformed fields and server-owned fields", async () => {
    const auth = { Authorization: `Bearer ${user.token}` };
    const url = "/api/v1/identities";

    await request(app)
      .post(url)
      .set(auth)
      .send({ identifier: "user_1" })
      .expect(400);
    await request(app)
      .post(url)
      .set(auth)
      .send({ environmentId: "bad-id", identifier: "user_1" })
      .expect(400);
    await request(app)
      .post(url)
      .set(auth)
      .send({ environmentId: String(environment._id), identifier: "user/1" })
      .expect(400);
    await request(app)
      .post(url)
      .set(auth)
      .send({
        environmentId: String(environment._id),
        identifier: "user_1",
        traits: [],
      })
      .expect(400);
    await request(app)
      .post(url)
      .set(auth)
      .send({
        environmentId: String(environment._id),
        identifier: "user_1",
        ownerId: user.id,
      })
      .expect(400);
    await request(app)
      .post(url)
      .set(auth)
      .send(
        JSON.parse(
          '{"environmentId":"' +
            environment._id +
            '","identifier":"user_1","traits":{"constructor":{"prototype":{}}}}',
        ),
      )
      .expect(400);

    assert.equal(await Identity.countDocuments(), 0);
  });

  it("requires a valid environment scope and valid identifier for retrieval", async () => {
    const auth = { Authorization: `Bearer ${user.token}` };

    await request(app).get("/api/v1/identities/user_1").set(auth).expect(400);
    await request(app)
      .get(
        `/api/v1/identities/bad%20identifier?environmentId=${environment._id}`,
      )
      .set(auth)
      .expect(400);
    await request(app)
      .get("/api/v1/identities/user_1?environmentId=invalid")
      .set(auth)
      .expect(400);
    await request(app).get("/api/v1/identities/user_1").expect(401);
  });
});
