// index.js

/**
 * This module aggregates and re-exports email-related functionalities for streamlined imports.
 * The `index.js` file serves as the entry point for email services within the `services/email` directory.
 */

// Import the function for sending emails with custom configuration
const { sendEmailWithCustomConfig } = require("./sendEmail");

// Import the core email service function that sends emails
const sendEmail = require("./emailService");

/**
 * Exports a set of email-related functions for external use.
 *
 * @module services/email
 */
module.exports = {
  sendEmailWithCustomConfig, // Function to send emails with custom configuration
  sendEmail, // Core function to send emails (without additional configuration)
};
