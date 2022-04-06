import { stripHtml } from "string-strip-html";
import loginSchema from "../schemas/loginSchema.js";
import postSchema from "../schemas/postSchema.js";
import userSchema from "../schemas/userSchema.js";
import commentSchema from "../schemas/commentSchema.js";
import geolocationSchema from "../schemas/geolocationSchema.js";

function sanitizeString(string) {
  return (stripHtml(string).result).trim();
}

const schemas = {
  "/login": loginSchema,
  "/posts": postSchema,
  "/comments": commentSchema,
  "/sign-up": userSchema,
  "/geolocation": geolocationSchema
}

export default async function validateSchemaMiddleware(req, res, next) {
  const { body } = req;
  const schema = schemas["/" + req.path.split("/")[1]];

  Object.keys(body).forEach(key => {
    if (typeof (body[key]) === "string") body[key] = sanitizeString(body[key])
  });

  const validation = schema.validate(body, { abortEarly: false });
  if (validation.error) return res.status(422).send(validation.error.message);

  next();
}