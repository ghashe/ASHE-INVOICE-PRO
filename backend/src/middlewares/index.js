// index.js
/**
 * This module centralizes and re-exports authentication middleware functionalities
 * for easier and more organized imports across the application.
 * The `index.js` file serves as the entry point for all middleware functions within the `middlewares` directory.
 */

// Import the authentication middleware function from the authMiddleware file.
const { requireAuthentication } = require("./authMiddleware");

/**
 * Exports a collection of middleware functions for external use.
 * This allows other parts of the application to easily access middleware functionalities by importing from this module.
 *
 * @module middlewares
 */
module.exports = {
  requireAuthentication, // Export the authentication middleware function for use in route protection.
};
