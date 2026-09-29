const keyService = require('./key.service');

async function createKey(req, res, next) {
  try {
    const { id: environmentId } = req.params;
    const { label } = req.body;

    const { keyDoc, rawKey } = await keyService.createKey({
      environmentId,
      label,
      userId: req.user.id,
    });

    // This is the ONLY time the raw key is ever sent to the client.
    res.status(201).json({
      success: true,
      message: 'Environment key created successfully. Save it now — it will not be shown again.',
      data: {
        id: keyDoc._id,
        key: rawKey,
        preview: keyDoc.keyPreview,
        label: keyDoc.label,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function listKeys(req, res, next) {
  try {
    const { id: environmentId } = req.params;
    const keys = await keyService.listKeys(environmentId);

    res.status(200).json({
      success: true,
      message: 'Environment keys retrieved successfully',
      data: keys,
    });
  } catch (err) {
    next(err);
  }
}

async function revokeKey(req, res, next) {
  try {
    const { id: environmentId, keyId } = req.params;
    const revoked = await keyService.revokeKey(environmentId, keyId);

    if (!revoked) {
      return res.status(404).json({
        success: false,
        message: 'Key not found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Environment key revoked successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createKey, listKeys, revokeKey };