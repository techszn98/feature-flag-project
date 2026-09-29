require("../setup-env");

const {
  describe,
  it,
  before,
  after,
  beforeEach,
  afterEach,
} = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const Identity = require("../../src/modules/identities/identity.model");
const Environment = require("../../src/modules/environments/environment.model");
const Project = require("../../src/modules/project/project.model");

let mongod;

const registerAndLogin = async (email) => {
  const password = "password123";
  await request(app)
    .post("/api/v1/auth/register")
    .send({ email, password })
    .expect(201);
  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password })
    .expect(200);
  return { token: response.body.data.token, id: response.body.data.user.id };
};

const createEnvironment = async (userId, slug, type = "production") => {
  const project = await Project.create({ ownerId: userId, name: slug, slug });
  return Environment.create({
    projectId: project._id,
    name: type,
    type,
    createdBy: userId,
  });
};

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Identity.syncIndexes();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("Identity management", () => {
  let user;
  let environment;

  beforeEach(async () => {
    user = await registerAndLogin("identity@example.com");
    environment = await createEnvironment(user.id, "identity-project");
  });

  it("creates, retrieves, updates identity traits, and deletes an identity", async () => {
    const auth = { Authorization: `Bearer ${user.token}` };
    const created = await request(app)
      .post("/api/v1/identities")
      .set(auth)
      .send({
        environmentId: String(environment._id),
        identifier: "user_123",
        traits: { plan: "free", country: "Nigeria" },
      })
      .expect(201);

    assert.equal(created.body.data.identity.identifier, "user_123");
    assert.deepEqual(created.body.data.identity.traits, {
      plan: "free",
      country: "Nigeria",
    });

    const scope = `?environmentId=${environment._id}`;
    const fetched = await request(app)
      .get(`/api/v1/identities/user_123${scope}`)
      .set(auth)
      .expect(200);
    assert.equal(fetched.body.data.identity.id, created.body.data.identity.id);

    const updated = await request(app)
      .put(`/api/v1/identities/user_123/traits${scope}`)
      .set(auth)
      .send({ traits: { plan: "premium", age: 25 } })
      .expect(200);
    assert.deepEqual(updated.body.data.identity.traits, {
      plan: "premium",
      country: "Nigeria",
      age: 25,
    });

    await request(app)
      .put(`/api/v1/identities/user_123${scope}`)
      .set(auth)
      .send({ identifier: "user_456" })
      .expect(200);
    await request(app)
      .delete(`/api/v1/identities/user_456${scope}`)
      .set(auth)
      .expect(200);
    await request(app)
      .get(`/api/v1/identities/user_456${scope}`)
      .set(auth)
      .expect(404);
  });
});
