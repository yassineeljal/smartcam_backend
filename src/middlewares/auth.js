const config = require("../config");

const requireApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "Cle API manquante. Header requis : x-api-key",
    });
  }

  if (apiKey !== config.apiKeyPython) {
    return res.status(403).json({
      success: false,
      error: "Cle API invalide",
    });
  }

  next();
};

module.exports = { requireApiKey };
