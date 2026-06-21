const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");
const email = require("../utils/email");
const { createNotification } = require("./notifications");

// GET /api/room-requests — Admin: all requests
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT rr.*, t.name AS teacher_name, r.room_name,
             s.slot_name, s.start_time, s.end_time
      FROM room_requests rr
      LEFT JOIN teachers t ON rr.teacher_id = t.id
      LEFT JOIN rooms r    ON rr.room::text  = r.room_name
      LEFT JOIN slots s    ON rr.slot        = s.slot_name
      ORDER BY rr.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/room-requests/my — Teacher: own requests
router.get("/my", verifyToken, requireRole("teacher"), async (req, res) => {
  try {
    const teacher = await pool.query("SELECT id FROM teachers WHERE user_id=$1", [req.user.id]);
    if (!teacher.rows[0]) return res.status(404).json({ message: "Teacher not found" });
    const result = await pool.query(
      "SELECT * FROM room_requests WHERE teacher_id=$1 ORDER BY created_at DESC",
      [teacher.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/room-requests — Teacher: submit request
router.post("/", verifyToken, requireRole("teacher"), async (req, res) => {
  const { room, date, slot, reason } = req.body;
  if (!room || !date || !slot || !reason)
    return res.status(400).json({ message: "All fields required" });
  try {
    const teacher = await pool.query("SELECT id FROM teachers WHERE user_id=$1", [req.user.id]);
    if (!teacher.rows[0]) return res.status(404).json({ message: "Teacher not found" });
    const id = `RR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const result = await pool.query(
      "INSERT INTO room_requests (id, teacher_id, room, date, slot, reason) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [id, teacher.rows[0].id, room, date, slot, reason]
    );

    // Email admin about new room request
    const teacherInfo = await pool.query(
      "SELECT t.name, u.email FROM teachers t JOIN users u ON t.user_id=u.id WHERE t.id=$1",
      [teacher.rows[0].id]
    );
    const adminInfo = await pool.query("SELECT email FROM users WHERE role='admin' LIMIT 1");
    if (adminInfo.rows[0] && teacherInfo.rows[0]) {
      // In-app notification for admin
      const adminUser = await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
      if (adminUser.rows[0]) {
        createNotification({
          user_id: adminUser.rows[0].id,
          title:   "New Room Request",
          message: `${teacherInfo.rows[0].name} requested ${room} on ${date}`,
          type:    "info",
          link:    "/admin/room-approvals",
        });
      }
      email.sendEmail({
        to: adminInfo.rows[0].email,
        subject: `Room Request — ${room} by ${teacherInfo.rows[0].name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px">
            <h2 style="color:#F59E0B">UniSync — New Room Request</h2>
            <p><b>${teacherInfo.rows[0].name}</b> has requested a room.</p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;color:#666">Room:</td><td style="padding:8px"><b>${room}</b></td></tr>
              <tr><td style="padding:8px;color:#666">Date:</td><td style="padding:8px"><b>${date}</b></td></tr>
              <tr><td style="padding:8px;color:#666">Slot:</td><td style="padding:8px"><b>${slot}</b></td></tr>
              <tr><td style="padding:8px;color:#666">Reason:</td><td style="padding:8px">${reason}</td></tr>
            </table>
            <a href="http://localhost:5173/admin/room-approvals" style="background:#F59E0B;color:#000;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px">Review Request</a>
          </div>
        `,
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/room-requests/:id/status — Admin: approve or reject
router.patch("/:id/status", verifyToken, requireRole("admin"), async (req, res) => {
  const { status } = req.body;
  if (!["Approved", "Rejected"].includes(status))
    return res.status(400).json({ message: "Status must be Approved or Rejected" });
  try {
    const result = await pool.query(
      "UPDATE room_requests SET status=$1 WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    // Email teacher
    const rr = result.rows[0];
    if (rr) {
      const t = await pool.query("SELECT u.id, u.email, t.name FROM teachers t JOIN users u ON t.user_id=u.id WHERE t.id=$1", [rr.teacher_id]);
      if (t.rows[0]) {
        createNotification({
          user_id: t.rows[0].id,
          title:   `Room Request ${status}`,
          message: `Your request for ${rr.room} on ${rr.date} has been ${status.toLowerCase()}.`,
          type:    status === "Approved" ? "success" : "danger",
          link:    "/teacher/room-request",
        });
        email.roomRequestReviewed({ teacherEmail: t.rows[0].email, teacherName: t.rows[0].name, room: rr.room, date: rr.date, slot: rr.slot, status });
      }
    }
    if (result.rowCount === 0) return res.status(404).json({ message: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
