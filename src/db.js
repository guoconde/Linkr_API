import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

console.log(process.env.DATABASE_URL)
const connection = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

export default connection;
