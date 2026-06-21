const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken } = require("../middleware/auth");

// GET /api/notifications — my notifications
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET read=true WHERE id=$1 AND user_id=$2", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all/all", verifyToken, async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET read=true WHERE user_id=$1", [req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

// ── Helper to create notification ──────────────────────────────────
async function createNotification({ user_id, title, message, type = "info", link = "" }) {
  try {
    await pool.query(
      "INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1,$2,$3,$4,$5)",
      [user_id, title, message, type, link]
    );
  } catch (err) {
    console.error("[Notification failed]", err.message);
  }
}

module.exports.createNotification = createNotification;
