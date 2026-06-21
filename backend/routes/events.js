const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET all events
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.name AS created_by_name
      FROM calendar_events e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.date ASC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create event (admin only)
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  const { title, date, end_date, category, color } = req.body;
  if (!title || !date) return res.status(400).json({ message: "Title and date required." });
  try {
    const result = await pool.query(
      "INSERT INTO calendar_events (title, date, end_date, category, color, created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [title, date, end_date || null, category || "General", color || "amber", req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update event
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { title, date, end_date, category, color } = req.body;
  try {
    const result = await pool.query(
      "UPDATE calendar_events SET title=$1,date=$2,end_date=$3,category=$4,color=$5 WHERE id=$6 RETURNING *",
      [title, date, end_date || null, category, color, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE event
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await pool.query("DELETE FROM calendar_events WHERE id=$1", [req.params.id]);
    res.json({ message: "Event deleted." });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
