const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

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

router.post("/", verifyToken, requireRole("teacher"), async (req, res) => {
  const { type, from_date, to_date, days, reason } = req.body;
  try {
    const teacher = await pool.query("SELECT id FROM teachers WHERE user_id=$1", [req.user.id]);
    if (!teacher.rows[0]) return res.status(404).json({ message: "Teacher not found" });
    const id = `LR-${Date.now()}`;
    const result = await pool.query(
      "INSERT INTO leave_requests (id, teacher_id, type, from_date, to_date, days, reason) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [id, teacher.rows[0].id, type, from_date, to_date, days, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch("/:id/status", verifyToken, requireRole("admin"), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query("UPDATE leave_requests SET status=$1 WHERE id=$2 RETURNING *", [status, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
