// Import the jsonwebtoken library for handling JWT (JSON Web Token) operations.
const jwt = require("jsonwebtoken");

// Import the custom error class for handling authorization-related errors.
const AuthorizationError = require("../config/errors/AuthenticationError.js");

// Load the secret key for verifying the access token from environment variables.
const ACCESS_TOKEN_CONFIG = {
  secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
};

// Middleware function to enforce authentication on protected routes.
module.exports.requireAuthentication = async (req, res, next) => {
  try {
    // Extract the Authorization header from the incoming request.
    // The Authorization header typically contains the token used for authentication.
    const authorizationHeader = req.header("Authorization");

    // Check if the Authorization header is present and starts with "Bearer ".
    // "Bearer " is the expected prefix, indicating that the token follows this scheme.
    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new AuthorizationError(
        "Authentication Failure",
        undefined,
        "User is not authenticated.",
        {
          error: "access_token_invalid",
          error_description: "Unsupported authentication scheme.",
        }
      );
    }

    // Extract the token type and the actual access token from the Authorization header.
    // The Authorization header format is typically: "Bearer <token>"
    const [, accessToken] = authorizationHeader.split(" ");

    // Verify and decode the access token using the secret key.
    // This step ensures the token is valid and hasn't been tampered with.
    const decodedTokenPayload = jwt.verify(
      accessToken,
      ACCESS_TOKEN_CONFIG.secret
    );

    // Attach the authenticated user's ID and the access token to the request object.
    // This allows subsequent middleware or route handlers to access the authenticated user's details.
    req.userId = decodedTokenPayload._id;
    req.token = accessToken;

    // Call the next middleware or route handler in the stack.
    next();
  } catch (error) {
    // Log the error for debugging purposes.
    console.error(error);

    // Define the error response details for an expired access token.
    const tokenExpiredErrorResponse = {
      error: "access_token_expired",
      error_description:
        "The provided access token has expired. Please request a new token.",
    };

    // Check if the error is due to the token being expired.
    // Handle this specific error case by returning a detailed error response.
    if (error.name === "TokenExpiredError") {
      return next(
        new AuthorizationError(
          "Authentication Failure",
          undefined,
          "Access token validity period has expired.",
          tokenExpiredErrorResponse
        )
      );
    }

    // Pass any other errors to the next error-handling middleware.
    next(error);
  }
};
