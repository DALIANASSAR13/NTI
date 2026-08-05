const AppError = require('../utils/AppError');

/**
 * Role-Based Access Control (RBAC) middleware factory.
 * Returns a middleware function that checks if the authenticated
 * user's role is in the list of allowed roles.
*/
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required before authorization.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

module.exports = authorize;
