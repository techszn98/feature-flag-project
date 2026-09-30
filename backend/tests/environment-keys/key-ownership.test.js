require("../setup-env");

const { describe, it, before, after, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const Project = require("../../src/modules/project/project.model");
const Environment = require("../../src/modules/environments/environment.model");

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

const createEnvironment = async (userId, slug) => {
  const project = await Project.create({ ownerId: userId, name: slug, slug });
  return Environment.create({
    projectId: project._id,
    name: "Production",
    type: "production",
    createdBy: userId,
  });
};

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("Environment key ownership", () => {
  it("prevents another user from creating, listing, or revoking environment keys", async () => {
    const owner = await registerAndLogin("key-owner@example.com");
    const other = await registerAndLogin("key-other@example.com");
    const environment = await createEnvironment(owner.id, "key-owner-project");
    const ownerAuth = { Authorization: `Bearer ${owner.token}` };
    const otherAuth = { Authorization: `Bearer ${other.token}` };
    const keyPath = `/api/v1/environments/${environment._id}/keys`;

    const created = await request(app)
      .post(keyPath)
      .set(ownerAuth)
      .send({ label: "owner key" })
      .expect(201);

    await request(app).get(keyPath).set(otherAuth).expect(404);
    await request(app)
      .post(keyPath)
      .set(otherAuth)
      .send({ label: "foreign" })
      .expect(404);
    await request(app)
      .delete(`${keyPath}/${created.body.data.id}`)
      .set(otherAuth)
      .expect(404);

    const ownerList = await request(app)
      .get(keyPath)
      .set(ownerAuth)
      .expect(200);
    assert.equal(ownerList.body.data.length, 1);
    await request(app)
      .delete(`${keyPath}/${created.body.data.id}`)
      .set(ownerAuth)
      .expect(200);
  });
});
