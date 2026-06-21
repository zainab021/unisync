const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken } = require("../middleware/auth");

// GET /api/search?q=query — global search
router.get("/", verifyToken, async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);
  const term = `%${q.trim()}%`;
  const role = req.user.role;
  const results = [];

  try {
    if (role === "admin" || role === "teacher") {
      // Students
      const students = await pool.query(
        "SELECT id, name, program, semester, 'student' AS type FROM students WHERE name ILIKE $1 OR id ILIKE $1 LIMIT 5",
        [term]
      );
      students.rows.forEach(r => results.push({ ...r, label: r.name, sub: `${r.id} · ${r.program}`, link: "/admin/students" }));

      // Teachers
      const teachers = await pool.query(
        "SELECT id, name, department, 'teacher' AS type FROM teachers WHERE name ILIKE $1 OR id ILIKE $1 LIMIT 5",
        [term]
      );
      teachers.rows.forEach(r => results.push({ ...r, label: r.name, sub: r.department, link: "/admin/teachers" }));
    }

    // Courses
    const courses = await pool.query(
      "SELECT code AS id, name, department, 'course' AS type FROM courses WHERE name ILIKE $1 OR code ILIKE $1 LIMIT 5",
      [term]
    );
    courses.rows.forEach(r => results.push({ ...r, label: r.name, sub: r.id, link: role === "admin" ? "/admin/courses" : "/student/courses" }));

    // Notices
    const notices = await pool.query(
      "SELECT id, title AS name, category, 'notice' AS type FROM notices WHERE title ILIKE $1 LIMIT 5",
      [term]
    );
    notices.rows.forEach(r => results.push({ ...r, label: r.name, sub: r.category, link: `/${role}/notices` }));

    // Exams
    const exams = await pool.query(
      "SELECT id, subject AS name, venue, 'exam' AS type FROM exams WHERE subject ILIKE $1 LIMIT 5",
      [term]
    );
    exams.rows.forEach(r => results.push({ ...r, label: r.name, sub: r.venue, link: `/${role}/exams` }));

    res.json(results.slice(0, 10));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
