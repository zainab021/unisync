const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    const { course } = req.query;
    let query = `SELECT e.*, s.name as student_name, c.name as course_name
                 FROM enrollments e
                 JOIN students s ON e.student_id = s.id
                 JOIN courses c  ON e.course_code = c.code`;
    const params = [];
    if (course) { query += ` WHERE e.course_code = $1`; params.push(course); }
    query += ` ORDER BY e.created_at DESC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/enrollment/bulk — enroll all students of a program into selected courses
router.post("/bulk", verifyToken, requireRole("admin"), async (req, res) => {
  const { program, semester, course_codes } = req.body;
  if (!program || !semester || !course_codes?.length)
    return res.status(400).json({ message: "program, semester and course_codes required" });
  try {
    const students = await pool.query(
      "SELECT id FROM students WHERE program=$1 AND status='Active'", [program]
    );
    if (!students.rows.length)
      return res.status(404).json({ message: "No active students found in this program" });

    let enrolled = 0, skipped = 0;
    for (const s of students.rows) {
      for (const code of course_codes) {
        try {
          await pool.query(
            "INSERT INTO enrollments (student_id, course_code, semester) VALUES ($1,$2,$3)",
            [s.id, code, semester]
          );
          enrolled++;
        } catch (e: any) {
          if (e.code === "23505") skipped++; // already enrolled
          else throw e;
        }
      }
    }
    res.json({ message: `Bulk enrollment done! ${enrolled} new, ${skipped} already enrolled.` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  const { student_id, course_code, semester } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO enrollments (student_id, course_code, semester) VALUES ($1,$2,$3) RETURNING *",
      [student_id, course_code, semester]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ message: "Already enrolled" });
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/status", verifyToken, requireRole("admin"), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query("UPDATE enrollments SET status=$1 WHERE id=$2 RETURNING *", [status, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await pool.query("DELETE FROM enrollments WHERE id=$1", [req.params.id]);
    res.json({ message: "Enrollment removed" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
