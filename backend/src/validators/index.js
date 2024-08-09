// Import validation rule sets for authentication and user-related tasks
const authValidationRules = require("./authValidationRules");
const userValidationRules = require("./userValidationRules");

module.exports = {
  // Spread operator to include all user validation rules
  ...userValidationRules,

  // Spread operator to include all authentication validation rules
  ...authValidationRules, // Corrected to include authValidationRules instead of duplicating userValidationRules
};
