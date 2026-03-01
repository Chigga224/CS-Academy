
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper for snake_case to camelCase conversion
const mapCourse = (c) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  teacherId: c.teacher_id,
  teacherName: c.teacher_name,
  category: c.category,
  duration: c.duration,
  rating: c.rating,
  thumbnail: c.thumbnail,
  videoUrl: c.video_url,
  skills: JSON.parse(c.skills || '[]'),
  createdAt: c.created_at
});

// --- API ENDPOINTS ---

// Integrity Check
app.get('/api/health', (req, res) => res.json({ status: 'UP', neural_link: 'ACTIVE' }));

// Users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, lockedRoleId FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) {
      const { password, ...user } = rows[0];
      res.json(user);
    } else {
      res.status(401).json({ error: 'AUTHENTICATION_FAILED' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email, password, role } = req.body;
  const id = `u${Date.now()}`;
  try {
    await pool.query('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [id, name, email, password, role]);
    res.json({ id, name, email, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Courses
app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json(rows.map(mapCourse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/courses', async (req, res) => {
  const { title, description, teacherId, teacherName, category, duration, thumbnail, videoUrl, skills } = req.body;
  const id = `c${Date.now()}`;
  try {
    await pool.query(
      'INSERT INTO courses (id, title, description, teacher_id, teacher_name, category, duration, thumbnail, video_url, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, teacherId, teacherName, category, duration, thumbnail, videoUrl, JSON.stringify(skills || [])]
    );
    res.json({ id, title, status: 'DEPLOYED' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Progress Tracking
app.get('/api/progress/:studentId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM student_progress WHERE student_id = ?', [req.params.studentId]);
    res.json(rows.map(r => ({
      courseId: r.course_id,
      lastTimestamp: r.last_timestamp,
      isCompleted: !!r.is_completed
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/progress', async (req, res) => {
  const { studentId, courseId, lastTimestamp, isCompleted } = req.body;
  try {
    await pool.query(
      'INSERT INTO student_progress (student_id, course_id, last_timestamp, is_completed) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE last_timestamp = VALUES(last_timestamp), is_completed = VALUES(is_completed)',
      [studentId, courseId, lastTimestamp, isCompleted]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Certificates
app.post('/api/certificates', async (req, res) => {
  const { id, student_id, student_name, course_id, course_title, score, grade } = req.body;
  try {
    await pool.query(
      'INSERT INTO certificates (id, student_id, student_name, course_id, course_title, score, grade) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, student_id, student_name, course_id, course_title, score, grade]
    );
    res.json({ success: true, node_id: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Neural Core Server running on port ${PORT}`));
