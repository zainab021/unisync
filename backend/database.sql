-- ============================================================
-- NORTHFIELD UNIVERSITY PORTAL â€” DATABASE SCHEMA
-- PostgreSQL
-- Run: psql -U postgres -d university_portal -f database.sql
-- ============================================================

-- Create database (run separately if needed)
-- CREATE DATABASE university_portal;

-- USERS TABLE (all roles: student, teacher, admin)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  avatar VARCHAR(5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  hod VARCHAR(100),
  programs INT DEFAULT 0,
  teachers_count INT DEFAULT 0,
  students_count INT DEFAULT 0
);

-- STUDENTS
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(30) PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  program VARCHAR(100) NOT NULL,
  semester INT DEFAULT 1,
  cgpa NUMERIC(3,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Warning', 'Suspended'))
);

-- TEACHERS
CREATE TABLE IF NOT EXISTS teachers (
  id VARCHAR(30) PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  designation VARCHAR(100),
  phone VARCHAR(20),
  office VARCHAR(100),
  joined_year INT
);

-- COURSES
CREATE TABLE IF NOT EXISTS courses (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(20) REFERENCES departments(id),
  teacher_id VARCHAR(30) REFERENCES teachers(id),
  credits INT DEFAULT 3,
  status VARCHAR(20) DEFAULT 'Active'
);

-- ENROLLMENTS
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(30) REFERENCES students(id) ON DELETE CASCADE,
  course_code VARCHAR(20) REFERENCES courses(code) ON DELETE CASCADE,
  semester VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'Enrolled' CHECK (status IN ('Enrolled', 'Dropped', 'Completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_code, semester)
);

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(30) REFERENCES students(id) ON DELETE CASCADE,
  course_code VARCHAR(20) REFERENCES courses(code),
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Leave')),
  marked_by VARCHAR(30) REFERENCES teachers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_code, date)
);

-- GRADES
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(30) REFERENCES students(id) ON DELETE CASCADE,
  course_code VARCHAR(20) REFERENCES courses(code),
  semester VARCHAR(50) NOT NULL,
  quiz NUMERIC(5,2) DEFAULT 0,
  mid NUMERIC(5,2) DEFAULT 0,
  assignment NUMERIC(5,2) DEFAULT 0,
  final NUMERIC(5,2) DEFAULT 0,
  submitted BOOLEAN DEFAULT FALSE,
  UNIQUE(student_id, course_code, semester)
);

-- FEES
CREATE TABLE IF NOT EXISTS fees (
  id VARCHAR(30) PRIMARY KEY,
  student_id VARCHAR(30) REFERENCES students(id) ON DELETE CASCADE,
  semester VARCHAR(50) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Overdue')),
  paid_on DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NOTICES
CREATE TABLE IF NOT EXISTS notices (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'Medium',
  posted_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- EXAMS
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(100) NOT NULL,
  course_code VARCHAR(20) REFERENCES courses(code),
  date DATE NOT NULL,
  time VARCHAR(20) NOT NULL,
  venue VARCHAR(100) NOT NULL,
  duration VARCHAR(20) NOT NULL,
  invigilator VARCHAR(30) REFERENCES teachers(id),
  type VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ROOM REQUESTS
CREATE TABLE IF NOT EXISTS room_requests (
  id VARCHAR(30) PRIMARY KEY,
  teacher_id VARCHAR(30) REFERENCES teachers(id),
  room VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  slot VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS leave_requests (
  id VARCHAR(30) PRIMARY KEY,
  teacher_id VARCHAR(30) REFERENCES teachers(id),
  type VARCHAR(50) NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  days INT NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  from_id INT REFERENCES users(id),
  to_id INT REFERENCES users(id),
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- DOCUMENT REQUESTS
CREATE TABLE IF NOT EXISTS document_requests (
  id VARCHAR(30) PRIMARY KEY,
  student_id VARCHAR(30) REFERENCES students(id),
  type VARCHAR(100) NOT NULL,
  status VARCHAR(30) DEFAULT 'Pending',
  note TEXT DEFAULT '',
  requested_on DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- FEEDBACK
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(30) REFERENCES students(id),
  teacher_id VARCHAR(30) REFERENCES teachers(id),
  course_code VARCHAR(20) REFERENCES courses(code),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CALENDAR EVENTS
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  end_date DATE,
  category VARCHAR(50),
  color VARCHAR(30) DEFAULT 'amber',
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  user_name VARCHAR(100),
  role VARCHAR(20),
  action TEXT NOT NULL,
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ROOM TYPES
CREATE TABLE IF NOT EXISTS roomtypes (
  id SERIAL PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL UNIQUE
);

-- ROOMS
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  room_name VARCHAR(20) NOT NULL UNIQUE,
  room_type_id INT REFERENCES roomtypes(id),
  capacity INT NOT NULL DEFAULT 40
);

-- TIME SLOTS
CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  slot_name VARCHAR(20) NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL
);

-- TIMETABLE
CREATE TABLE IF NOT EXISTS timetables (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) REFERENCES courses(code) ON DELETE CASCADE,
  teacher_id VARCHAR(30) REFERENCES teachers(id) ON DELETE CASCADE,
  room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
  day VARCHAR(15) NOT NULL,
  slot_id INT REFERENCES slots(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_code, day, slot_id)
);

-- MAKEUP CLASSES
CREATE TABLE IF NOT EXISTS makeups (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) REFERENCES courses(code) ON DELETE CASCADE,
  teacher_id VARCHAR(30) REFERENCES teachers(id),
  room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
  makeup_date DATE NOT NULL,
  slot_id INT REFERENCES slots(id),
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

