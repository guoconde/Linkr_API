import express, { json } from "express"
import cors from "cors"
import dotenv from "dotenv"
import router from "./routes/index.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(json())
app.use(router)

app.listen(process.env.PORT, () => { console.log(`Server running on PORT ${process.env.PORT}`)})