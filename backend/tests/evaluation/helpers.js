require("../setup-env");

const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../src/app");
const Environment = require("../../src/modules/environments/environment.model");
const EnvironmentKey = require("../../src/modules/environment-keys/key.model");
const Flag = require("../../src/modules/flags/flag.model");
const Identity = require("../../src/modules/identities/identity.model");
const Project = require("../../src/modules/project/project.model");
const keyService = require("../../src/modules/environment-keys/key.service");

let mongod;

const connectDatabase = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Promise.all([
    EnvironmentKey.syncIndexes(),
    Flag.syncIndexes(),
    Identity.syncIndexes(),
  ]);
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();
  await mongod.stop();
};

const clearDatabase = async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
};

const createEvaluationContext = async (slug) => {
  const ownerId = new mongoose.Types.ObjectId();
  const project = await Project.create({ ownerId, name: slug, slug });
  const environment = await Environment.create({
    projectId: project._id,
    name: "Production",
    type: "production",
    createdBy: ownerId,
  });
  const { keyDoc, rawKey } = await keyService.createKey({
    environmentId: environment._id,
    label: "Evaluation test key",
    userId: ownerId,
  });

  return { ownerId, project, environment, keyDoc, rawKey };
};

const createFlag = async (
  environmentId,
  name,
  enabled,
  targetingRules = [],
) => {
  const environment = await Environment.findById(environmentId)
    .select("projectId")
    .lean();
  const project = await Project.findById(environment.projectId)
    .select("ownerId")
    .lean();
  return Flag.create({
    ownerId: project.ownerId,
    environmentId,
    name,
    enabled,
    targetingRules,
  });
};

const createIdentity = (environmentId, identifier, traits) =>
  Identity.create({ environmentId, identifier, traits });

const evaluate = (rawKey, identifier) =>
  request(app)
    .post("/api/v1/evaluate")
    .set("x-environment-key", rawKey)
    .send({ identifier });

module.exports = {
  request,
  app,
  EnvironmentKey,
  connectDatabase,
  disconnectDatabase,
  clearDatabase,
  createEvaluationContext,
  createFlag,
  createIdentity,
  evaluate,
  keyService,
};
