const express = require("express");
const pool = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/attendance/my — Student's own attendance
router.get("/my", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    if (!student.rows[0]) return res.status(404).json({ message: "Student not found" });

    const result = await pool.query(`
      SELECT a.*, c.name as course_name
      FROM attendance a
      JOIN courses c ON a.course_code = c.code
      WHERE a.student_id = $1
      ORDER BY a.date DESC
    `, [student.rows[0].id]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/attendance/:course — Teacher gets attendance for a course
router.get("/:course", verifyToken, requireRole("teacher", "admin"), async (req, res) => {
  const { date } = req.query;
  try {
    let query = `
      SELECT a.*, s.name as student_name, s.id as student_reg
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.course_code = $1
    `;
    const params = [req.params.course];

    if (date) {
      query += " AND a.date = $2";
      params.push(date);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/attendance — Teacher marks attendance
router.post("/", verifyToken, requireRole("teacher"), async (req, res) => {
  const { records, course_code, date } = req.body;
  // records = [{ student_id, status }]

  try {
    const teacher = await pool.query("SELECT id FROM teachers WHERE user_id=$1", [req.user.id]);
    const teacher_id = teacher.rows[0]?.id;

    const insertPromises = records.map(({ student_id, status }) =>
      pool.query(`
        INSERT INTO attendance (student_id, course_code, date, status, marked_by)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (student_id, course_code, date)
        DO UPDATE SET status = EXCLUDED.status
      `, [student_id, course_code, date, status, teacher_id])
    );

    await Promise.all(insertPromises);
    res.json({ message: `Attendance saved for ${records.length} students` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
