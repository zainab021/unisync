const pool = require("../db");

async function logActivity({ user_id, user_name, role, action, type }) {
  try {
    await pool.query(
      "INSERT INTO audit_logs (user_id, user_name, role, action, type) VALUES ($1,$2,$3,$4,$5)",
      [user_id || null, user_name || "System", role || "system", action, type || "General"]
    );
  } catch (err) {
    console.error("[Activity log failed]", err.message);
  }
}

module.exports = logActivity;
