const express = require("express");
const pool = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/teachers
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query("SELECT t.*, u.email FROM teachers t JOIN users u ON t.user_id = u.id ORDER BY t.name");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/teachers/me
router.get("/me", verifyToken, requireRole("teacher"), async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM teachers WHERE user_id = $1", [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Teacher not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/teachers/:id
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { name, department, designation } = req.body;
  try {
    const result = await pool.query(
      "UPDATE teachers SET name=$1, department=$2, designation=$3 WHERE id=$4 RETURNING *",
      [name, department, designation, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/teachers/:id
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const backup = require("../utils/backup");
    await backup("teachers", req.params.id, req.user.id);
    await pool.query("DELETE FROM teachers WHERE id=$1", [req.params.id]);
    res.json({ message: "Teacher deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/teachers
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  const { name, email, department, designation, password } = req.body;
  const bcrypt = require("bcryptjs");
  try {
    const hash = await bcrypt.hash(password || "demo1234", 10);
    const avatar = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const userRes = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, avatar) VALUES ($1,$2,$3,'teacher',$4) RETURNING id",
      [name, email, hash, avatar]
    );
    const teacherId = `FAC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const result = await pool.query(
      "INSERT INTO teachers (id, user_id, name, department, designation) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [teacherId, userRes.rows[0].id, name, department, designation]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
