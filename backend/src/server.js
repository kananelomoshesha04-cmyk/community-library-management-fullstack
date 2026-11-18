import "dotenv/config";
import cors from "cors";
import express from "express";
import pool from "./db.js";
import bookRoutes from "./routes/books.js";
import transactionRoutes from "./routes/transactions.js";
import userRoutes from "./routes/users.js";

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res, next) => {
  try {
    await pool.query("SELECT 1");
    res.json({ success: true, message: "Library API and database are connected." });
  } catch (error) {
    next(error);
  }
});

app.use("/api/books", bookRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "The server could not complete the request." });
});

app.listen(port, () => {
  console.log(`Community Library API running on http://localhost:${port}`);
});

