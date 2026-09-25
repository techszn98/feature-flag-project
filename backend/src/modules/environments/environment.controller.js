const environmentService = require('./environment.service');

// Same success/error response shape everywhere, matching the doc's contract.
async function createEnvironment(req, res, next) {
  try {
    const { projectId } = req.params;
    const { name, type } = req.body;

    const environment = await environmentService.createEnvironment({
      projectId,
      name,
      type,
      userId: req.user.id, // set by the auth middleware
    });

    res.status(201).json({
      success: true,
      message: 'Environment created successfully',
      data: environment,
    });
  } catch (err) {
    next(err); // hand off to the global error handler
  }
}

async function listEnvironments(req, res, next) {
  try {
    const { projectId } = req.params;
    const environments = await environmentService.listEnvironments(projectId);

    res.status(200).json({
      success: true,
      message: 'Environments retrieved successfully',
      data: environments,
    });
  } catch (err) {
    next(err);
  }
}

async function getEnvironment(req, res, next) {
  try {
    const environment = await environmentService.getEnvironmentById(req.params.id);

    if (!environment) {
      return res.status(404).json({
        success: false,
        message: 'Environment not found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Environment retrieved successfully',
      data: environment,
    });
  } catch (err) {
    next(err);
  }
}

async function updateEnvironment(req, res, next) {
  try {
    const environment = await environmentService.updateEnvironment(req.params.id, req.body);

    if (!environment) {
      return res.status(404).json({
        success: false,
        message: 'Environment not found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Environment updated successfully',
      data: environment,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteEnvironment(req, res, next) {
  try {
    const environment = await environmentService.deleteEnvironment(req.params.id);

    if (!environment) {
      return res.status(404).json({
        success: false,
        message: 'Environment not found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Environment deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createEnvironment,
  listEnvironments,
  getEnvironment,
  updateEnvironment,
  deleteEnvironment,
};