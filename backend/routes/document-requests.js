const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

const DOC_TYPES = ["Transcript", "Degree Certificate", "Character Certificate", "Enrollment Certificate", "Fee Clearance", "Migration Certificate"];

// GET /api/doc-requests — admin sees all
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, s.name AS student_name
      FROM document_requests d
      LEFT JOIN students s ON d.student_id = s.id
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/doc-requests/my — student sees own
router.get("/my", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    if (!student.rows[0]) return res.json([]);
    const result = await pool.query(
      "SELECT * FROM document_requests WHERE student_id=$1 ORDER BY created_at DESC",
      [student.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/doc-requests — student submits
router.post("/", verifyToken, requireRole("student"), async (req, res) => {
  const { type, note } = req.body;
  if (!type) return res.status(400).json({ message: "Document type required." });
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    if (!student.rows[0]) return res.status(404).json({ message: "Student not found." });
    const id = `DR-${Date.now()}`;
    const result = await pool.query(
      "INSERT INTO document_requests (id, student_id, type, note) VALUES ($1,$2,$3,$4) RETURNING *",
      [id, student.rows[0].id, type, note || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/doc-requests/:id/status — admin updates
router.patch("/:id/status", verifyToken, requireRole("admin"), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE document_requests SET status=$1 WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
