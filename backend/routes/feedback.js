const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET /api/feedback — admin sees all
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, c.name AS course_name, t.name AS teacher_name,
             CASE WHEN f.anonymous THEN 'Anonymous' ELSE s.name END AS student_name
      FROM feedback f
      LEFT JOIN courses c  ON f.course_code = c.code
      LEFT JOIN teachers t ON f.teacher_id  = t.id
      LEFT JOIN students s ON f.student_id  = s.id
      ORDER BY f.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/feedback/my — student sees their own
router.get("/my", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    if (!student.rows[0]) return res.json([]);
    const result = await pool.query(`
      SELECT DISTINCT ON (f.course_code, f.teacher_id)
             f.*, c.name AS course_name, t.name AS teacher_name
      FROM feedback f
      LEFT JOIN courses c  ON f.course_code = c.code
      LEFT JOIN teachers t ON f.teacher_id  = t.id
      WHERE f.student_id = $1
      ORDER BY f.course_code, f.teacher_id, f.created_at DESC
    `, [student.rows[0].id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/feedback — student submits
router.post("/", verifyToken, requireRole("student"), async (req, res) => {
  const { teacher_id, course_code, rating, comment, anonymous } = req.body;
  if (!teacher_id || !course_code || !rating)
    return res.status(400).json({ message: "Teacher, course and rating are required." });
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    if (!student.rows[0]) return res.status(404).json({ message: "Student not found." });
    const result = await pool.query(
      "INSERT INTO feedback (student_id, teacher_id, course_code, rating, comment, anonymous) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [student.rows[0].id, teacher_id, course_code, rating, comment || "", anonymous ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
