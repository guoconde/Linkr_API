import joi from "joi";

const commentSchema = joi.object({
  userId: joi.number().required(),
  postId: joi.number().required(),
  comment: joi.string().required()
});

export default commentSchema;