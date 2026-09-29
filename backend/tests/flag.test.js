require("./setup-env");

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
const app = require("../src/app");
const Flag = require("../src/modules/flags/flag.model");
const Project = require("../src/modules/project/project.model");
const Environment = require("../src/modules/environments/environment.model");

let mongod;

const registerAndLogin = async (email) => {
  const password = "password123";
  await request(app)
    .post("/api/v1/auth/register")
    .send({ email, password })
    .expect(201);
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password })
    .expect(200);
  return { token: res.body.data.token, id: res.body.data.user.id };
};

const createFlag = (token, body) =>
  request(app)
    .post("/api/v1/flags")
    .set("Authorization", `Bearer ${token}`)
    .send(body);

const createEnvironment = async (ownerId, slug, type = "production") => {
  const project = await Project.create({ ownerId, name: slug, slug });
  return Environment.create({
    projectId: project._id,
    name: type,
    type,
    createdBy: ownerId,
  });
};

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Flag.syncIndexes();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("Feature flag CRUD", () => {
  let user;
  let environment;

  beforeEach(async () => {
    user = await registerAndLogin("flags@example.com");
    environment = await createEnvironment(user.id, "flags-project");
  });

  it("requires authentication for flag management", async () => {
    await request(app).get("/api/v1/flags").expect(401);
    await request(app).post("/api/v1/flags").send({}).expect(401);
  });

  it("validates required fields, boolean state, and server-owned fields", async () => {
    const auth = { Authorization: `Bearer ${user.token}` };
    await createFlag(user.token, { name: "new_checkout" }).expect(400);
    await createFlag(user.token, {
      name: "new_checkout",
      environmentId: String(environment._id),
      enabled: "false",
    }).expect(400);
    await createFlag(user.token, {
      name: "new_checkout",
      environmentId: String(environment._id),
      ownerId: new mongoose.Types.ObjectId().toString(),
    }).expect(400);
    assert.equal(await Flag.countDocuments(), 0);
    assert.ok(auth);
  });

  it("creates a disabled flag and lists flags by environment", async () => {
    await createFlag(user.token, {
      name: "new_checkout",
      environmentId: String(environment._id),
    }).expect(201);
    const staging = await createEnvironment(
      user.id,
      "flags-staging-project",
      "staging",
    );
    await createFlag(user.token, {
      name: "dark_mode",
      environmentId: String(staging._id),
      enabled: true,
    }).expect(201);

    const production = await request(app)
      .get(`/api/v1/flags?environmentId=${environment._id}`)
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);
    assert.equal(production.body.data.flags.length, 1);
    assert.equal(production.body.data.flags[0].name, "new_checkout");
    assert.equal(production.body.data.flags[0].enabled, false);
    assert.equal(production.body.data.flags[0].ownerId, user.id);
  });

  it("gets, updates with PUT, and deletes an owned flag", async () => {
    const created = await createFlag(user.token, {
      name: "new_checkout",
      environmentId: String(environment._id),
    });
    const { id } = created.body.data.flag;
    const auth = { Authorization: `Bearer ${user.token}` };

    await request(app).get(`/api/v1/flags/${id}`).set(auth).expect(200);
    const updated = await request(app)
      .put(`/api/v1/flags/${id}`)
      .set(auth)
      .send({ enabled: true })
      .expect(200);
    assert.equal(updated.body.data.flag.enabled, true);

    await request(app).delete(`/api/v1/flags/${id}`).set(auth).expect(200);
    await request(app).get(`/api/v1/flags/${id}`).set(auth).expect(404);
  });

  it("does not allow another user to read, update, or delete a flag", async () => {
    const other = await registerAndLogin("other@example.com");
    const otherEnvironment = await createEnvironment(
      other.id,
      "other-flags-project",
    );
    const created = await createFlag(other.token, {
      name: "new_checkout",
      environmentId: String(otherEnvironment._id),
    });
    const { id } = created.body.data.flag;
    const auth = { Authorization: `Bearer ${user.token}` };

    await request(app).get(`/api/v1/flags/${id}`).set(auth).expect(404);
    await request(app)
      .put(`/api/v1/flags/${id}`)
      .set(auth)
      .send({ enabled: true })
      .expect(404);
    await request(app).delete(`/api/v1/flags/${id}`).set(auth).expect(404);
    assert.equal((await Flag.findById(id)).enabled, false);
  });
});
