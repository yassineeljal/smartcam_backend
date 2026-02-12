const errorHandler = (err, req, res, _next) => {
  console.error("Erreur serveur :", err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Erreur interne du serveur",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
