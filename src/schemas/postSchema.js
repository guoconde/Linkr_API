import joi from "joi";

const postSchema = joi.object({
  url: joi.string().uri().required(),
  description: joi.string().allow("").required(),
});

export default postSchema;