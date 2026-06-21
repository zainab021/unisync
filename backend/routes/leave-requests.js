const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");
const email   = require("../utils/email");

router.get("/my", verifyToken, requireRole("teacher"), async (req, res) => {
  try {
    const teacher = await pool.query("SELECT id FROM teachers WHERE user_id=$1", [req.user.id]);
    if (!teacher.rows[0]) return res.json([]);
    const result = await pool.query("SELECT * FROM leave_requests WHERE teacher_id=$1 ORDER BY created_at DESC", [teacher.rows[0].id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT lr.*, t.name as teacher_name
      FROM leave_requests lr JOIN teachers t ON lr.teacher_id = t.id
      ORDER BY lr.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST — teacher submits leave → admin email
router.post("/", verifyToken, requireRole("teacher"), async (req, res) => {
  const { type, from_date, to_date, days, reason } = req.body;
  try {
    const teacher = await pool.query(
      "SELECT t.id, t.name, u.email FROM teachers t JOIN users u ON t.user_id=u.id WHERE t.user_id=$1",
      [req.user.id]
    );
    if (!teacher.rows[0]) return res.status(404).json({ message: "Teacher not found" });
    const id = `LR-${Date.now()}`;
    const result = await pool.query(
      "INSERT INTO leave_requests (id, teacher_id, type, from_date, to_date, days, reason) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [id, teacher.rows[0].id, type, from_date, to_date, days, reason]
    );

    // Email admin
    const admin = await pool.query("SELECT email FROM users WHERE role='admin' LIMIT 1");
    if (admin.rows[0]) {
      email.sendEmail({
        to: admin.rows[0].email,
        subject: `Leave Request — ${teacher.rows[0].name} (${type})`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px">
            <h2 style="color:#F59E0B">UniSync — Leave Request</h2>
            <p><b>${teacher.rows[0].name}</b> has submitted a leave request.</p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;color:#666">Type:</td><td style="padding:8px"><b>${type}</b></td></tr>
              <tr><td style="padding:8px;color:#666">From:</td><td style="padding:8px"><b>${from_date}</b></td></tr>
              <tr><td style="padding:8px;color:#666">To:</td><td style="padding:8px"><b>${to_date}</b></td></tr>
              <tr><td style="padding:8px;color:#666">Days:</td><td style="padding:8px"><b>${days}</b></td></tr>
              <tr><td style="padding:8px;color:#666">Reason:</td><td style="padding:8px">${reason}</td></tr>
            </table>
            <a href="http://localhost:5173/admin/teachers" style="background:#F59E0B;color:#000;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px">Review in Portal</a>
          </div>
        `,
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH — admin approves/rejects → teacher email
router.patch("/:id/status", verifyToken, requireRole("admin"), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE leave_requests SET status=$1 WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    const lr = result.rows[0];

    // Email teacher
    if (lr) {
      const t = await pool.query(
        "SELECT t.name, t.type, u.email FROM teachers t JOIN users u ON t.user_id=u.id WHERE t.id=$1",
        [lr.teacher_id]
      );
      if (t.rows[0]) {
        email.leaveRequestReviewed({
          teacherEmail: t.rows[0].email,
          teacherName:  t.rows[0].name,
          type:         lr.type,
          fromDate:     lr.from_date?.slice(0, 10),
          toDate:       lr.to_date?.slice(0, 10),
          status,
        });
      }
    }

    res.json(lr);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
