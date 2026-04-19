const authService = require("../services/auth.service");

exports.requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const token = header.split(" ")[1];
  const decoded = authService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  req.account = decoded;
  next();
};
