// Import the email service function that handles sending emails
const sendEmail = require("./emailService");

// Configuration object for the default email sender details, using environment variables for security
const defaultEmailConfig = {
  from: process.env.EMAIL_FROM, // Default "from" email address
};

/**
 * Sends an email using the provided custom options, merged with the default configuration.
 *
 * @param {Object} customEmailOptions - Custom options to override or extend the default email configuration.
 * @returns {Promise} - Resolves when the email is successfully sent, or rejects if there is an error.
 */
function sendEmailWithCustomConfig(customEmailOptions = {}) {
  // Merge custom email options with the default configuration
  const mergedEmailOptions = {
    ...defaultEmailConfig, // Spread operator used for merging objects in a clean, modern way
    ...customEmailOptions,
  };

  // Call the sendEmail function with the merged options
  return sendEmail(mergedEmailOptions);
}

// Export the sendEmailWithCustomConfig function for use in other parts of the application
module.exports = {
  sendEmailWithCustomConfig,
};
