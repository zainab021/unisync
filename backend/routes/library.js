const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, requireRole } = require("../middleware/auth");

// Ensure table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS library_books (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    author          VARCHAR(150) NOT NULL,
    category        VARCHAR(50)  NOT NULL DEFAULT 'General',
    isbn            VARCHAR(20),
    total_copies    INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    location        VARCHAR(50),
    added_at        TIMESTAMP DEFAULT NOW()
  )
`).catch(err => console.error("Library table error:", err.message));

// GET all books (with search)
router.get("/", verifyToken, async (req, res) => {
  const { search, category } = req.query;
  try {
    let query  = "SELECT * FROM library_books WHERE 1=1";
    const params: any[] = [];
    if (search) { params.push(`%${search}%`); query += ` AND (title ILIKE $${params.length} OR author ILIKE $${params.length})`; }
    if (category && category !== "All") { params.push(category); query += ` AND category = $${params.length}`; }
    query += " ORDER BY title";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET categories
router.get("/categories", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT category FROM library_books ORDER BY category");
    res.json(result.rows.map((r: any) => r.category));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST add book (admin only)
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  const { title, author, category, isbn, total_copies, location } = req.body;
  if (!title || !author) return res.status(400).json({ message: "Title and author required." });
  try {
    const copies = Number(total_copies) || 1;
    const result = await pool.query(
      "INSERT INTO library_books (title, author, category, isbn, total_copies, available_copies, location) VALUES ($1,$2,$3,$4,$5,$5,$6) RETURNING *",
      [title, author, category || "General", isbn || null, copies, location || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update book
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { title, author, category, isbn, total_copies, available_copies, location } = req.body;
  try {
    const result = await pool.query(
      "UPDATE library_books SET title=$1,author=$2,category=$3,isbn=$4,total_copies=$5,available_copies=$6,location=$7 WHERE id=$8 RETURNING *",
      [title, author, category, isbn, total_copies, available_copies, location, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE book
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    await pool.query("DELETE FROM library_books WHERE id=$1", [req.params.id]);
    res.json({ message: "Book removed." });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
