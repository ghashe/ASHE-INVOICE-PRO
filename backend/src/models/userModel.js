// Import necessary modules
const mongoose = require("mongoose"); // Mongoose for MongoDB object modeling
const bcrypt = require("bcryptjs"); // Bcrypt for hashing passwords securely
const jwt = require("jsonwebtoken"); // JWT for creating and verifying JSON Web Tokens
const crypto = require("crypto"); // Crypto for generating secure tokens and hashes

// Custom error handling
const CustomError = require("../config/errors/customError"); // CustomError for structured error messages

// Pull in environment variables for token secrets and expiry times
const ACCESS_TOKEN_CONFIG = {
  secret: process.env.AUTH_ACCESS_TOKEN_SECRET, // Secret key for signing access tokens
  expiry: process.env.AUTH_ACCESS_TOKEN_DURATION_MINUTES, // Access token validity duration in minutes
};

const REFRESH_TOKEN_CONFIG = {
  secret: process.env.AUTH_REFRESH_TOKEN_SECRET, // Secret key for signing refresh tokens
  expiry: process.env.AUTH_REFRESH_TOKEN_DURATION_HOURS, // Refresh token validity duration in hours
};

const RESET_PASSWORD_TOKEN_CONFIG = {
  expiryMinutes: process.env.RESET_PASSWORD_TOKEN_DURATION_MINUTES, // Reset password token validity duration in minutes
};

/* 
1. DEFINE USER SCHEMA 
   - This schema defines the structure of the User document in MongoDB.
   - Includes fields for user's first name, last name, email, password, tokens, reset token, and reset token expiry time.
*/
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true, // Enforce unique email addresses
    match: [
      /^\S+@\S+\.\S+$/,
      "Please use a valid email address", // Basic email format validation
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"], // Minimum password length requirement
  },
  tokens: [
    {
      token: { type: String, required: true }, // Stores hashed refresh tokens
    },
  ],
  resetPasswordTokenHash: String, // Stores the hashed reset password token
  resetPasswordTokenExpiry: Date, // Stores the expiry time of the reset password token
});

/* 
2. SCHEMA OPTIONS 
   - Set options for the schema, including JSON transformation.
   - This ensures that only necessary fields are included when converting a document to JSON.
*/
UserSchema.set("toJSON", {
  virtuals: true, // Include virtual fields in the JSON output
  transform: function (doc, ret) {
    // Remove sensitive fields like password and tokens from the JSON output
    const { firstName, lastName, email } = ret;
    return { firstName, lastName, email };
  },
});

/* 
3. MIDDLEWARE 
   - Middleware to hash the password before saving the user document.
   - This ensures that passwords are never stored in plain text.
*/
UserSchema.pre("save", async function (next) {
  try {
    // Only hash the password if it has been modified (or is new)
    if (this.isModified("password")) {
      const saltRounds = 12; // Increase salt rounds for enhanced security
      const salt = await bcrypt.genSalt(saltRounds); // Generate a salt
      this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
    }
    next();
  } catch (error) {
    next(error); // Pass any errors to the next middleware
  }
});

/* 
4. STATIC METHODS 
   - Static methods are defined on the model itself, and not on individual documents.
   - Useful for operations like finding a user by credentials.
*/
UserSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email }); // Find a user by email
  if (!user) {
    throw new CustomError(
      "Invalid credentials",
      400,
      "The email or password provided is incorrect"
    );
  }

  // Compare provided password with the stored hashed password
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new CustomError(
      "Invalid credentials",
      400,
      "The email or password provided is incorrect"
    );
  }

  return user; // Return the user if credentials are valid
};

/* 
5. INSTANCE METHODS 
   - Instance methods are defined on individual documents (instances of the model).
   - Useful for operations that need to be performed on a specific user document.
*/
UserSchema.methods.generateAccessToken = function () {
  const user = this;

  // Create signed JWT access token with user data
  const accessToken = jwt.sign(
    {
      _id: user._id.toString(), // Include user ID
      fullName: `${user.firstName} ${user.lastName}`, // Include full name
      email: user.email, // Include email address
    },
    ACCESS_TOKEN_CONFIG.secret, // Use the access token secret
    {
      expiresIn: `${ACCESS_TOKEN_CONFIG.expiry}m`, // Set the token expiration time in minutes
    }
  );

  return accessToken; // Return the generated access token
};

UserSchema.methods.generateRefreshToken = async function () {
  const user = this;

  // Create signed JWT refresh token with minimal data
  const refreshToken = jwt.sign(
    {
      _id: user._id.toString(), // Include user ID only
    },
    REFRESH_TOKEN_CONFIG.secret, // Use the refresh token secret
    {
      expiresIn: `${REFRESH_TOKEN_CONFIG.expiry}h`, // Set the token expiration time in hours
    }
  );

  // Create a hash of the refresh token for secure storage
  const refreshTokenHash = crypto
    .createHmac("sha256", REFRESH_TOKEN_CONFIG.secret)
    .update(refreshToken)
    .digest("hex");

  // Store the hashed refresh token in the user's token array
  user.tokens.push({ token: refreshTokenHash });
  await user.save(); // Save the user document with the new token

  return refreshToken; // Return the plain refresh token
};

UserSchema.methods.generateResetPasswordToken = async function () {
  const user = this;

  // Generate a secure reset token using crypto
  const resetTokenValue = crypto.randomBytes(32).toString("hex");
  const resetTokenSecret = crypto.randomBytes(16).toString("hex");

  // Combine the token and secret to create the reset token
  const resetToken = `${resetTokenValue}.${resetTokenSecret}`;

  // Hash the reset token for secure storage
  const resetTokenHash = crypto
    .createHmac("sha256", resetTokenSecret)
    .update(resetTokenValue)
    .digest("hex");

  // Store the hashed reset token and set the expiry time
  user.resetPasswordTokenHash = resetTokenHash;
  user.resetPasswordTokenExpiry =
    Date.now() + RESET_PASSWORD_TOKEN_CONFIG.expiryMinutes * 60 * 1000; // Expiry in minutes

  await user.save(); // Save the user document with the reset token

  return resetToken; // Return the plain reset token
};

/* 
6. COMPILE MODEL FROM SCHEMA 
   - This creates a Mongoose model called "User" based on the UserSchema.
   - Models are used to create and read documents from the underlying MongoDB collection.
*/
const UserModel = mongoose.model("User", UserSchema);

// Export the UserModel so it can be used in other parts of the application
module.exports = UserModel;
