const express = require("express");
const pool = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/fees/my — Student's own fees
router.get("/my", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    const result = await pool.query(
      "SELECT * FROM fees WHERE student_id=$1 ORDER BY created_at DESC",
      [student.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/fees — Admin
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, s.name as student_name
      FROM fees f JOIN students s ON f.student_id = s.id
      ORDER BY f.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/fees/:id/pay — Admin marks fee as paid
router.patch("/:id/pay", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE fees SET status='Paid', paid_on=CURRENT_DATE WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
