import express from "express";
import pool from "../db.js";

const router = express.Router();

function validateBook(body) {
  const title = String(body.title || "").trim();
  const author = String(body.author || "").trim();
  const genre = String(body.genre || "").trim();
  const isbn = String(body.isbn || "").trim();
  const quantity = Number(body.quantity);

  if (!title || !author || !genre || !isbn) {
    return { error: "Please complete all the book fields." };
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    return { error: "Quantity must be zero or a positive whole number." };
  }

  return { title, author, genre, isbn, quantity };
}

function formatBook(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    genre: row.genre,
    isbn: row.isbn,
    quantity: row.quantity,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, author, genre, isbn, quantity FROM books ORDER BY title"
    );

    res.json({ data: rows.map(formatBook) });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const book = validateBook(req.body);

  if (book.error) {
    return res.status(400).json({ message: book.error });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO books (title, author, genre, isbn, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [book.title, book.author, book.genre, book.isbn, book.quantity]
    );

    res.status(201).json({ data: { id: result.insertId, ...book } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "A book with this ISBN already exists." });
    }

    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  const book = validateBook(req.body);

  if (book.error) {
    return res.status(400).json({ message: book.error });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE books
       SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ?
       WHERE id = ?`,
      [book.title, book.author, book.genre, book.isbn, book.quantity, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found." });
    }

    res.json({ data: { id: Number(req.params.id), ...book } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "A book with this ISBN already exists." });
    }

    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM books WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found." });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

