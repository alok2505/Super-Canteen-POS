const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: "Not authorized for this role" });
    }
  };
};

module.exports = roleMiddleware;
