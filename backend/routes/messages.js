const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken } = require("../middleware/auth");

// GET /api/messages/inbox — my received messages
router.get("/inbox", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.name AS sender_name, u.role AS sender_role
      FROM messages m JOIN users u ON m.from_id = u.id
      WHERE m.to_id = $1
      ORDER BY m.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/messages/sent — my sent messages
router.get("/sent", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.name AS receiver_name, u.role AS receiver_role
      FROM messages m JOIN users u ON m.to_id = u.id
      WHERE m.from_id = $1
      ORDER BY m.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/messages/users — list of users to message
router.get("/users", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, role, avatar FROM users WHERE id != $1 ORDER BY role, name",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/messages — send a message
router.post("/", verifyToken, async (req, res) => {
  const { to_id, body } = req.body;
  if (!to_id || !body?.trim()) return res.status(400).json({ message: "Recipient and message required." });
  try {
    const result = await pool.query(
      "INSERT INTO messages (from_id, to_id, body) VALUES ($1,$2,$3) RETURNING *",
      [req.user.id, to_id, body.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/messages/:id/read — mark as read
router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    await pool.query("UPDATE messages SET read=true WHERE id=$1 AND to_id=$2", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/messages/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM messages WHERE id=$1 AND (from_id=$2 OR to_id=$2)", [req.params.id, req.user.id]);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
