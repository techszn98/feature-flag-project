const projectService = require('./project.service');
const { sendSuccess } = require('../../utils/response');

const create = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user._id, req.body);
    sendSuccess(res, 201, 'Project created successfully', { project });
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const projects = await projectService.listProjects(req.user._id);
    sendSuccess(res, 200, 'Projects fetched', { projects });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const project = await projectService.getProject(req.params.projectId, req.user._id);
    sendSuccess(res, 200, 'Project fetched', { project });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(
      req.params.projectId,
      req.user._id,
      req.body
    );
    sendSuccess(res, 200, 'Project updated successfully', { project });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.projectId, req.user._id);
    sendSuccess(res, 200, 'Project deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, getOne, update, remove };
