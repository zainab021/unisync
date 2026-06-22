const express = require("express");
const pool = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");
const logActivity = require("../utils/activity");

const router = express.Router();

// GET /api/students — Admin only
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.email FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/students/me — Student's own profile
router.get("/me", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM students WHERE user_id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Student not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/students — Admin only
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  const { name, email, program, semester, cgpa, password } = req.body;
  const bcrypt = require("bcryptjs");

  try {
    const hash = await bcrypt.hash(password || "demo1234", 10);
    const avatar = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

    const userRes = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, avatar) VALUES ($1,$2,$3,'student',$4) RETURNING id",
      [name, email, hash, avatar]
    );

    const userId = userRes.rows[0].id;
    const studentId = `BSCS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const result = await pool.query(
      "INSERT INTO students (id, user_id, name, program, semester, cgpa, status) VALUES ($1,$2,$3,$4,$5,$6,'Active') RETURNING *",
      [studentId, userId, name, program, semester, cgpa || 0]
    );

    logActivity({ user_id: req.user.id, user_name: req.user.name, role: req.user.role, action: `Added new student: ${name}`, type: "Student" });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/students/:id — Admin only
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { name, program, semester, cgpa, status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE students SET name=$1, program=$2, semester=$3, cgpa=$4, status=$5 WHERE id=$6 RETURNING *",
      [name, program, semester, cgpa, status, req.params.id]
    );
    logActivity({ user_id: req.user.id, user_name: req.user.name, role: req.user.role, action: `Updated student: ${name}`, type: "Student" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/students/:id — Admin only
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const backup = require("../utils/backup");
    await backup("students", req.params.id, req.user.id);
    await pool.query("DELETE FROM students WHERE id=$1", [req.params.id]);
    logActivity({ user_id: req.user.id, user_name: req.user.name, role: req.user.role, action: `Deleted student: ${req.params.id}`, type: "Student" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
