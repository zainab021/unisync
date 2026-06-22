const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

// GET /api/audit-logs — Admin only
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  const { type, limit = 100 } = req.query;
  try {
    let query = "SELECT * FROM audit_logs";
    const params = [];
    if (type && type !== "All") {
      query += " WHERE type=$1";
      params.push(type);
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(Number(limit));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/audit-logs/types — get unique types
router.get("/types", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT type FROM audit_logs ORDER BY type");
    res.json(result.rows.map(r => r.type));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
