import { Router } from "express";
import { deleteGeolocation, insertGeolocation } from "../controllers/geolocationController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import validateTokenMiddleware from "../middlewares/validateTokenMiddleware.js";

const geolocationRouter = Router();

geolocationRouter.post('/geolocation', validateTokenMiddleware, validateSchemaMiddleware, insertGeolocation);
geolocationRouter.delete('/geolocation/:postId', validateTokenMiddleware, deleteGeolocation);

export default geolocationRouter;