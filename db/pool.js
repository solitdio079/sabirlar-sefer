import {Pool} from "pg"
import {config} from "dotenv"
config()

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PWD,
    port: process.env.DB_PORT,
    ssl: {
    rejectUnauthorized: false
  }
})

export default pool