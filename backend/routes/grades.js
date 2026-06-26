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

// POST /api/grades/bulk — save multiple grades at once + notify admin
router.post("/bulk", verifyToken, requireRole("teacher", "admin"), async (req, res) => {
  const { records, course_code, semester } = req.body;
  try {
    for (const r of records) {
      await pool.query(`
        INSERT INTO grades (student_id, course_code, semester, quiz, mid, assignment, final, submitted)
        VALUES ($1,$2,$3,$4,$5,$6,$7,true)
        ON CONFLICT (student_id, course_code, semester)
        DO UPDATE SET quiz=$4, mid=$5, assignment=$6, final=$7, submitted=true, approved=false
      `, [r.student_id, course_code, semester, r.quiz||0, r.mid||0, r.assignment||0, r.final||0]);
    }

    // Notify admin
    const { createNotification } = require("./notifications");
    const courseQ = await pool.query("SELECT name FROM courses WHERE code=$1", [course_code]);
    const adminQ  = await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
    if (adminQ.rows[0]) {
      createNotification({
        user_id: adminQ.rows[0].id,
        title:   "Results Pending Approval 📋",
        message: `${courseQ.rows[0]?.name || course_code} (${semester}) results submitted by teacher. Please review and approve.`,
        type:    "warning",
        link:    "/admin/results"
      });
    }

    res.json({ message: `Grades submitted for ${records.length} students. Admin notified.` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/grades/pending — admin sees all submitted-but-not-approved
router.get("/pending", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.course_code, g.semester, c.name as course_name,
             t.name as teacher_name, COUNT(*) as student_count,
             MIN(g.submitted) as submitted
      FROM grades g
      JOIN courses c ON g.course_code = c.code
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE g.submitted = true AND (g.approved IS NULL OR g.approved = false)
      GROUP BY g.course_code, g.semester, c.name, t.name
      ORDER BY g.semester DESC, c.name
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/grades/approve — admin approves, auto-updates CGPA + semester
router.post("/approve", verifyToken, requireRole("admin"), async (req, res) => {
  const { course_code, semester } = req.body;
  if (!course_code || !semester) return res.status(400).json({ message: "course_code and semester required" });

  try {
    // Mark grades as approved
    await pool.query(
      "UPDATE grades SET approved=true WHERE course_code=$1 AND semester=$2 AND submitted=true",
      [course_code, semester]
    );

    // Get all students in this course/semester with their grades and credits
    const students = await pool.query(`
      SELECT g.student_id, g.quiz, g.mid, g.assignment, g.final, c.credits
      FROM grades g JOIN courses c ON g.course_code = c.code
      WHERE g.course_code=$1 AND g.semester=$2
    `, [course_code, semester]);

    // Calculate and update CGPA for each student
    for (const s of students.rows) {
      const total = (s.quiz || 0) + (s.mid || 0) + (s.assignment || 0) + (s.final || 0);

      // Get all approved grades for this student to recalculate CGPA
      const allGrades = await pool.query(`
        SELECT g.quiz, g.mid, g.assignment, g.final, c.credits
        FROM grades g JOIN courses c ON g.course_code = c.code
        WHERE g.student_id=$1 AND (g.approved=true OR (g.course_code=$2 AND g.semester=$3))
      `, [s.student_id, course_code, semester]);

      let totalPoints = 0, totalCredits = 0;
      for (const g of allGrades.rows) {
        const t = (g.quiz||0)+(g.mid||0)+(g.assignment||0)+(g.final||0);
        const gp = t>=90?4.0:t>=85?4.0:t>=80?3.7:t>=77?3.3:t>=73?3.0:t>=70?2.7:t>=67?2.3:t>=63?2.0:t>=60?1.7:t>=50?1.0:0;
        totalPoints += gp * (g.credits || 3);
        totalCredits += (g.credits || 3);
      }
      const cgpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;

      // Update CGPA
      await pool.query(
        "UPDATE students SET cgpa=$1 WHERE id=$2",
        [cgpa, s.student_id]
      );

      // Increment semester
      await pool.query(
        "UPDATE students SET semester=semester+1 WHERE id=$1",
        [s.student_id]
      );

      // Notify student
      const stuUser = await pool.query(
        "SELECT u.id FROM students s JOIN users u ON s.user_id=u.id WHERE s.id=$1",
        [s.student_id]
      );
      if (stuUser.rows[0]) {
        const { createNotification } = require("./notifications");
        createNotification({
          user_id: stuUser.rows[0].id,
          title: "Results Approved ✅",
          message: `Your results for ${course_code} (${semester}) have been approved. CGPA updated to ${cgpa}.`,
          type: "success",
          link: "/student/results"
        });
      }
    }

    res.json({ message: `Results approved. ${students.rows.length} students updated.` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
