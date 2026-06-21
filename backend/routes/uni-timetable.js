const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken } = require("../middleware/auth");

// UMT period number → time mapping
const PERIOD_TIMES = {
  "1":   "08:00–09:00",
  "2":   "09:00–10:00",
  "3":   "10:00–11:00",
  "4":   "11:00–12:00",
  "5":   "12:00–13:00",
  "1,2": "08:00–10:00",
  "2,3": "09:00–11:00",
  "3,4": "10:00–12:00",
  "4,5": "11:00–13:00",
  "1,2,3": "08:00–11:00",
};

function resolveTime(val) {
  if (!val) return null;
  const clean = val.trim();
  if (PERIOD_TIMES[clean]) return PERIOD_TIMES[clean];
  // already a clock time like "8:30-10:30"
  if (clean.includes(":") || clean.includes("-")) return clean;
  return clean;
}

function buildSchedule(row) {
  const days = [
    { day: "Monday",    val: row.mon },
    { day: "Tuesday",   val: row.tue },
    { day: "Wednesday", val: row.wed },
    { day: "Thursday",  val: row.thu },
    { day: "Friday",    val: row.fri },
    { day: "Saturday",  val: row.sat },
  ];
  return days
    .filter(d => d.val)
    .map(d => ({ day: d.day, time: resolveTime(d.val), period: d.val }));
}

// GET /api/uni-timetable/programs — list all unique programs
router.get("/programs", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT program FROM iqbal_campus_timetable WHERE program IS NOT NULL ORDER BY program"
    );
    res.json(result.rows.map(r => r.program));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/uni-timetable?program=BSAI Batch -04&section=A
router.get("/", verifyToken, async (req, res) => {
  const { program, section, campus = "iqbal" } = req.query;
  if (!program) return res.status(400).json({ message: "program required" });

  const table = campus === "city" ? "city_campus_timetable" : "iqbal_campus_timetable";

  try {
    let query = `SELECT * FROM ${table} WHERE program ILIKE $1`;
    const params = [`%${program}%`];

    if (section) {
      query += ` AND section ILIKE $2`;
      params.push(`%${section}%`);
    }

    query += " ORDER BY course_code";
    const result = await pool.query(query, params);

    // Build structured response
    const rows = result.rows.map(row => ({
      id:              row.id,
      program:         row.program,
      course_code:     row.course_code,
      course_title:    row.course_title,
      credit_hours:    row.credit_hours,
      section:         row.section,
      batch:           row.batch,
      strength:        row.strength,
      teacher:         row.resource_person || "TBA",
      classroom:       row.classroom || "—",
      schedule:        buildSchedule(row),
      group_header:    row.group_header,
    }));

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/uni-timetable/teacher?name=Ms. Zainab
router.get("/teacher", verifyToken, async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ message: "name required" });
  try {
    const result = await pool.query(
      "SELECT * FROM iqbal_campus_timetable WHERE resource_person ILIKE $1 ORDER BY program, course_code",
      [`%${name}%`]
    );
    const rows = result.rows.map(row => ({
      ...row,
      schedule: buildSchedule(row),
    }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
