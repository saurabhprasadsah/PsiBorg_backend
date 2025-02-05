const Joi = require("joi");

const userSchema = Joi.object({
  username: Joi.string().min(2).max(20).required().messages({
    "string.min": "Username must be at least 2 characters long.",
    "string.max": "Username must not exceed 20 characters.",
    "any.required": "Username is required.",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "A valid email is required.",
    "any.required": "Email is required.",
  }),

  password: Joi.string()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one letter, one number, one special character, and be at least 8 characters long.",
      "any.required": "Password is required.",
    }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match the password.",
    "any.required": "Confirm password is required.",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "A valid email is required.",
    "any.required": "Email is required.",
  }),
  password: Joi.string()
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one letter, one number, one special character, and be at least 8 characters long.",
      "any.required": "Password is required.",
    }),
}).required();

module.exports = { userSchema, loginSchema };
