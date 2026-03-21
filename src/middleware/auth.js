const axios = require("axios");
const jwt = require("jsonwebtoken");

function buildVerifyUrls() {
  if (!process.env.AUTH_SERVICE_URL) {
    return [];
  }

  const authBaseUrl = process.env.AUTH_SERVICE_URL.replace(/\/+$/, "");
  const verifyPath = process.env.AUTH_VERIFY_PATH || "/auth/verify";
  const normalizedVerifyPath = verifyPath.startsWith("/") ? verifyPath : `/${verifyPath}`;
  const primaryUrl = `${authBaseUrl}${normalizedVerifyPath}`;

  const urls = [primaryUrl];

  if (/localhost|127\.0\.0\.1/.test(authBaseUrl)) {
    const fallbackBaseUrl = authBaseUrl.includes(":3000")
      ? authBaseUrl.replace(/:3000$/, ":3001")
      : authBaseUrl.replace(/:3001$/, ":3000");

    if (fallbackBaseUrl !== authBaseUrl) {
      urls.push(`${fallbackBaseUrl}${normalizedVerifyPath}`);
    }
  }

  return urls;
}

function looksLikeJwt(token) {
  return typeof token === "string" && token.split(".").length === 3;
}

function verifyTokenLocally(token) {
  if (!process.env.JWT_SECRET || !looksLikeJwt(token)) {
    return { status: "skip" };
  }

  try {
    return { status: "ok", payload: jwt.verify(token, process.env.JWT_SECRET) };
  } catch (error) {
    console.error("[requireAdmin] Local JWT verification failed:", error.message);

    if (error.name === "TokenExpiredError") {
      return { status: "expired" };
    }

    return { status: "invalid" };
  }
}

// Middleware to check whether the user is an admin
async function requireAdmin(req, res, next) {
  try {
    // Read Authorization header
    const authHeader = req.headers.authorization || "";
    console.log("[requireAdmin] Incoming Authorization header:", authHeader);

    // Check whether it starts with "Bearer "
    if (!authHeader.startsWith("Bearer ")) {
      console.error("[requireAdmin] Missing or invalid Authorization header");
      return res.status(401).json({
        message: "Missing or invalid Authorization header"
      });
    }

    // Extract token
    const token = authHeader.replace("Bearer ", "").trim();
    console.log("[requireAdmin] Extracted token:", token);

    const localVerification = verifyTokenLocally(token);
    if (localVerification.status === "ok") {
      const localPayload = localVerification.payload;
      const localUser = {
        id: localPayload.id,
        role: localPayload.role,
        email: localPayload.email
      };

      if (localUser.role === "admin") {
        req.user = localUser;
        console.log("[requireAdmin] Local JWT verification succeeded:", localUser);
        return next();
      }

      console.error("[requireAdmin] Local JWT verified but user is not admin:", localUser);
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    if (localVerification.status === "expired") {
      return res.status(401).json({
        message: "Token expired. Please login again."
      });
    }

    // Check if Auth Service URL exists in .env
    if (!process.env.AUTH_SERVICE_URL) {
      console.error("[requireAdmin] AUTH_SERVICE_URL is not configured");
      return res.status(500).json({
        message: "AUTH_SERVICE_URL is not configured"
      });
    }

    const verifyUrls = buildVerifyUrls();
    console.log("[requireAdmin] Calling Auth Service verify URL:", verifyUrls[0]);

    // Call Auth Service to verify token. If the configured local port is stale,
    // try the alternate localhost port once before failing.
    let response;
    let lastError = null;

    for (const verifyUrl of verifyUrls) {
      try {
        response = await axios.get(verifyUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 5000
        });
        console.log("[requireAdmin] Auth Service response:", response.data);
        lastError = null;
        break;
      } catch (err) {
        lastError = err;

        const isConnectionRefused = err.code === "ECONNREFUSED" || err.cause?.code === "ECONNREFUSED";
        const isLocalAuthUrl = /localhost|127\.0\.0\.1/.test(verifyUrl);
        const hasMoreUrls = verifyUrls.length > 1 && verifyUrl !== verifyUrls[verifyUrls.length - 1];

        if (err.response) {
          console.error("[requireAdmin] Auth Service error response:", err.response.data);

          const isAuthInvalid = err.response.status === 401 && err.response.data && err.response.data.valid === false;
          const canTryNextUrl = verifyUrls.length > 1 && verifyUrl !== verifyUrls[verifyUrls.length - 1];

          if (isAuthInvalid && canTryNextUrl) {
            console.warn("[requireAdmin] Retrying token verification with alternate local auth URL:", verifyUrls[verifyUrls.indexOf(verifyUrl) + 1]);
            continue;
          }
        } else if (isConnectionRefused && isLocalAuthUrl && hasMoreUrls) {
          console.warn("[requireAdmin] Auth Service is unreachable, retrying alternate local auth URL:", verifyUrls[verifyUrls.indexOf(verifyUrl) + 1]);
          continue;
        } else {
          console.error("[requireAdmin] Auth Service request error:", err.message);
        }

        throw err;
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    // Expected response example:
    // { valid: true, user: { id, email, role } }
    const user = response.data.user;

    if (!user) {
      console.error("[requireAdmin] No user in Auth Service response");
      return res.status(401).json({
        message: "Invalid token"
      });
    }

    if (user.role !== "admin") {
      console.error("[requireAdmin] User is not admin:", user);
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    // Attach user info to request
    req.user = user;
    // Move to next middleware/controller
    next();
  } catch (error) {
    console.error("[requireAdmin] Exception:", error);
    return res.status(401).json({
      message: "Token verification failed"
    });
  }
}

module.exports = { requireAdmin };