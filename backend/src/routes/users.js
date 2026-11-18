import express from "express";
import pool from "../db.js";

const router = express.Router();

function validateUser(body) {
  const name = String(body.name || "").trim();
  const membershipId = String(body.membershipId || "").trim();
  const role = String(body.role || "").trim();

  if (!name || !membershipId || !role) {
    return { error: "Please complete all the user fields." };
  }

  if (!['Admin', 'Librarian'].includes(role)) {
    return { error: "Please select a valid user role." };
  }

  return { name, membershipId, role };
}

function formatUser(row) {
  return {
    id: row.id,
    name: row.name,
    membershipId: row.membership_id,
    role: row.role,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, membership_id, role FROM users ORDER BY name"
    );

    res.json({ data: rows.map(formatUser) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const membershipId = String(req.body.membershipId || "").trim();

  if (!membershipId) {
    return res.status(400).json({ message: "Please enter your membership ID." });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT id, name, membership_id, role
       FROM users
       WHERE LOWER(membership_id) = LOWER(?)`,
      [membershipId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "The membership ID was not found." });
    }

    res.json({ data: formatUser(rows[0]) });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const user = validateUser(req.body);

  if (user.error) {
    return res.status(400).json({ message: user.error });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO users (name, membership_id, role) VALUES (?, ?, ?)",
      [user.name, user.membershipId, user.role]
    );

    res.status(201).json({ data: { id: result.insertId, ...user } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "This membership ID is already in use." });
    }

    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  const user = validateUser(req.body);

  if (user.error) {
    return res.status(400).json({ message: user.error });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE users SET name = ?, membership_id = ?, role = ? WHERE id = ?`,
      [user.name, user.membershipId, user.role, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ data: { id: Number(req.params.id), ...user } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "This membership ID is already in use." });
    }

    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

