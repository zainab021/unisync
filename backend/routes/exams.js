const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");
const backup  = require("../utils/backup");

// GET /api/exams/my — student: only enrolled courses, no duplicates
router.get("/my", verifyToken, async (req, res) => {
  try {
    const studentRow = await pool.query(
      "SELECT id FROM students WHERE user_id = $1", [req.user.id]
    );
    if (!studentRow.rows[0]) return res.status(403).json({ message: "Not a student" });
    const sid = studentRow.rows[0].id;

    const result = await pool.query(`
      SELECT DISTINCT ON (e.subject, e.course_code, e.date, e.type)
             e.*, c.name as course_name, t.name as invigilator_name
      FROM exams e
      LEFT JOIN courses c ON e.course_code = c.code
      LEFT JOIN teachers t ON e.invigilator = t.id
      WHERE e.course_code IN (
        SELECT course_code FROM enrollments
        WHERE student_id = $1 AND status = 'Enrolled'
      )
      ORDER BY e.subject, e.course_code, e.date, e.type, e.id
    `, [sid]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/exams — admin/teacher: all exams, deduplicated
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (e.subject, e.course_code, e.date, e.type)
             e.*, c.name as course_name, t.name as invigilator_name
      FROM exams e
      LEFT JOIN courses c ON e.course_code = c.code
      LEFT JOIN teachers t ON e.invigilator = t.id
      ORDER BY e.subject, e.course_code, e.date, e.type, e.id
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  const { subject, course_code, date, time, venue, duration, invigilator, type } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO exams (subject, course_code, date, time, venue, duration, invigilator, type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [subject, course_code, date, time, venue, duration, invigilator, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { subject, course_code, date, time, venue, duration, invigilator, type } = req.body;
  try {
    const result = await pool.query(
      "UPDATE exams SET subject=$1,course_code=$2,date=$3,time=$4,venue=$5,duration=$6,invigilator=$7,type=$8 WHERE id=$9 RETURNING *",
      [subject, course_code, date, time, venue, duration, invigilator, type, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await backup("exams", req.params.id, req.user.id);
    await pool.query("DELETE FROM exams WHERE id=$1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
