// Import the 'param' method from 'express-validator' for validating route parameters
const { param } = require("express-validator");

module.exports.validateFetchUserProfile = [
  // Validate that the 'id' parameter in the route is not empty
  param("id").notEmpty().withMessage("User ID is required"), // Error message if the 'id' parameter is missing
];
