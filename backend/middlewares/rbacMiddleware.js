// authorize function takes an array of allowed roles
const authorize = (allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated. Missing user context.' });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
            message: `Forbidden. Role '${userRole}' is not allowed to access this resource.` 
        });
    }

    next();
};

export { authorize };