const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET /api/grades/my — student's own grades
router.get("/my", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    if (!student.rows[0]) return res.json([]);
    const result = await pool.query(`
      SELECT g.*, c.name as course_name
      FROM grades g JOIN courses c ON g.course_code = c.code
      WHERE g.student_id=$1 ORDER BY g.semester, c.name
    `, [student.rows[0].id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/grades/course/:code — teacher gets grades for a course
router.get("/course/:code", verifyToken, requireRole("teacher", "admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.*, s.name as student_name
      FROM grades g JOIN students s ON g.student_id = s.id
      WHERE g.course_code=$1 ORDER BY s.name
    `, [req.params.code]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/grades — teacher saves grades
router.post("/", verifyToken, requireRole("teacher", "admin"), async (req, res) => {
  const { student_id, course_code, semester, quiz, mid, assignment, final } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO grades (student_id, course_code, semester, quiz, mid, assignment, final)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (student_id, course_code, semester)
      DO UPDATE SET quiz=$4, mid=$5, assignment=$6, final=$7, submitted=true
      RETURNING *
    `, [student_id, course_code, semester, quiz||0, mid||0, assignment||0, final||0]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/grades/bulk — save multiple grades at once
router.post("/bulk", verifyToken, requireRole("teacher", "admin"), async (req, res) => {
  const { records, course_code, semester } = req.body;
  try {
    for (const r of records) {
      await pool.query(`
        INSERT INTO grades (student_id, course_code, semester, quiz, mid, assignment, final, submitted)
        VALUES ($1,$2,$3,$4,$5,$6,$7,true)
        ON CONFLICT (student_id, course_code, semester)
        DO UPDATE SET quiz=$4, mid=$5, assignment=$6, final=$7, submitted=true
      `, [r.student_id, course_code, semester, r.quiz||0, r.mid||0, r.assignment||0, r.final||0]);
    }
    res.json({ message: `Grades saved for ${records.length} students` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
