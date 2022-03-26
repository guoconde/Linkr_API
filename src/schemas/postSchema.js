import joi from "joi";

const postSchema = joi.object({
  url: joi.string().uri().required(),
  description: joi.string().allow("").required(),
  originalDescription: joi.string().allow("")
});

export default postSchema;