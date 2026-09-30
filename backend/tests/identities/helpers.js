require("../setup-env");

const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const Identity = require("../../src/modules/identities/identity.model");
const Environment = require("../../src/modules/environments/environment.model");
const Project = require("../../src/modules/project/project.model");

let mongod;

const connectDatabase = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Identity.syncIndexes();
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();
  await mongod.stop();
};

const clearDatabase = async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
};

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

module.exports = {
  request,
  app,
  Identity,
  connectDatabase,
  disconnectDatabase,
  clearDatabase,
  registerAndLogin,
  createEnvironment,
};
