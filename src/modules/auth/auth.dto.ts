import Joi from "joi";

export const registerDto = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  birthday: Joi.date().optional(),
});

export const loginDto = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const confirmEmailDto = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
});

export const forgotPasswordDto = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordDto = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).required(),
});

export const changePasswordDto = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});
