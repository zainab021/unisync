const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");
const backup  = require("../utils/backup");

// GET all departments
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM departments ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add department
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  const { id, name, hod, programs, teachers_count, students_count } = req.body;
  if (!id || !name) return res.status(400).json({ message: "ID and name required" });
  try {
    const result = await pool.query(
      "INSERT INTO departments (id, name, hod, programs, teachers_count, students_count) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [id.toUpperCase(), name, hod, programs || 0, teachers_count || 0, students_count || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ message: "Department ID already exists" });
    res.status(500).json({ message: err.message });
  }
});

// PUT update department
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { name, hod, programs, teachers_count, students_count } = req.body;
  try {
    const result = await pool.query(
      "UPDATE departments SET name=$1, hod=$2, programs=$3, teachers_count=$4, students_count=$5 WHERE id=$6 RETURNING *",
      [name, hod, programs, teachers_count, students_count, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE department — backup first
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await backup("departments", req.params.id, req.user.id);
    await pool.query("DELETE FROM departments WHERE id=$1", [req.params.id]);
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
