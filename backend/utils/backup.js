const pool = require("../db");

async function backupBeforeDelete(tableName, recordId, userId) {
  try {
    // Fetch record from its table
    const idColumn = tableName === "notices" || tableName === "audit_logs" ? "id" : "id";
    const result = await pool.query(
      `SELECT * FROM ${tableName} WHERE id = $1`,
      [recordId]
    );
    if (result.rows.length === 0) return;

    await pool.query(
      `INSERT INTO deleted_backups (table_name, record_id, record_data, deleted_by)
       VALUES ($1, $2, $3, $4)`,
      [tableName, String(recordId), JSON.stringify(result.rows[0]), userId || null]
    );
  } catch (err) {
    console.error("Backup failed:", err.message);
  }
}

module.exports = backupBeforeDelete;
