const { body, param } = require("express-validator");
const User = require("../models/userModel");

/**
 * Validates login credentials:
 * - Ensures email is provided and formatted correctly.
 * - Ensures password is provided.
 */
module.exports.validateLoginCredentials = [
  body("email")
    .trim() // Remove any leading or trailing whitespace
    .notEmpty()
    .withMessage("Email cannot be empty") // Error message for empty email
    .bail() // Stop running validations if the previous one fails
    .isEmail()
    .withMessage("Invalid email format"), // Error message for invalid email format

  body("password").notEmpty().withMessage("Password cannot be empty"), // Error message for empty password
];

/**
 * Validates signup data:
 * - Ensures first name is provided.
 * - Ensures last name is provided.
 * - Ensures email is provided, formatted correctly, and not already in use.
 * - Ensures password is provided and meets minimum length requirement.
 */
module.exports.validateSignupData = [
  body("firstName")
    .trim() // Remove any leading or trailing whitespace
    .notEmpty()
    .withMessage("First name cannot be empty"), // Error message for empty first name

  body("lastName")
    .trim() // Remove any leading or trailing whitespace
    .notEmpty()
    .withMessage("Last name cannot be empty"), // Error message for empty last name

  body("email")
    .trim() // Remove any leading or trailing whitespace
    .notEmpty()
    .withMessage("Email cannot be empty") // Error message for empty email
    .bail() // Stop running validations if the previous one fails
    .isEmail()
    .withMessage("Invalid email format") // Error message for invalid email format
    .bail()
    .custom(async (email) => {
      // Check if email already exists in the database
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("Email already in use"); // Error message if email already exists
      }
    }),

  body("password")
    .notEmpty()
    .withMessage("Password cannot be empty") // Error message for empty password
    .bail() // Stop running validations if the previous one fails
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long"), // Error message for short password
];

/**
 * Validates forgot password request:
 * - Ensures email is provided and formatted correctly.
 */
module.exports.validateForgotPasswordRequest = [
  body("email")
    .trim() // Remove any leading or trailing whitespace
    .notEmpty()
    .withMessage("Email cannot be empty") // Error message for empty email
    .bail() // Stop running validations if the previous one fails
    .isEmail()
    .withMessage("Invalid email format"), // Error message for invalid email format
];

/**
 * Validates reset password request:
 * - Ensures reset token is provided.
 * - Ensures password is provided, meets minimum length requirement, and matches confirmation password.
 */
module.exports.validateResetPasswordData = [
  param("resetToken").notEmpty().withMessage("Reset token is required"), // Error message for missing reset token

  body("password")
    .notEmpty()
    .withMessage("Password cannot be empty") // Error message for empty password
    .bail() // Stop running validations if the previous one fails
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long"), // Error message for short password

  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required") // Error message for missing password confirmation
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match"); // Error message for mismatched passwords
      }
      return true;
    }),
];
