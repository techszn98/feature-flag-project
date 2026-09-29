const { AppError } = require('./error.middleware');

/**
 * Role-Based Access Control (RBAC) middleware
 * Ensures the authenticated user possesses one of the allowed roles
 *
 * @param  {...string} roles Allowed roles (e.g. 'Admin', 'Client')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required before authorization', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Forbidden: You do not have permission to access this resource', 403)
      );
    }

    next();
  };
};

module.exports = { authorize };
