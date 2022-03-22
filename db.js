import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const connection = new Pool({
<<<<<<< HEAD
  connectionString: process.env.DATABASE_URL,
});
=======
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})
>>>>>>> main

export default connection;
