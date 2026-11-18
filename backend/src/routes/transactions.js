import express from "express";
import pool from "../db.js";

const router = express.Router();

function formatTransaction(row) {
  return {
    id: row.id,
    bookId: row.book_id,
    bookTitle: row.book_title,
    type: row.type,
    quantity: row.quantity,
    date: row.created_at,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, book_id, book_title, type, quantity, created_at
       FROM transactions
       ORDER BY created_at DESC, id DESC`
    );

    res.json({ data: rows.map(formatTransaction) });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const bookId = Number(req.body.bookId);
  const type = String(req.body.type || "");
  const quantity = Number(req.body.quantity);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return res.status(400).json({ message: "Please select a book." });
  }

  if (!["add", "deduct"].includes(type)) {
    return res.status(400).json({ message: "Please select a valid transaction type." });
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be a positive whole number." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [bookRows] = await connection.execute(
      "SELECT id, title, quantity FROM books WHERE id = ? FOR UPDATE",
      [bookId]
    );

    if (bookRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Book not found." });
    }

    const book = bookRows[0];

    if (type === "deduct" && quantity > book.quantity) {
      await connection.rollback();
      return res.status(400).json({ message: "There are not enough copies available." });
    }

    const newQuantity =
      type === "add" ? book.quantity + quantity : book.quantity - quantity;

    await connection.execute("UPDATE books SET quantity = ? WHERE id = ?", [
      newQuantity,
      bookId,
    ]);

    const [result] = await connection.execute(
      `INSERT INTO transactions (book_id, book_title, type, quantity)
       VALUES (?, ?, ?, ?)`,
      [bookId, book.title, type, quantity]
    );

    const [transactionRows] = await connection.execute(
      `SELECT id, book_id, book_title, type, quantity, created_at
       FROM transactions WHERE id = ?`,
      [result.insertId]
    );

    await connection.commit();

    res.status(201).json({
      data: formatTransaction(transactionRows[0]),
      book: { id: bookId, quantity: newQuantity },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

export default router;

