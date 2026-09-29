require('./setup-env');

const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Project = require('../src/modules/project/project.model');

let mongod;

const registerAndLogin = async (email) => {
  const password = 'password123';
  await request(app).post('/api/v1/auth/register').send({ email, password }).expect(201);
  const res = await request(app).post('/api/v1/auth/login').send({ email, password }).expect(200);
  return { token: res.body.data.token, id: res.body.data.user.id };
};

const createProject = (token, body) =>
  request(app).post('/api/v1/projects').set('Authorization', `Bearer ${token}`).send(body);

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Project.syncIndexes();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Project CRUD', () => {
  let userA;

  beforeEach(async () => {
    userA = await registerAndLogin('a@example.com');
  });

  it('requires authentication', async () => {
    await request(app).get('/api/v1/projects').expect(401);
    await request(app).post('/api/v1/projects').send({ name: 'x' }).expect(401);
  });

  it('creates a project owned by the current user with a generated slug', async () => {
    const res = await createProject(userA.token, { name: 'Project One', description: 'first' });

    assert.equal(res.status, 201);
    const { project } = res.body.data;
    assert.equal(project.ownerId, userA.id);
    assert.equal(project.name, 'Project One');
    assert.equal(project.slug, 'project-one');
    assert.equal(project.description, 'first');
    assert.ok(project.createdAt);
    assert.ok(project.updatedAt);
  });

  it('accepts a custom slug', async () => {
    const res = await createProject(userA.token, { name: 'Web App', slug: 'web' });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.project.slug, 'web');
  });

  it('rejects an ownerId in the body so ownership cannot be assigned', async () => {
    const other = new mongoose.Types.ObjectId().toString();
    const res = await createProject(userA.token, { name: 'Sneaky', ownerId: other });

    assert.equal(res.status, 400);
    assert.equal(await Project.countDocuments(), 0);
  });

  it('validates the payload', async () => {
    assert.equal((await createProject(userA.token, {})).status, 400);
    assert.equal((await createProject(userA.token, { name: '   ' })).status, 400);
    assert.equal((await createProject(userA.token, { name: 'a'.repeat(101) })).status, 400);
    assert.equal((await createProject(userA.token, { name: 'ok', description: 5 })).status, 400);
    assert.equal((await createProject(userA.token, { name: 'ok', slug: 'Bad Slug' })).status, 400);
    assert.equal((await createProject(userA.token, { name: '!!!' })).status, 400);
  });

  it('rejects a duplicate slug for the same user', async () => {
    await createProject(userA.token, { name: 'Project One' }).expect(201);
    const res = await createProject(userA.token, { name: 'project one' });

    assert.equal(res.status, 409);
  });

  it('gets, updates and deletes an own project', async () => {
    const created = await createProject(userA.token, { name: 'Project One' });
    const { id } = created.body.data.project;
    const auth = { Authorization: `Bearer ${userA.token}` };

    const got = await request(app).get(`/api/v1/projects/${id}`).set(auth).expect(200);
    assert.equal(got.body.data.project.name, 'Project One');

    const renamed = await request(app)
      .patch(`/api/v1/projects/${id}`)
      .set(auth)
      .send({ name: 'Renamed', description: 'new' })
      .expect(200);
    assert.equal(renamed.body.data.project.name, 'Renamed');
    assert.equal(renamed.body.data.project.description, 'new');
    assert.equal(renamed.body.data.project.slug, 'project-one', 'slug stays stable on rename');

    const reslugged = await request(app)
      .patch(`/api/v1/projects/${id}`)
      .set(auth)
      .send({ slug: 'renamed' })
      .expect(200);
    assert.equal(reslugged.body.data.project.slug, 'renamed');

    await request(app).delete(`/api/v1/projects/${id}`).set(auth).expect(200);
    await request(app).get(`/api/v1/projects/${id}`).set(auth).expect(404);
  });

  it('rejects an empty update, an ownerId update and a malformed id', async () => {
    const created = await createProject(userA.token, { name: 'Project One' });
    const { id } = created.body.data.project;
    const auth = { Authorization: `Bearer ${userA.token}` };
    const other = new mongoose.Types.ObjectId().toString();

    await request(app).patch(`/api/v1/projects/${id}`).set(auth).send({}).expect(400);
    await request(app).patch(`/api/v1/projects/${id}`).set(auth).send({ ownerId: other }).expect(400);
    await request(app).get('/api/v1/projects/not-an-id').set(auth).expect(400);
  });
});

describe('Project ownership', () => {
  let userA;
  let userB;
  let projectOne;
  let projectTwo;
  let projectThree;

  beforeEach(async () => {
    userA = await registerAndLogin('a@example.com');
    userB = await registerAndLogin('b@example.com');

    projectOne = (await createProject(userA.token, { name: 'Project 1' })).body.data.project;
    projectTwo = (await createProject(userA.token, { name: 'Project 2' })).body.data.project;
    projectThree = (await createProject(userB.token, { name: 'Project 3' })).body.data.project;
  });

  it("lists only the current user's projects", async () => {
    const resA = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(200);
    const resB = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    assert.deepEqual(resA.body.data.projects.map((p) => p.name).sort(), ['Project 1', 'Project 2']);
    assert.deepEqual(resB.body.data.projects.map((p) => p.name), ['Project 3']);
  });

  it("user A cannot read, update or delete user B's project", async () => {
    const auth = { Authorization: `Bearer ${userA.token}` };
    const url = `/api/v1/projects/${projectThree.id}`;

    await request(app).get(url).set(auth).expect(404);
    await request(app).patch(url).set(auth).send({ name: 'Hijacked' }).expect(404);
    await request(app).delete(url).set(auth).expect(404);

    const stillThere = await Project.findById(projectThree.id);
    assert.equal(stillThere.name, 'Project 3');
  });

  it("user B cannot read, update or delete user A's projects", async () => {
    const auth = { Authorization: `Bearer ${userB.token}` };

    for (const project of [projectOne, projectTwo]) {
      const url = `/api/v1/projects/${project.id}`;
      await request(app).get(url).set(auth).expect(404);
      await request(app).patch(url).set(auth).send({ description: 'x' }).expect(404);
      await request(app).delete(url).set(auth).expect(404);
    }

    assert.equal(await Project.countDocuments({ ownerId: userA.id }), 2);
  });

  it('a foreign project looks the same as a non-existent one', async () => {
    const missingId = new mongoose.Types.ObjectId().toString();
    const auth = { Authorization: `Bearer ${userA.token}` };

    const foreign = await request(app).get(`/api/v1/projects/${projectThree.id}`).set(auth);
    const missing = await request(app).get(`/api/v1/projects/${missingId}`).set(auth);

    assert.equal(foreign.status, 404);
    assert.equal(foreign.status, missing.status);
    assert.deepEqual(foreign.body, missing.body);
  });

  it('different users may use the same project slug', async () => {
    const res = await createProject(userB.token, { name: 'Project 1' });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.project.slug, projectOne.slug);
  });
});
