const express = require("express");
const pool = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/notices
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.*, u.name as posted_by_name
      FROM notices n
      LEFT JOIN users u ON n.posted_by = u.id
      ORDER BY n.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/notices — Admin/Teacher
router.post("/", verifyToken, requireRole("admin", "teacher"), async (req, res) => {
  const { title, body, category, priority } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO notices (title, body, category, priority, posted_by) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [title, body, category, priority || "Medium", req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/notices/:id — Admin
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { title, body, category, priority } = req.body;
  try {
    const result = await pool.query(
      "UPDATE notices SET title=$1, body=$2, category=$3, priority=$4 WHERE id=$5 RETURNING *",
      [title, body, category, priority, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/notices/:id — Admin
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const backup = require("../utils/backup");
    await backup("notices", req.params.id, req.user.id);
    await pool.query("DELETE FROM notices WHERE id=$1", [req.params.id]);
    res.json({ message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
