import express, { json } from "express";
import cors from "cors";
import router from "./routes/index.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors());
app.use(json());
app.use(router);

<<<<<<< HEAD
app.listen(process.env.PORT || 4000, () => {
  console.log("Server listening on PORT 4000");
});
=======
app.listen(process.env.PORT, () => { console.log(`Server running on PORT ${process.env.PORT}`)})
>>>>>>> main
