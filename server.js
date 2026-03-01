
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* ---------------- CORS CONFIG ---------------- */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "cs-academy-production.up.railway.app"
  ],
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));

/* ---------------- MYSQL CONNECTION ---------------- */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

/* ---------------- DB TEST ROUTE ---------------- */
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 as test");
    res.json({ connected: true, result: rows });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ connected: false, error: err.message });
  }
});

/* ---------------- HEALTH CHECK ---------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "UP", neural_link: "ACTIVE" });
});

/* ---------------- USERS ---------------- */
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, lockedRoleId FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- LOGIN ---------------- */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length > 0) {
      const { password, ...user } = rows[0];
      res.json(user);
    } else {
      res.status(401).json({ error: "AUTHENTICATION_FAILED" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- SERVER START ---------------- */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Neural Core Server running on port ${PORT}`);
});
