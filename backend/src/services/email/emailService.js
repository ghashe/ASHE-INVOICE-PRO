// Import the emailTransporter module, which is used to send emails
const emailTransporter = require("nodemailer");

// Pull in environment variables related to email authentication
// These variables contain the username and password for the email service
const emailServiceConfig = {
  authUser: process.env.SMTP_USERNAME, // Email service username (from environment variables)
  authPass: process.env.SMTP_PASSWORD, // Email service password (from environment variables)
};

/**
 * Sends an email using the provided email options.
 *
 * @param {Object} emailMessageOptions - The email options containing 'from', 'to', 'subject', 'text', and 'html' fields.
 * @returns {Promise<Object>} - Returns a Promise that resolves with the email sending information.
 */
async function sendEmail(emailMessageOptions) {
  try {
    // Create a reusable transporter object using the default SMTP transport
    // Configured with SMTP server details and authentication credentials
    const transporter = emailTransporter.createTransport({
      host: "smtp.mailtrap.io", // SMTP server hostname (Mailtrap is used here for testing purposes)
      port: 2525, // SMTP port (standard for Mailtrap)
      auth: {
        user: emailServiceConfig.authUser, // Email service username
        pass: emailServiceConfig.authPass, // Email service password
      },
    });

    // Define the email to be sent with the provided email options
    const info = await transporter.sendMail({
      from: emailMessageOptions?.from, // Sender address (passed in the email options)
      to: emailMessageOptions?.to, // Recipient address (passed in the email options)
      subject: emailMessageOptions?.subject, // Subject of the email (passed in the email options)
      text: emailMessageOptions?.text, // Plain text body (passed in the email options)
      html: emailMessageOptions?.html, // HTML body (passed in the email options)
    });

    // Return the email sending information, including message ID and response
    return info;
  } catch (error) {
    // If an error occurs, throw it to be handled by the caller
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Export the sendEmail function for use in other parts of the application
module.exports = sendEmail;
