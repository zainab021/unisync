const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken } = require("../middleware/auth");

// GET /api/dashboard/analytics — charts data
router.get("/analytics", verifyToken, async (req, res) => {
  try {
    // Fee stats for pie chart
    const feeStats = await pool.query(`
      SELECT status, COUNT(*) as count, SUM(amount) as total
      FROM fees GROUP BY status
    `);

    // Enrollment by program
    const programs = await pool.query(`
      SELECT program, COUNT(*) as students
      FROM students GROUP BY program ORDER BY students DESC
    `);

    // Attendance summary
    const attendance = await pool.query(`
      SELECT status, COUNT(*) as count FROM attendance GROUP BY status
    `);

    // Monthly enrollments (last 6 months)
    const monthly = await pool.query(`
      SELECT TO_CHAR(created_at,'Mon') as month,
             EXTRACT(MONTH FROM created_at) as m,
             COUNT(*) as enrollments
      FROM enrollments
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month, m ORDER BY m
    `);

    res.json({
      feeStats:    feeStats.rows,
      programs:    programs.rows,
      attendance:  attendance.rows,
      monthly:     monthly.rows,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/admin
router.get("/admin", verifyToken, async (req, res) => {
  try {
    const [students, teachers, courses, notices, fees, exams, rooms] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM students"),
      pool.query("SELECT COUNT(*) FROM teachers"),
      pool.query("SELECT COUNT(*) FROM courses"),
      pool.query("SELECT COUNT(*) FROM notices"),
      pool.query("SELECT COUNT(*) FROM fees WHERE status='Pending'"),
      pool.query("SELECT COUNT(*) FROM exams WHERE date >= CURRENT_DATE"),
      pool.query("SELECT COUNT(*) FROM room_requests WHERE status='Pending'"),
    ]);
    res.json({
      totalStudents:   parseInt(students.rows[0].count),
      totalTeachers:   parseInt(teachers.rows[0].count),
      totalCourses:    parseInt(courses.rows[0].count),
      totalNotices:    parseInt(notices.rows[0].count),
      pendingFees:     parseInt(fees.rows[0].count),
      upcomingExams:   parseInt(exams.rows[0].count),
      pendingRooms:    parseInt(rooms.rows[0].count),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/student
router.get("/student", verifyToken, async (req, res) => {
  try {
    const studentQ = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    if (!studentQ.rows[0]) return res.json({});
    const sid = studentQ.rows[0].id;

    const [attendance, fees, exams, courses] = await Promise.all([
      pool.query("SELECT COUNT(*) as total, SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) as present FROM attendance WHERE student_id=$1", [sid]),
      pool.query("SELECT COUNT(*) FROM fees WHERE student_id=$1 AND status='Pending'", [sid]),
      pool.query(`SELECT e.* FROM exams e WHERE e.date >= CURRENT_DATE AND e.course_code IN (SELECT course_code FROM enrollments WHERE student_id=$1 AND status='Enrolled') ORDER BY e.date LIMIT 1`, [sid]),
      pool.query("SELECT COUNT(*) FROM enrollments WHERE student_id=$1 AND status='Enrolled'", [sid]),
    ]);

    const total   = parseInt(attendance.rows[0].total) || 0;
    const present = parseInt(attendance.rows[0].present) || 0;

    res.json({
      attendancePercent: total > 0 ? Math.round((present / total) * 100) : 0,
      pendingFees:       parseInt(fees.rows[0].count),
      nextExam:          exams.rows[0] || null,
      enrolledCourses:   parseInt(courses.rows[0].count),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/teacher
router.get("/teacher", verifyToken, async (req, res) => {
  try {
    const teacherQ = await pool.query("SELECT id FROM teachers WHERE user_id=$1", [req.user.id]);
    if (!teacherQ.rows[0]) return res.json({});
    const tid = teacherQ.rows[0].id;

    const [courses, attendance, leaves, rooms] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM courses WHERE teacher_id=$1", [tid]),
      pool.query("SELECT COUNT(*) FROM attendance WHERE marked_by=$1 AND date=CURRENT_DATE", [tid]),
      pool.query("SELECT COUNT(*) FROM leave_requests WHERE teacher_id=$1 AND status='Pending'", [tid]),
      pool.query("SELECT COUNT(*) FROM room_requests WHERE teacher_id=$1 AND status='Pending'", [tid]),
    ]);

    res.json({
      totalCourses:    parseInt(courses.rows[0].count),
      markedToday:     parseInt(attendance.rows[0].count),
      pendingLeaves:   parseInt(leaves.rows[0].count),
      pendingRooms:    parseInt(rooms.rows[0].count),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
