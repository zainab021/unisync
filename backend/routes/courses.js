const express = require("express");
const pool = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/courses/my — only enrolled courses for the logged-in student
router.get("/my", verifyToken, async (req, res) => {
  try {
    const studentRow = await pool.query(
      "SELECT id FROM students WHERE user_id = $1",
      [req.user.id]
    );
    if (studentRow.rows.length === 0)
      return res.status(403).json({ message: "Not a student" });

    const studentId = studentRow.rows[0].id;
    const result = await pool.query(
      `SELECT c.*, t.name as teacher_name
       FROM courses c
       JOIN enrollments e ON e.course_code = c.code
       LEFT JOIN teachers t ON c.teacher_id = t.id
       WHERE e.student_id = $1 AND e.status = 'Enrolled'
       ORDER BY c.code`,
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/courses — all courses (admin/teacher)
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, t.name as teacher_name
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      ORDER BY c.code
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/courses — Admin
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  const { code, name, department, teacher_id, credits } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO courses (code, name, department, teacher_id, credits) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [code, name, department, teacher_id, credits]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/courses/:code
router.put("/:code", verifyToken, requireRole("admin"), async (req, res) => {
  const { name, department, teacher_id, credits, status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE courses SET name=$1, department=$2, teacher_id=$3, credits=$4, status=$5 WHERE code=$6 RETURNING *",
      [name, department, teacher_id, credits, status, req.params.code]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/courses/:code
router.delete("/:code", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const backup = require("../utils/backup");
    await backup("courses", req.params.code, req.user.id);
    await pool.query("DELETE FROM courses WHERE code=$1", [req.params.code]);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
