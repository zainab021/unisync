const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
require("dotenv").config();

const app = express();

// ── Security Headers ────────────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:8080"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "10kb" }));

// ── Rate Limiters ───────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many login attempts. Try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { message: "Too many requests." },
});

app.use("/api/auth/login",    loginLimiter);
app.use("/api/backups/verify-pin", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many PIN attempts. Try again after 15 minutes." },
}));
app.use("/api/", apiLimiter);

// ── Routes ─────────────────────────────────────────────────
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/students",      require("./routes/students"));
app.use("/api/teachers",      require("./routes/teachers"));
app.use("/api/courses",       require("./routes/courses"));
app.use("/api/attendance",    require("./routes/attendance"));
app.use("/api/notices",       require("./routes/notices"));
app.use("/api/fees",          require("./routes/fees"));
app.use("/api/timetable",     require("./routes/timetable"));
app.use("/api/room-requests", require("./routes/room-requests"));
app.use("/api/uni-timetable", require("./routes/uni-timetable"));
app.use("/api/backups",       require("./routes/backups"));
app.use("/api/departments",   require("./routes/departments"));
app.use("/api/exams",         require("./routes/exams"));
app.use("/api/grades",        require("./routes/grades"));
app.use("/api/leave-requests",require("./routes/leave-requests"));
app.use("/api/enrollment",    require("./routes/enrollment"));
app.use("/api/dashboard",     require("./routes/dashboard"));
app.use("/api/messages",     require("./routes/messages"));
app.use("/api/events",       require("./routes/events"));
app.use("/api/feedback",     require("./routes/feedback"));
app.use("/api/library",      require("./routes/library"));
app.use("/api/doc-requests", require("./routes/document-requests"));

// ── Health check ────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "UniSync University Portal API", version: "1.0.0" });
});

// ── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 UniSync server running on http://localhost:${PORT}`);
});
