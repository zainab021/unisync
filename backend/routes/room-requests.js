const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");
const email = require("../utils/email");

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
      const t = await pool.query("SELECT u.email, t.name FROM teachers t JOIN users u ON t.user_id=u.id WHERE t.id=$1", [rr.teacher_id]);
      if (t.rows[0]) {
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
