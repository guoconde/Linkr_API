import joi from "joi";

const userSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
  username: joi.string().required(),
  picture: joi.string().uri()
});

export default userSchema;