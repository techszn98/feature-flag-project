const flagService = require("./flag.service");
const { sendSuccess } = require("../../utils/response");

const create = async (req, res, next) => {
  try {
    const flag = await flagService.createFlag(req.user._id, req.body);
    sendSuccess(res, 201, "Flag created successfully", { flag });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const flags = await flagService.listFlags(
      req.user._id,
      req.query.environmentId,
    );
    sendSuccess(res, 200, "Flags fetched", { flags });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const flag = await flagService.getFlag(req.params.id, req.user._id);
    sendSuccess(res, 200, "Flag fetched", { flag });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const flag = await flagService.updateFlag(
      req.params.id,
      req.user._id,
      req.body,
    );
    sendSuccess(res, 200, "Flag updated successfully", { flag });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await flagService.deleteFlag(req.params.id, req.user._id);
    sendSuccess(res, 200, "Flag deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = { create, list, getOne, update, remove };
