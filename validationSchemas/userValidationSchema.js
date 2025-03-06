import joi from "joi";

const userSchema = joi.object({
  name: joi.string().min(3).max(30).trim().required(),
  email: joi.string().email().required(),
  password: joi.string().min(8).max(50).required(),
});

export default userSchema;
