const identityService = require("./identity.service");
const { sendSuccess } = require("../../utils/response");

const createIdentity = async (req, res, next) => {
  try {
    const identity = await identityService.createIdentity(
      req.user._id,
      req.body,
    );
    sendSuccess(res, 201, "Identity created successfully", { identity });
  } catch (error) {
    next(error);
  }
};

const getIdentity = async (req, res, next) => {
  try {
    const identity = await identityService.getIdentity(
      req.user._id,
      req.query.environmentId,
      req.params.identifier,
    );
    sendSuccess(res, 200, "Identity fetched", { identity });
  } catch (error) {
    next(error);
  }
};

const updateIdentity = async (req, res, next) => {
  try {
    const identity = await identityService.updateIdentity(
      req.user._id,
      req.query.environmentId,
      req.params.identifier,
      req.body,
    );
    sendSuccess(res, 200, "Identity updated successfully", { identity });
  } catch (error) {
    next(error);
  }
};

const updateIdentityTraits = async (req, res, next) => {
  try {
    const identity = await identityService.updateIdentityTraits(
      req.user._id,
      req.query.environmentId,
      req.params.identifier,
      req.body.traits,
    );
    sendSuccess(res, 200, "Identity traits updated successfully", { identity });
  } catch (error) {
    next(error);
  }
};

const deleteIdentity = async (req, res, next) => {
  try {
    await identityService.deleteIdentity(
      req.user._id,
      req.query.environmentId,
      req.params.identifier,
    );
    sendSuccess(res, 200, "Identity deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIdentity,
  getIdentity,
  updateIdentity,
  updateIdentityTraits,
  deleteIdentity,
};
