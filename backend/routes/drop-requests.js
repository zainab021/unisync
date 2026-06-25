const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");
const email   = require("../utils/email");
const { createNotification } = require("./notifications");
const { sendWhatsApp }      = require("../utils/whatsapp");

// POST /api/drop-requests — student requests drop
router.post("/", verifyToken, requireRole("student"), async (req, res) => {
  const { course_code, reason } = req.body;
  if (!course_code) return res.status(400).json({ message: "Course required." });
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    if (!student.rows[0]) return res.status(404).json({ message: "Student not found." });
    const sid = student.rows[0].id;

    // Check enrolled
    const enrolled = await pool.query(
      "SELECT * FROM enrollments WHERE student_id=$1 AND course_code=$2 AND status='Enrolled'",
      [sid, course_code]
    );
    if (!enrolled.rows[0]) return res.status(400).json({ message: "Not enrolled in this course." });

    // Check no pending request exists
    const existing = await pool.query(
      "SELECT id FROM drop_requests WHERE student_id=$1 AND course_code=$2 AND status='Pending'",
      [sid, course_code]
    );
    if (existing.rows[0]) return res.status(409).json({ message: "Drop request already pending for this course." });

    const courseQ = await pool.query("SELECT name FROM courses WHERE code=$1", [course_code]);
    const stuQ    = await pool.query("SELECT name FROM students WHERE id=$1", [sid]);

    const result = await pool.query(
      "INSERT INTO drop_requests (student_id, course_code, reason) VALUES ($1,$2,$3) RETURNING *",
      [sid, course_code, reason || ""]
    );

    // Notify admin in-app
    const adminUser = await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
    if (adminUser.rows[0]) {
      createNotification({
        user_id: adminUser.rows[0].id,
        title:   "New Drop Request",
        message: `${stuQ.rows[0]?.name || "A student"} wants to drop ${courseQ.rows[0]?.name || course_code}`,
        type:    "warning",
        link:    "/admin/enrollment",
      });
    }

    // WhatsApp admin
    sendWhatsApp(`UniSync Alert: ${stuQ.rows[0]?.name} wants to drop ${courseQ.rows[0]?.name}. Login to approve/reject.`);

    // Email admin
    const adminQ = await pool.query("SELECT email FROM users WHERE role='admin' LIMIT 1");
    if (adminQ.rows[0]) {
      email.dropRequestSubmitted({
        studentName: stuQ.rows[0]?.name,
        courseName:  courseQ.rows[0]?.name,
        adminEmail:  adminQ.rows[0].email,
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/drop-requests/my — student sees own requests
router.get("/my", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    if (!student.rows[0]) return res.json([]);
    const result = await pool.query(`
      SELECT dr.*, c.name AS course_name
      FROM drop_requests dr
      JOIN courses c ON dr.course_code = c.code
      WHERE dr.student_id = $1
      ORDER BY dr.requested_at DESC
    `, [student.rows[0].id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/drop-requests — admin sees all
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dr.*, c.name AS course_name, s.name AS student_name,
             u.name AS reviewed_by_name
      FROM drop_requests dr
      JOIN courses c  ON dr.course_code = c.code
      JOIN students s ON dr.student_id  = s.id
      LEFT JOIN users u ON dr.reviewed_by = u.id
      ORDER BY dr.status ASC, dr.requested_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/drop-requests/:id/approve — admin approves → enrollment dropped
router.patch("/:id/approve", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const dr = await pool.query("SELECT * FROM drop_requests WHERE id=$1", [req.params.id]);
    if (!dr.rows[0]) return res.status(404).json({ message: "Request not found." });
    if (dr.rows[0].status !== "Pending") return res.status(400).json({ message: "Already reviewed." });

    // Drop the enrollment
    await pool.query(
      "UPDATE enrollments SET status='Dropped' WHERE student_id=$1 AND course_code=$2",
      [dr.rows[0].student_id, dr.rows[0].course_code]
    );

    // Mark request approved
    const result = await pool.query(
      "UPDATE drop_requests SET status='Approved', reviewed_at=NOW(), reviewed_by=$1 WHERE id=$2 RETURNING *",
      [req.user.id, req.params.id]
    );

    // Notify + Email student
    const stuEmail = await pool.query("SELECT u.id, u.email, s.name FROM students s JOIN users u ON s.user_id=u.id WHERE s.id=$1", [dr.rows[0].student_id]);
    const cName    = await pool.query("SELECT name FROM courses WHERE code=$1", [dr.rows[0].course_code]);
    if (stuEmail.rows[0]) {
      createNotification({
        user_id: stuEmail.rows[0].id,
        title:   "Drop Request Approved ✅",
        message: `Your request to drop ${cName.rows[0]?.name} has been approved.`,
        type:    "success",
        link:    "/student/courses",
      });
      email.dropRequestReviewed({
        studentEmail: stuEmail.rows[0].email,
        studentName:  stuEmail.rows[0].name,
        courseName:   cName.rows[0]?.name,
        status: "Approved",
      });
    }

    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/drop-requests/:id/reject — admin rejects → enrollment unchanged
router.patch("/:id/reject", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const dr = await pool.query("SELECT * FROM drop_requests WHERE id=$1", [req.params.id]);
    if (!dr.rows[0]) return res.status(404).json({ message: "Request not found." });
    if (dr.rows[0].status !== "Pending") return res.status(400).json({ message: "Already reviewed." });

    const result = await pool.query(
      "UPDATE drop_requests SET status='Rejected', reviewed_at=NOW(), reviewed_by=$1 WHERE id=$2 RETURNING *",
      [req.user.id, req.params.id]
    );

    // Notify + Email student
    const stuEmail = await pool.query("SELECT u.id, u.email, s.name FROM students s JOIN users u ON s.user_id=u.id WHERE s.id=$1", [dr.rows[0].student_id]);
    const cName    = await pool.query("SELECT name FROM courses WHERE code=$1", [dr.rows[0].course_code]);
    if (stuEmail.rows[0]) {
      createNotification({
        user_id: stuEmail.rows[0].id,
        title:   "Drop Request Rejected ❌",
        message: `Your request to drop ${cName.rows[0]?.name} was rejected. You remain enrolled.`,
        type:    "danger",
        link:    "/student/courses",
      });
      email.dropRequestReviewed({
        studentEmail: stuEmail.rows[0].email,
        studentName:  stuEmail.rows[0].name,
        courseName:   cName.rows[0]?.name,
        status: "Rejected",
      });
    }

    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/drop-requests/:id — student cancels pending request
router.delete("/:id", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    await pool.query(
      "DELETE FROM drop_requests WHERE id=$1 AND student_id=$2 AND status='Pending'",
      [req.params.id, student.rows[0]?.id]
    );
    res.json({ message: "Request cancelled." });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
