const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken: auth } = require("../middleware/auth");

// GET all slots
router.get("/slots", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM slots ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all rooms
router.get("/rooms", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT r.*, rt.type_name FROM rooms r JOIN roomtypes rt ON r.room_type_id = rt.id ORDER BY r.room_name"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET full timetable (admin)
router.get("/", auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.day, t.course_code, c.name AS course_name,
             t.teacher_id, te.name AS teacher_name,
             t.room_id, r.room_name,
             t.slot_id, s.slot_name, s.start_time, s.end_time
      FROM timetables t
      JOIN courses c   ON t.course_code = c.code
      JOIN teachers te ON t.teacher_id  = te.id
      JOIN rooms r     ON t.room_id     = r.id
      JOIN slots s     ON t.slot_id     = s.id
      ORDER BY t.day, s.start_time
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET timetable for a specific teacher
router.get("/teacher/:teacherId", auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id, t.day, t.course_code, c.name AS course_name,
             r.room_name, s.slot_name, s.start_time, s.end_time
      FROM timetables t
      JOIN courses c ON t.course_code = c.code
      JOIN rooms r   ON t.room_id     = r.id
      JOIN slots s   ON t.slot_id     = s.id
      WHERE t.teacher_id = $1
      ORDER BY t.day, s.start_time
    `, [req.params.teacherId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET timetable for a student (all entries if no enrollment, else filtered)
router.get("/student/:studentId", auth, async (req, res) => {
  try {
    // Try enrolled courses first
    const enrolled = await pool.query(
      "SELECT course_code FROM enrollments WHERE student_id=$1 AND status='Enrolled'",
      [req.params.studentId]
    );

    let result;
    if (enrolled.rows.length > 0) {
      const codes = enrolled.rows.map(r => r.course_code);
      result = await pool.query(`
        SELECT t.id, t.day, t.course_code, c.name AS course_name,
               c.credits, te.name AS teacher_name, r.room_name,
               s.slot_name, s.start_time, s.end_time
        FROM timetables t
        JOIN courses c   ON t.course_code = c.code
        JOIN teachers te ON t.teacher_id  = te.id
        JOIN rooms r     ON t.room_id     = r.id
        JOIN slots s     ON t.slot_id     = s.id
        WHERE t.course_code = ANY($1)
        ORDER BY s.start_time, t.day
      `, [codes]);
    } else {
      // Show all timetable entries if no enrollment
      result = await pool.query(`
        SELECT t.id, t.day, t.course_code, c.name AS course_name,
               c.credits, te.name AS teacher_name, r.room_name,
               s.slot_name, s.start_time, s.end_time
        FROM timetables t
        JOIN courses c   ON t.course_code = c.code
        JOIN teachers te ON t.teacher_id  = te.id
        JOIN rooms r     ON t.room_id     = r.id
        JOIN slots s     ON t.slot_id     = s.id
        ORDER BY s.start_time, t.day
      `);
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET clash check — check if room/teacher is busy
router.get("/clashes", auth, async (req, res) => {
  try {
    const roomClashes = await pool.query(`
      SELECT t1.id, t1.day, t1.slot_id, r.room_name,
             c1.name as course1, c2.name as course2
      FROM timetables t1
      JOIN timetables t2 ON t1.room_id=t2.room_id AND t1.day=t2.day
                        AND t1.slot_id=t2.slot_id AND t1.id < t2.id
      JOIN rooms r   ON t1.room_id = r.id
      JOIN courses c1 ON t1.course_code = c1.code
      JOIN courses c2 ON t2.course_code = c2.code
    `);

    const teacherClashes = await pool.query(`
      SELECT t1.id, t1.day, t1.slot_id, te.name as teacher_name,
             c1.name as course1, c2.name as course2
      FROM timetables t1
      JOIN timetables t2 ON t1.teacher_id=t2.teacher_id AND t1.day=t2.day
                        AND t1.slot_id=t2.slot_id AND t1.id < t2.id
      JOIN teachers te ON t1.teacher_id = te.id
      JOIN courses c1  ON t1.course_code = c1.code
      JOIN courses c2  ON t2.course_code = c2.code
    `);

    res.json({
      roomClashes:    roomClashes.rows,
      teacherClashes: teacherClashes.rows,
      totalClashes:   roomClashes.rows.length + teacherClashes.rows.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST assign a slot (admin only) — with clash detection
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  const { course_code, teacher_id, room_id, day, slot_id } = req.body;
  if (!course_code || !teacher_id || !room_id || !day || !slot_id)
    return res.status(400).json({ message: "All fields required" });
  try {
    // Room clash check
    const roomBusy = await pool.query(
      "SELECT c.name FROM timetables t JOIN courses c ON t.course_code=c.code WHERE t.room_id=$1 AND t.day=$2 AND t.slot_id=$3",
      [room_id, day, slot_id]
    );
    if (roomBusy.rows.length > 0)
      return res.status(409).json({ message: `Room clash: already booked for "${roomBusy.rows[0].name}" on ${day}`, clash: "room" });

    // Teacher clash check
    const teacherBusy = await pool.query(
      "SELECT c.name FROM timetables t JOIN courses c ON t.course_code=c.code WHERE t.teacher_id=$1 AND t.day=$2 AND t.slot_id=$3",
      [teacher_id, day, slot_id]
    );
    if (teacherBusy.rows.length > 0)
      return res.status(409).json({ message: `Teacher clash: already assigned "${teacherBusy.rows[0].name}" on ${day}`, clash: "teacher" });

    const result = await pool.query(
      `INSERT INTO timetables (course_code, teacher_id, room_id, day, slot_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [course_code, teacher_id, room_id, day, slot_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ message: "This course is already assigned on this day/slot" });
    res.status(500).json({ message: err.message });
  }
});

// PUT update a slot (admin only)
router.put("/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  const { course_code, teacher_id, room_id, day, slot_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE timetables SET course_code=$1, teacher_id=$2, room_id=$3, day=$4, slot_id=$5
       WHERE id=$6 RETURNING *`,
      [course_code, teacher_id, room_id, day, slot_id, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a slot (admin only)
router.delete("/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  try {
    const result = await pool.query("DELETE FROM timetables WHERE id=$1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET makeup classes
router.get("/makeups", auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, c.name AS course_name, te.name AS teacher_name,
             r.room_name, s.slot_name, s.start_time, s.end_time
      FROM makeups m
      JOIN courses c   ON m.course_code = c.code
      JOIN teachers te ON m.teacher_id  = te.id
      JOIN rooms r     ON m.room_id     = r.id
      JOIN slots s     ON m.slot_id     = s.id
      ORDER BY m.makeup_date
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST schedule a makeup class
router.post("/makeups", auth, async (req, res) => {
  const { course_code, teacher_id, room_id, makeup_date, slot_id, reason } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO makeups (course_code, teacher_id, room_id, makeup_date, slot_id, reason)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [course_code, teacher_id, room_id, makeup_date, slot_id, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
