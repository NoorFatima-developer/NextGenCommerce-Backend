import joi from "joi";

// userSchema...
const userSchema = joi.object({
  name: joi.string().min(3).max(30).trim().required(),
  email: joi.string().email().required(),
  password: joi.string().min(8).max(50).required(),
  
});

// loginSchema...
const loginSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.email": "Please enter a valid email.",
    "any.required": "Email is required.",
  }),
  password: joi.string().min(8).max(50).required().messages({
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
});


// resetSchema...
const resetSchema = joi.object({
  password: joi.string().min(8).max(50).required().messages({
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
});


export {userSchema, loginSchema, resetSchema}

