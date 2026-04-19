function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  const payload = { message };
  if (err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
