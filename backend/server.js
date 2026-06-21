const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:8080"], credentials: true }));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use("/api/auth",       require("./routes/auth"));
app.use("/api/students",   require("./routes/students"));
app.use("/api/teachers",   require("./routes/teachers"));
app.use("/api/courses",    require("./routes/courses"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/notices",    require("./routes/notices"));
app.use("/api/fees",       require("./routes/fees"));
app.use("/api/timetable",     require("./routes/timetable"));
app.use("/api/room-requests",  require("./routes/room-requests"));
app.use("/api/uni-timetable", require("./routes/uni-timetable"));
app.use("/api/backups",      require("./routes/backups"));
app.use("/api/departments",   require("./routes/departments"));
app.use("/api/exams",         require("./routes/exams"));
app.use("/api/grades",        require("./routes/grades"));
app.use("/api/leave-requests",require("./routes/leave-requests"));
app.use("/api/enrollment",    require("./routes/enrollment"));
app.use("/api/dashboard",    require("./routes/dashboard"));

// ── Health check ────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Northfield University Portal API ✅", version: "1.0.0" });
});

// ── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// ── Start server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
