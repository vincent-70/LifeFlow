require('dotenv').config();
const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── MySQL Connection ────────────────────────────────────────────────────────
const db = mysql.createConnection({
  host:     process.env.MYSQLHOST     || 'localhost',
  user:     process.env.MYSQLUSER     || 'root',
  password: process.env.MYSQLPASSWORD || 'yourpassword',
  database: process.env.MYSQLDATABASE || 'blood',
  port:     process.env.MYSQLPORT     || 3306
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database: blood');

  const createTable = `
    CREATE TABLE IF NOT EXISTS donor_blood (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(100)                  NOT NULL,
      age           INT                           NOT NULL,
      gender        ENUM('Male','Female','Other') NOT NULL,
      blood_group   VARCHAR(5)                    NOT NULL,
      mobile        VARCHAR(15)                   NOT NULL UNIQUE,
      email         VARCHAR(100),
      state         VARCHAR(100)                  NOT NULL,
      city          VARCHAR(100)                  NOT NULL,
      address       TEXT,
      last_donation DATE,
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createTable, err => {
    if (err) console.error('Table creation error:', err.message);
    else     console.log('✅ Table donor_blood ready');
  });
});

// ── REGISTER ────────────────────────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  const { name, age, gender, blood_group, mobile, email, state, city, address, last_donation } = req.body;

  if (!name || !age || !gender || !blood_group || !mobile || !state || !city)
    return res.status(400).json({ error: 'Please fill all required fields.' });

  // Check duplicate name
  db.query('SELECT id FROM donor_blood WHERE name = ?', [name.trim()], (err, rows) => {
    if (err)          return res.status(500).json({ error: 'Database error.' });
    if (rows.length)  return res.status(409).json({ error: 'A donor with this name is already registered.' });

    // Check duplicate mobile
    db.query('SELECT id FROM donor_blood WHERE mobile = ?', [mobile.trim()], (err, rows) => {
      if (err)         return res.status(500).json({ error: 'Database error.' });
      if (rows.length) return res.status(409).json({ error: 'This mobile number is already registered.' });

      const sql = `INSERT INTO donor_blood
        (name,age,gender,blood_group,mobile,email,state,city,address,last_donation)
        VALUES (?,?,?,?,?,?,?,?,?,?)`;
      const vals = [name.trim(),age,gender,blood_group,mobile.trim(),email||null,state,city,address||null,last_donation||null];

      db.query(sql, vals, (err, result) => {
        if (err) return res.status(500).json({ error: 'Registration failed.' });
        res.json({ success: true, id: result.insertId });
      });
    });
  });
});

// ── GET ALL ─────────────────────────────────────────────────────────────────
app.get('/api/donors', (req, res) => {
  db.query('SELECT * FROM donor_blood ORDER BY registered_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Fetch failed.' });
    res.json(rows);
  });
});

// ── SEARCH ──────────────────────────────────────────────────────────────────
app.get('/api/search', (req, res) => {
  const { blood_group, state, city } = req.query;
  let sql = 'SELECT * FROM donor_blood WHERE 1=1';
  const params = [];
  if (blood_group) { sql += ' AND blood_group = ?'; params.push(blood_group); }
  if (state)       { sql += ' AND state LIKE ?';    params.push(`%${state}%`); }
  if (city)        { sql += ' AND city LIKE ?';     params.push(`%${city}%`); }
  sql += ' ORDER BY registered_at DESC';

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Search failed.' });
    res.json(rows);
  });
});

// ── UPDATE ──────────────────────────────────────────────────────────────────
app.put('/api/donors/:id', (req, res) => {
  const { name, age, gender, blood_group, mobile, email, state, city, address, last_donation } = req.body;
  const id = req.params.id;

  db.query('SELECT id FROM donor_blood WHERE name = ? AND id != ?', [name.trim(), id], (err, rows) => {
    if (err)         return res.status(500).json({ error: 'Database error.' });
    if (rows.length) return res.status(409).json({ error: 'Another donor with this name already exists.' });

    db.query('SELECT id FROM donor_blood WHERE mobile = ? AND id != ?', [mobile.trim(), id], (err, rows) => {
      if (err)         return res.status(500).json({ error: 'Database error.' });
      if (rows.length) return res.status(409).json({ error: 'This mobile number is used by another donor.' });

      const sql = `UPDATE donor_blood SET
        name=?,age=?,gender=?,blood_group=?,mobile=?,email=?,state=?,city=?,address=?,last_donation=?
        WHERE id=?`;
      db.query(sql, [name.trim(),age,gender,blood_group,mobile.trim(),email||null,state,city,address||null,last_donation||null,id], err => {
        if (err) return res.status(500).json({ error: 'Update failed.' });
        res.json({ success: true });
      });
    });
  });
});

// ── DELETE ──────────────────────────────────────────────────────────────────
app.delete('/api/donors/:id', (req, res) => {
  db.query('DELETE FROM donor_blood WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: 'Delete failed.' });
    res.json({ success: true });
  });
});

// ── START ───────────────────────────────────────────────────────────────────
// ✅ FIX: Use Railway's dynamic PORT, fallback to 3000 for local dev
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
