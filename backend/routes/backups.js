const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

// POST /api/backups/verify-pin — verify backup PIN
router.post("/verify-pin", verifyToken, requireRole("admin"), (req, res) => {
  const { pin } = req.body;
  if (String(pin) === String(process.env.BACKUP_PIN)) {
    res.json({ success: true });
  } else {
    res.status(403).json({ success: false, message: "Galat PIN hai" });
  }
});

// GET /api/backups — Admin only — see all deleted records
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, u.name AS deleted_by_name
      FROM deleted_backups b
      LEFT JOIN users u ON b.deleted_by = u.id
      ORDER BY b.deleted_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/backups/:id/restore — restore deleted record
router.post("/:id/restore", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const backup = await pool.query("SELECT * FROM deleted_backups WHERE id=$1", [req.params.id]);
    if (backup.rows.length === 0) return res.status(404).json({ message: "Backup not found" });

    const { table_name, record_data } = backup.rows[0];
    const data = typeof record_data === "string" ? JSON.parse(record_data) : record_data;

    // Remove created_at from data to avoid conflicts
    delete data.created_at;

    const columns = Object.keys(data).join(", ");
    const values  = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

    await pool.query(
      `INSERT INTO ${table_name} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
      values
    );

    // Remove from backup after restore
    await pool.query("DELETE FROM deleted_backups WHERE id=$1", [req.params.id]);

    res.json({ message: `Record restored to ${table_name}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/backups/:id — permanently remove backup entry
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await pool.query("DELETE FROM deleted_backups WHERE id=$1", [req.params.id]);
    res.json({ message: "Backup entry removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
