import joi from "joi";

const geolocationSchema = joi.object({
  userId: joi.number().required(),
  postId: joi.number().required(),
  latitude: joi.string().required(),
  longitude: joi.string().required()
});

export default geolocationSchema;