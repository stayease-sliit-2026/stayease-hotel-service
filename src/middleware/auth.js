const axios = require("axios");

// Middleware to check whether the user is an admin
async function requireAdmin(req, res, next) {
  try {
    // Read Authorization header
    const authHeader = req.headers.authorization || "";

    // Check whether it starts with "Bearer "
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing or invalid Authorization header"
      });
    }

    // Extract token
    const token = authHeader.replace("Bearer ", "").trim();

    // Check if Auth Service URL exists in .env
    if (!process.env.AUTH_SERVICE_URL) {
      return res.status(500).json({
        message: "AUTH_SERVICE_URL is not configured"
      });
    }

    // Build the verify URL
    const verifyUrl = `${process.env.AUTH_SERVICE_URL}/auth/verify`;

    // Call Auth Service to verify token
    const response = await axios.get(verifyUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 5000
    });

    // Expected response example:
    // { valid: true, user: { id, email, role } }
    const user = response.data.user;

    if (!user) {
      return res.status(401).json({
        message: "Invalid token"
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    // Attach user info to request
    req.user = user;
    // Move to next middleware/controller
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token verification failed"
    });
  }
}

module.exports = { requireAdmin };