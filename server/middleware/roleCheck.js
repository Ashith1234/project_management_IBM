// Role-based authorization middleware
const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized, no user found');
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
        }

        next();
    };
};

module.exports = roleCheck;
