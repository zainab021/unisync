-- ============================================================
-- NORTHFIELD UNIVERSITY PORTAL — DATABASE SCHEMA
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

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO departments (id, name, hod, programs, teachers_count, students_count) VALUES
('CS', 'Computer Science', 'Dr. Khalid Mahmood', 4, 24, 1200),
('MATH', 'Mathematics', 'Dr. Faisal Mehmood', 2, 12, 340),
('ENG', 'English', 'Dr. Amna Bashir', 2, 8, 280)
ON CONFLICT DO NOTHING;

-- Room types
INSERT INTO roomtypes (type_name) VALUES ('Classroom'), ('Lab'), ('Hall')
ON CONFLICT DO NOTHING;

-- Rooms
INSERT INTO rooms (room_name, room_type_id, capacity) VALUES
('CS-201', 1, 40), ('CS-305', 1, 35), ('CS-410', 1, 40),
('Lab-1',  2, 30), ('Lab-3',  2, 30),
('H-101',  3, 120), ('M-105', 1, 45)
ON CONFLICT DO NOTHING;

-- Time slots
INSERT INTO slots (slot_name, start_time, end_time) VALUES
('Slot 1', '08:00', '09:30'),
('Slot 2', '09:30', '11:00'),
('Slot 3', '11:00', '12:30'),
('Slot 4', '13:00', '14:30'),
('Slot 5', '14:30', '16:00'),
('Slot 6', '16:00', '17:30')
ON CONFLICT DO NOTHING;

-- Admin user (password: admin1234)
INSERT INTO users (name, email, password_hash, role, avatar) VALUES
('Admin', 'admin@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'AD')
ON CONFLICT DO NOTHING;
-- Note: password hash above is for 'password' — change it!

SELECT * FROM users WHERE email = 'sara.ahmed@university.edu';

WITH new_user AS (
  INSERT INTO users (name, email, password_hash, role, avatar)
  VALUES (
    'Dr. Sara Ahmed',
    'sara.ahmed@university.edu',
    '$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC',
    'teacher',
    'SA'
  )
  RETURNING id
)
INSERT INTO teachers (id, user_id, name, department, designation)
SELECT 'FAC-2026-0001', id, 'Dr. Sara Ahmed', 'Computer Science', 'Assistant Professor'
FROM new_user

SELECT u.id, u.name, u.email, u.role, t.id as teacher_id 
FROM users u 
JOIN teachers t ON t.user_id = u.id
WHERE u.email = 'sara.ahmed@university.edu';

SELECT id, name, email, role FROM users ORDER BY role;

WITH new_user AS (
  INSERT INTO users (name, email, password_hash, role, avatar)
  VALUES (
    'Ayesha Khan',
    'ayesha.khan@university.edu',
    '$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC',
    'student',
    'AK'
  )
  RETURNING id
)
INSERT INTO students (id, user_id, name, program, semester, cgpa, status)
SELECT 'BSCS-2024-0142', id, 'Ayesha Khan', 'BS Computer Science', 5, 3.72, 'Active'
FROM new_user;

-- =====================================================================
-- UMT Sialkot Campus Timetables — Spring 2026
-- Generated SQL script: schema + data for Iqbal Campus & City Campus
-- All "messy" source fields (batch, strength, credit_hours) are stored
-- as TEXT since the original sheets mix numbers with free-text notes
-- (e.g. "9,10", "TBA", "27+10"). Day-slot columns are stored as raw
-- TEXT exactly as they appeared in Excel (period numbers like "1,2"
-- or clock times like "10:30-11:30").
-- =====================================================================

DROP TABLE IF EXISTS iqbal_campus_timetable;
CREATE TABLE iqbal_campus_timetable (
    id               SERIAL PRIMARY KEY,
    group_header     TEXT,   -- original batch/section header line from sheet
    program          TEXT,   -- e.g. 'BSSE Batch - 17'
    merged_programs  TEXT,
    course_code      TEXT,
    course_title     TEXT,
    credit_hours     TEXT,
    section          TEXT,
    batch            TEXT,
    strength         TEXT,
    resource_person  TEXT,
    classroom        TEXT,
    mon              TEXT,
    tue              TEXT,
    wed              TEXT,
    thu              TEXT,
    fri              TEXT,
    sat              TEXT,
    sun              TEXT,
    created_at       TIMESTAMP DEFAULT NOW()
);

DROP TABLE IF EXISTS city_campus_timetable;
CREATE TABLE city_campus_timetable (
    id               SERIAL PRIMARY KEY,
    group_header     TEXT,
    program          TEXT,   -- e.g. 'DPT Batch 009'
    merged_programs  TEXT,
    course_code      TEXT,
    course_title     TEXT,
    credit_hours     TEXT,
    section          TEXT,
    batch            TEXT,
    strength         TEXT,
    resource_person  TEXT,
    classroom        TEXT,
    mon              TEXT,
    tue              TEXT,
    wed              TEXT,
    thu              TEXT,
    fri              TEXT,
    sat              TEXT,
    sun              TEXT,
    created_at       TIMESTAMP DEFAULT NOW()
);

-- Helpful indexes for common lookups
CREATE INDEX idx_iqbal_course_code ON iqbal_campus_timetable (course_code);
CREATE INDEX idx_iqbal_program ON iqbal_campus_timetable (program);
CREATE INDEX idx_iqbal_resource_person ON iqbal_campus_timetable (resource_person);

CREATE INDEX idx_city_course_code ON city_campus_timetable (course_code);
CREATE INDEX idx_city_program ON city_campus_timetable (program);
CREATE INDEX idx_city_resource_person ON city_campus_timetable (resource_person);



-- =====================================================================

-- Iqbal Campus Timetable data (461 rows)

-- =====================================================================

INSERT INTO iqbal_campus_timetable (group_header, program, merged_programs, course_code, course_title, credit_hours, section, batch, strength, resource_person, classroom, mon, tue, wed, thu, fri, sat, sun) VALUES
  ('BSSE Batch - 17 : 8th semester(Batch Advisor Name : Mr. Talha )', 'BSSE Batch - 17', NULL, 'CC4182', 'Final Year Project-II', 3, 'A', 17, 44, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch - 17 : 8th semester(Batch Advisor Name : Mr. Talha )', 'BSSE Batch - 17', NULL, 'HU4092', 'Professional Practices', 3, 'A', 17, 44, 'Ms. Maha Saddal', 'KUST ROOM 1', NULL, NULL, NULL, '1', '1', NULL, NULL),
  ('BSSE Batch - 17 : 8th semester(Batch Advisor Name : Mr. Talha )', 'BSSE Batch - 17', NULL, 'IT4052', 'Operation Research', 3, 'A', 17, 44, 'TBA', 'KUST ROOM 1', NULL, NULL, '2', '2', NULL, NULL, NULL),
  ('BSSE Batch - 17 : 8th semester(Batch Advisor Name : Mr. Talha )', 'BSSE Batch - 17', NULL, 'SC330', 'Business Ethics', 3, 'A', 17, 44, 'TBA', 'KUST ROOM 1', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSSE Batch - 17 : 8th semester(Batch Advisor Name : Mr. Talha )', 'BSSE Batch - 17', NULL, 'IT452', 'Cloud Computing', 3, 'A', 17, 44, 'Ms. Zahra', 'KUST ROOM 2', NULL, NULL, '3', '4', NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Mr. Muhammad Haseeb Nasir)(Section A)', 'BSSE Batch - 18', NULL, 'SE384', 'Software Construction and Development', 2, 'A', 18, 37, 'TBA', 'KUST ROOM 6', NULL, NULL, NULL, '5', '5', NULL, NULL),
  ('BSSE Batch 018: 6th semester (Mr. Muhammad Haseeb Nasir)(Section A)', 'BSSE Batch - 18', NULL, 'SE384L', 'Software Construction and Development Lab', 1, 'A', 18, 37, 'TBA', 'LAB', NULL, '4,5', NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Mr. Muhammad Haseeb Nasir)(Section A)', 'BSSE Batch - 18', NULL, 'SE385', 'Software Quality Engineering', 2, 'A', 18, 37, 'Ms. Maryam Faqir', 'KUST ROOM 6', NULL, NULL, NULL, '3', '3', NULL, NULL),
  ('BSSE Batch 018: 6th semester (Mr. Muhammad Haseeb Nasir)(Section A)', 'BSSE Batch - 18', NULL, 'SE385L', 'Software Quality Engineering Lab', 1, 'A', 18, 37, 'TBA', 'LAB', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Mr. Muhammad Haseeb Nasir)(Section A)', 'BSSE Batch - 18', NULL, 'CC361', 'Information Security', 3, 'A', 18, 37, 'TBA', 'KUST ROOM 9', NULL, NULL, '3', '1', NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Mr. Muhammad Haseeb Nasir)(Section A)', 'BSSE Batch - 18', 'BSSE(A+B)', 'EN220', 'Technical and Business Writing', 3, 'A,B', 18, 37, 'TBA', 'KUSC ROOM 3', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Mr. Muhammad Haseeb Nasir)(Section A)', 'BSSE Batch - 18', NULL, 'SE4154', 'Machine Learning', 3, 'A', 18, 37, 'TBA', 'KUST ROOM 6', NULL, '1,2', NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Mr. Muhammad Haseeb Nasir)(Section A)', 'BSSE Batch - 18', NULL, 'CS4146', 'Blockchain Technology and Applications', 3, 'A', 18, 37, 'Mr.Mustahshan Hammad', 'KUST ROOM 6', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BSSE Batch 018: 6th semester (Mr. Muhammad Haseeb Nasir)(Section A)', 'BSSE Batch - 18', NULL, 'SD102', '21st Century Skills', 0, 'A', 18, 37, NULL, NULL, '3,4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Batch Advisor Name :  Ms. Zahra Ali) (Section B)', 'BSSE Batch - 18', NULL, 'SE384', 'Software Construction and Development', 2, 'B', 19, 25, 'TBA', 'KUST ROOM 9', NULL, NULL, '1', NULL, '1', NULL, NULL),
  ('BSSE Batch 018: 6th semester (Batch Advisor Name :  Ms. Zahra Ali) (Section B)', 'BSSE Batch - 18', NULL, 'SE384L', 'Software Construction and Development Lab', 1, 'B', 19, 25, 'TBA', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Batch Advisor Name :  Ms. Zahra Ali) (Section B)', 'BSSE Batch - 18', NULL, 'SE385', 'Software Quality Engineering', 2, 'B', 19, 25, 'Ms. Maryam Faqir', 'KUST ROOM 8', NULL, '2', '2', NULL, NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Batch Advisor Name :  Ms. Zahra Ali) (Section B)', 'BSSE Batch - 18', NULL, 'SE385L', 'Software Quality Engineering Lab', 1, 'B', 19, 25, 'TBA', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Batch Advisor Name :  Ms. Zahra Ali) (Section B)', 'BSSE Batch - 18', NULL, 'CC361', 'Information Security', 3, 'B', 19, 25, 'TBA', 'KUST ROOM 8', NULL, '3', NULL, '3', NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Batch Advisor Name :  Ms. Zahra Ali) (Section B)', 'BSSE Batch - 18', 'BSSE(A+B)', 'EN220', 'Technical and Business Writing', 3, 'A,B', 19, 25, 'TBA', 'KUSC ROOM 3', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Batch Advisor Name :  Ms. Zahra Ali) (Section B)', 'BSSE Batch - 18', NULL, 'IT3161', 'Web Technologies', 3, 'B', 19, 25, 'Mr. Muhammad Safi ullah', 'KUST ROOM 8', NULL, '4', NULL, '4', NULL, NULL, NULL),
  ('BSSE Batch 018: 6th semester (Batch Advisor Name :  Ms. Zahra Ali) (Section B)', 'BSSE Batch - 18', NULL, 'CS4156', 'Natural Language Processing', 3, 'B', 19, 25, 'Dr. Wasim', 'KUST ROOM 8', NULL, NULL, NULL, NULL, '2,3', NULL, NULL),
  ('BSSE Batch 018: 6th semester (Batch Advisor Name :  Ms. Zahra Ali) (Section B)', 'BSSE Batch - 18', NULL, 'SD102', '21st Century Skills', 0, 'B', 19, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19(4th  semester )  (Batch Advisor Name : Ms. Fatima Khalil) (Section A)', 'BSSE Batch - 19', NULL, 'CC251', 'Computer Networks', 2, 'A', 19, 50, 'TBA', 'KUST ROOM 2', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSSE Batch 19(4th  semester )  (Batch Advisor Name : Ms. Fatima Khalil) (Section A)', 'BSSE Batch - 19', NULL, 'CC251L', 'Computer Networks Lab', 1, 'A', 19, 50, 'Ms.Javeria Jalil', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19(4th  semester )  (Batch Advisor Name : Ms. Fatima Khalil) (Section A)', 'BSSE Batch - 19', NULL, 'CC231', 'Database Systems', 3, 'A', 19, 50, 'Mr. Sajid Iqbal', 'KUST ROOM 1', NULL, '4', '4', NULL, NULL, NULL, NULL),
  ('BSSE Batch 19(4th  semester )  (Batch Advisor Name : Ms. Fatima Khalil) (Section A)', 'BSSE Batch - 19', NULL, 'CC231L', 'Database Systems Lab', 1, 'A', 19, 50, 'TBA', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19(4th  semester )  (Batch Advisor Name : Ms. Fatima Khalil) (Section A)', 'BSSE Batch - 19', NULL, 'SE282', 'Software Requirement Engineering', 2, 'A', 19, 50, 'Ms. Maryam Faqir', 'KUST ROOM 1', NULL, NULL, '5', '5', NULL, NULL, NULL),
  ('BSSE Batch 19(4th  semester )  (Batch Advisor Name : Ms. Fatima Khalil) (Section A)', 'BSSE Batch - 19', NULL, 'SE282L', 'Software Requirement Engineering Lab', 1, 'A', 19, 50, 'TBA', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19(4th  semester )  (Batch Advisor Name : Ms. Fatima Khalil) (Section A)', 'BSSE Batch - 19', NULL, 'CC222', 'Computer Organization and Assembly Language', 2, 'A', 19, 50, 'Mr. Talha', 'KUST ROOM 4', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BSSE Batch 19(4th  semester )  (Batch Advisor Name : Ms. Fatima Khalil) (Section A)', 'BSSE Batch - 19', NULL, 'CC222L', 'Computer Organization and Assembly Language Lab', 1, 'A', 19, 50, 'Mr. Talha', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19(4th  semester )  (Batch Advisor Name : Ms. Fatima Khalil) (Section A)', 'BSSE Batch - 19', NULL, 'SD100', 'English Immersion', 0, 'A', 19, 50, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19(4th  semester )  (Batch Advisor Name : Ms. Fatima Khalil) (Section A)', 'BSSE Batch - 19', NULL, 'HU201', 'Professional Practices', 3, 'A', 19, 50, 'TBA', 'KUST ROOM 1', NULL, '1,2', NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19(4th  semester )  (Batch Advisor Name : Ms. Fatima Khalil) (Section A)', 'BSSE Batch - 19', NULL, 'SE4154', 'Machine Learning', 3, 'A', 19, 50, 'TBA', 'KUST ROOM 3', NULL, NULL, NULL, '2,3', NULL, NULL, NULL),
  ('BSSE Batch 19 (3rd semester ) Batch Advisor Name: Ms. Fatima Wajahat) (Section B)', 'BSSE Batch - 19', NULL, 'CC251', 'Computer Networks', 2, 'B', 19, 50, 'TBA', 'KUST ROOM 1', '1', NULL, NULL, NULL, '2', NULL, NULL),
  ('BSSE Batch 19 (3rd semester ) Batch Advisor Name: Ms. Fatima Wajahat) (Section B)', 'BSSE Batch - 19', NULL, 'CC251L', 'Computer Networks Lab', 1, 'B', 19, 50, 'Ms.Javeria Jalil', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19 (3rd semester ) Batch Advisor Name: Ms. Fatima Wajahat) (Section B)', 'BSSE Batch - 19', NULL, 'CC231', 'Database Systems', 3, 'B', 19, 50, 'Mr. Sajid Iqbal', 'KUST ROOM 1', NULL, '5', NULL, '4', NULL, NULL, NULL),
  ('BSSE Batch 19 (3rd semester ) Batch Advisor Name: Ms. Fatima Wajahat) (Section B)', 'BSSE Batch - 19', NULL, 'CC231L', 'Database Systems Lab', 1, 'B', 19, 50, 'TBA', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19 (3rd semester ) Batch Advisor Name: Ms. Fatima Wajahat) (Section B)', 'BSSE Batch - 19', NULL, 'SE282', 'Software Requirement Engineering', 2, 'B', 19, 50, 'Ms. Maryam Faqir', 'KUST ROOM 2', NULL, '4', NULL, NULL, '1', NULL, NULL),
  ('BSSE Batch 19 (3rd semester ) Batch Advisor Name: Ms. Fatima Wajahat) (Section B)', 'BSSE Batch - 19', NULL, 'SE282L', 'Software Requirement Engineering Lab', 1, 'B', 19, 50, 'TBA', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19 (3rd semester ) Batch Advisor Name: Ms. Fatima Wajahat) (Section B)', 'BSSE Batch - 19', NULL, 'CC222', 'Computer Organization and Assembly Language', 2, 'B', 19, 50, 'Mr. Talha', 'KUST ROOM 2', NULL, NULL, NULL, '1,2', NULL, NULL, NULL),
  ('BSSE Batch 19 (3rd semester ) Batch Advisor Name: Ms. Fatima Wajahat) (Section B)', 'BSSE Batch - 19', NULL, 'CC222L', 'Computer Organization and Assembly Language Lab', 1, 'B', 19, 50, 'TBA', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19 (3rd semester ) Batch Advisor Name: Ms. Fatima Wajahat) (Section B)', 'BSSE Batch - 19', NULL, 'SD100', 'English Immersion', 0, 'B', 19, 50, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19 (3rd semester ) Batch Advisor Name: Ms. Fatima Wajahat) (Section B)', 'BSSE Batch - 19', NULL, 'HU201', 'Professional Practices', 3, 'B', 19, 50, 'Mr. Ahsan Ali', 'KUSC ROOM 4', NULL, '1,2', NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 19 (3rd semester ) Batch Advisor Name: Ms. Fatima Wajahat) (Section B)', 'BSSE Batch - 19', NULL, 'CS4146', 'Blockchain Technology and Application', 3, 'B', 19, 50, 'Mr.Mustahshan Hammad', 'KUST ROOM 4', '2,3', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', NULL, 'CC111', 'Programming Fundamentals', 3, 'A', 20, 50, 'Mr. Muhammad Safi ullah', 'KUST ROOM 3', NULL, '3', NULL, '1', NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', NULL, 'CC111L', 'Programming Fundamentals Lab', 1, 'A', 20, 50, 'Mr. Muhammad Qasim', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', NULL, 'MA150', 'Probability and Statistics', 3, 'A', 20, 50, 'Dr. Shahzad Ahmad', 'KUSC ROOM 1', NULL, '2', NULL, '2', NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', NULL, 'MA108', 'Multivariable Calculus', 3, 'A', 20, 50, 'Ms. Mariyah Aslam', 'KUST ROOM 3', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', NULL, 'NS125', 'Applied Physics', 2, 'A', 20, 50, 'Ms Tayyaba', 'KUST ROOM 3', NULL, NULL, '1,2', NULL, NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', NULL, 'NS125L', 'Applied Physics Lab', 1, 'A', 20, 50, 'Mr.AZAD', 'Phy LAB', NULL, NULL, '3,4', NULL, NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', NULL, 'EN123', 'English-II', 3, 'A', 20, 50, 'TBA', 'KUST ROOM 2', NULL, NULL, NULL, NULL, NULL, '3,4', NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', NULL, 'SD221', 'Life and Learning', 3, 'A', 20, 50, 'TBA', 'KUST ROOM 2', NULL, NULL, NULL, NULL, NULL, '1,2', NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', 'BSSE,BSCS(A+B)', 'MA050', 'Algebra and Trigonometry', 3, 'A,B', 20, 50, 'Ms. Mariyah Aslam', 'KUST ROOM 3', '4,5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', 'BSSE/BSAI', 'CC111', 'Programming Fundamentals', 3, 'B', 20, 50, 'Mr. Muhammad Safi ullah', 'KUST ROOM 3', NULL, '1', NULL, '5', NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', NULL, 'CC111L', 'Programming Fundamentals Lab', 1, 'B', 20, 50, 'Mr. Muhammad Qasim', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', NULL, 'MA150', 'Probability and Statistics', 3, 'B', 20, 50, 'Dr. Shahzad Ahmad', 'KUSC ROOM 1', NULL, '3', NULL, '3', NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', NULL, 'MA108', 'Multivariable Calculus', 3, 'B', 20, 50, 'Ms. Mariyah Aslam', 'KUST ROOM 4', NULL, NULL, '5', '4', NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', 'BSSE(B),BSIT', 'NS125', 'Applied Physics', 2, 'B', 20, 50, 'Ms Tayyaba', 'KUST ROOM 3', NULL, NULL, '3,4', NULL, NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', 'BSSE(B),BSIT', 'NS125L', 'Applied Physics Lab', 1, 'B', 20, 50, 'Mr.AZAD', 'Phy LAB', NULL, '2,3', NULL, NULL, NULL, NULL, NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', NULL, 'EN123', 'English-II', 3, 'B', 20, 50, 'TBA', 'KUSC ROOM 4', NULL, NULL, NULL, NULL, NULL, '1,2', NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', 'BSSE(B),BSIT', 'SD221', 'Life and Learning', 3, 'B', 20, 50, 'TBA', 'KUSC ROOM 4', NULL, NULL, NULL, NULL, NULL, '3,4', NULL),
  ('BSSE Batch 20 (2nd semester ) Batch Advisor Name: ) (Section A)', 'BSSE Batch - 20', 'BSSE,BSCS(A+B)', 'MA050', 'Algebra and Trigonometry', 3, 'A,B', 20, 50, 'Ms. Mariyah Aslam', 'KUST ROOM 3', '4,5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch - 17: 8th Semester(Batch Advisor Name: Ms. Jannat ul Mawa)', 'BSCS Batch - 17', NULL, 'CC3121', 'Information Security', 3, 'A', NULL, 38, 'Ms.Fatima Khalil', 'KUST ROOM 7', NULL, NULL, NULL, '2', '2', NULL, NULL),
  ('BSCS Batch - 17: 8th Semester(Batch Advisor Name: Ms. Jannat ul Mawa)', 'BSCS Batch - 17', NULL, 'MG112', 'Introduction to Business', 3, 'A', NULL, 38, 'TBA', 'KUST ROOM 7', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSCS Batch - 17: 8th Semester(Batch Advisor Name: Ms. Jannat ul Mawa)', 'BSCS Batch - 17', NULL, 'MG366', 'IT Entrepreneurship', 3, 'A', NULL, 38, 'TBA', 'KUST ROOM 7', NULL, NULL, '1,2', NULL, NULL, NULL, NULL),
  ('BSCS Batch - 17: 8th Semester(Batch Advisor Name: Ms. Jannat ul Mawa)', 'BSCS Batch - 17', NULL, 'CS4156', 'Natural Language Processing', 3, 'A', NULL, 38, 'Dr. Wasim', 'KUST ROOM 7', NULL, NULL, NULL, '3,4', NULL, NULL, NULL),
  ('BSCS Batch - 17: 8th Semester(Batch Advisor Name: Ms. Jannat ul Mawa)', 'BSCS Batch - 17', NULL, 'CC4182', 'FYP 2', 3, 'A', NULL, 38, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch - 17: 8th Semester(Batch Advisor Name: Ms. Jannat ul Mawa)', 'BSCS Batch - 17', NULL, 'SD101', '21st Century', 0, 'A', NULL, 38, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch - 18: 6th Semester(Batch Advisor Name: Mr. Sajid Iqbal) (Section-A)', 'BSCS Batch - 18', NULL, 'CC371', 'Artificial Intelligence', 3, 'A', NULL, 23, 'Ms. Saleha', 'KUST ROOM 9', NULL, NULL, '2', NULL, NULL, NULL, NULL),
  ('BSCS Batch - 18: 6th Semester(Batch Advisor Name: Mr. Sajid Iqbal) (Section-A)', 'BSCS Batch - 18', NULL, 'CC371', 'Artificial Intelligence', 3, 'A', NULL, 23, 'Ms. Saleha', 'KUST ROOM 6', NULL, NULL, NULL, '3', NULL, NULL, NULL),
  ('BSCS Batch - 18: 6th Semester(Batch Advisor Name: Mr. Sajid Iqbal) (Section-A)', 'BSCS Batch - 18', 'A+B', 'EN220', 'Technical and Business Writing', 3, 'A', NULL, 23, 'TBA', 'KUSC ROOM 2', NULL, '3,4', NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch - 18: 6th Semester(Batch Advisor Name: Mr. Sajid Iqbal) (Section-A)', 'BSCS Batch - 18', NULL, 'CS324', 'Human Computer Interaction', 3, 'A', NULL, 23, 'Mr. Muhammad Sajjad', 'KUST ROOM 6', NULL, NULL, '1', '1', NULL, NULL, NULL),
  ('BSCS Batch - 18: 6th Semester(Batch Advisor Name: Mr. Sajid Iqbal) (Section-A)', 'BSCS Batch - 18', NULL, 'CS342', 'Compiler Construction', 3, 'A', NULL, 23, 'TBA', 'KUST ROOM 6', NULL, '5', '4', NULL, NULL, NULL, NULL),
  ('BSCS Batch - 18: 6th Semester(Batch Advisor Name: Mr. Sajid Iqbal) (Section-A)', 'BSCS Batch - 18', NULL, 'IT452', 'Cloud Computing', 3, 'A', NULL, 23, 'Ms. Zahra', 'KUST ROOM 5', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BSCS Batch - 18: 6th Semester(Batch Advisor Name: Mr. Sajid Iqbal) (Section-A)', 'BSCS Batch - 18', NULL, 'SE4167', 'Mobile Application Development', 3, 'A', NULL, 23, 'Mr.Haseeb Nasir', 'KUST ROOM 9', NULL, NULL, NULL, '4', '3', NULL, NULL),
  ('BSCS Batch - 18: 6th Semester(Batch Advisor Name: Mr. Sajid Iqbal) (Section-A)', 'BSCS Batch - 18', NULL, 'SD101', '21st Century Skills', 0, 'A', NULL, 23, NULL, 'KUST ROOM 6', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCSBatch - 18: 6th Semester(Batch Advisor Name: Mr. Muhammad Safiullah) (Section-B)', 'BSCS Batch - 18', NULL, 'CC371', 'Artificial Intelligence', 3, 'B', NULL, 25, 'Ms. Saleha', 'KUST ROOM 5', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCSBatch - 18: 6th Semester(Batch Advisor Name: Mr. Muhammad Safiullah) (Section-B)', 'BSCS Batch - 18', 'A+B', 'EN220', 'Technical and Business Writing', 3, 'B', NULL, 25, 'TBA', 'KUSC ROOM 2', NULL, '3,4', NULL, NULL, NULL, NULL, NULL),
  ('BSCSBatch - 18: 6th Semester(Batch Advisor Name: Mr. Muhammad Safiullah) (Section-B)', 'BSCS Batch - 18', NULL, 'CS324', 'Human Computer Interaction', 3, 'B', NULL, 25, 'TBA', 'KUST ROOM 5', '4', '1', NULL, NULL, NULL, NULL, NULL),
  ('BSCSBatch - 18: 6th Semester(Batch Advisor Name: Mr. Muhammad Safiullah) (Section-B)', 'BSCS Batch - 18', NULL, 'CS342', 'Compiler Construction', 3, 'B', NULL, 25, 'TBA', 'ROOM 40', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSCSBatch - 18: 6th Semester(Batch Advisor Name: Mr. Muhammad Safiullah) (Section-B)', 'BSCS Batch - 18', NULL, 'CS4156', 'Natural Language Processing', 3, 'B', NULL, 25, 'Ms. Hina Tufail', 'KUSC ROOM 3', NULL, NULL, '3', NULL, '1', NULL, NULL),
  ('BSCSBatch - 18: 6th Semester(Batch Advisor Name: Mr. Muhammad Safiullah) (Section-B)', 'BSCS Batch - 18', NULL, 'IT452', 'Cloud Computing', 3, 'B', NULL, 25, 'Ms. Zahra', 'KUST ROOM 7', '5', NULL, '5', NULL, NULL, NULL, NULL),
  ('BSCSBatch - 18: 6th Semester(Batch Advisor Name: Mr. Muhammad Safiullah) (Section-B)', 'BSCS Batch - 18', NULL, 'SD101', '21st Century Skills', 0, 'B', NULL, 25, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester)(Batch Advisor Name: Mr. Talal Bin Maqsood)( (Section A)', 'BSCS Batch - 19', NULL, 'CC251', 'Computer Networks', 2, 'A', 19, 50, 'TBA', 'KUST ROOM 1', '2,3', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester)(Batch Advisor Name: Mr. Talal Bin Maqsood)( (Section A)', 'BSCS Batch - 19', NULL, 'CC251L', 'Computer Networks Lab', 1, 'A', 19, 50, 'Ms.Javeria Jalil', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester)(Batch Advisor Name: Mr. Talal Bin Maqsood)( (Section A)', 'BSCS Batch - 19', NULL, 'CC230', 'Database Systems', 3, 'A', 19, 50, 'Mr. Talha', 'KUST ROOM 6', NULL, NULL, '2,3', NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester)(Batch Advisor Name: Mr. Talal Bin Maqsood)( (Section A)', 'BSCS Batch - 19', NULL, 'CC230L', 'Database Systems Lab', 1, 'A', 19, 50, 'Ms.Jannat ul Mava', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester)(Batch Advisor Name: Mr. Talal Bin Maqsood)( (Section A)', 'BSCS Batch - 19', NULL, 'CS4135', 'Data Science Technologies', 3, 'A', 19, 50, 'TBA', 'KUST ROOM 2', '1', '1', NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester)(Batch Advisor Name: Mr. Talal Bin Maqsood)( (Section A)', 'BSCS Batch - 19', NULL, 'HU201', 'Professional Practices', 3, 'A', 19, 50, 'Mr.Tayyab', 'KUST ROOM 4', NULL, '3', '4', NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester)(Batch Advisor Name: Mr. Talal Bin Maqsood)( (Section A)', 'BSCS Batch - 19', NULL, 'CS245', 'Computer Architecture', 3, 'A', 19, 50, 'Mr. Talal Maqsood', 'KUST ROOM 2', NULL, '2', NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester)(Batch Advisor Name: Mr. Talal Bin Maqsood)( (Section A)', 'BSCS Batch - 19', NULL, 'CS245', 'Computer Architecture', 3, 'A', 19, 50, 'Mr. Talal Maqsood', 'KUSC ROOM 3', NULL, NULL, NULL, '3', NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester)(Batch Advisor Name: Mr. Talal Bin Maqsood)( (Section A)', 'BSCS Batch - 19', NULL, 'MG112', 'Introduction to Business', 3, 'A', 19, 50, 'TBA', 'KUSC ROOM 2', NULL, NULL, NULL, '1,2', NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester) (Batch Advisor Name: Mr. Muhammad Tayyab) (Section B)', 'BSCS Batch - 19', NULL, 'CC251', 'Computer Networks', 2, 'B', 19, 50, 'TBA', 'KUST ROOM 1', '5', '3', NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester) (Batch Advisor Name: Mr. Muhammad Tayyab) (Section B)', 'BSCS Batch - 19', NULL, 'CC251L', 'Computer Networks Lab', 1, 'B', 19, 50, 'Ms.Javeria Jalil', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester) (Batch Advisor Name: Mr. Muhammad Tayyab) (Section B)', 'BSCS Batch - 19', NULL, 'CC230', 'Database Systems', 3, 'B', 19, 50, 'Ms. Zainab', 'KUST ROOM 4', '1', '2', NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester) (Batch Advisor Name: Mr. Muhammad Tayyab) (Section B)', 'BSCS Batch - 19', NULL, 'CC230L', 'Database Systems Lab', 1, 'B', 19, 50, 'Ms.Jannat ul Mava', 'LAb', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester) (Batch Advisor Name: Mr. Muhammad Tayyab) (Section B)', 'BSCS Batch - 19', NULL, 'SE4167', 'Mobile Application Development', 3, 'B', 19, 50, 'Mr.Haseeb Nasir', 'KUST ROOM 2', NULL, '5', '4', NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester) (Batch Advisor Name: Mr. Muhammad Tayyab) (Section B)', 'BSCS Batch - 19', NULL, 'HU201', 'Professional Practices', 3, 'B', 19, 50, 'TBA', 'KUST ROOM 3', '2', NULL, '5', NULL, NULL, NULL, NULL),
  ('BSCS Batch 019(4th Semester) (Batch Advisor Name: Mr. Muhammad Tayyab) (Section B)', 'BSCS Batch - 19', NULL, 'CS245', 'Computer Architecture', 3, 'B', 19, 50, 'Mr. Talal Maqsood', 'KUST ROOM 2', '3', NULL, NULL, NULL, '2', NULL, NULL),
  ('BSCS Batch 019(4th Semester) (Batch Advisor Name: Mr. Muhammad Tayyab) (Section B)', 'BSCS Batch - 19', NULL, 'MG112', 'Introduction to Business', 3, 'B', 19, 50, 'TBA', 'KUSC ROOM 3', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section A)', 'BSCS Batch - 20', NULL, 'ISL104', 'Islamic Thought and Perspectives', 2, 'A', 20, 50, 'TBA', 'KUSC ROOM 1', NULL, NULL, NULL, NULL, NULL, '9:00-11:00', NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section A)', 'BSCS Batch - 20', NULL, 'EN123', 'English-II', 3, 'A', 20, 50, 'TBA', 'KUSC ROOM 1', NULL, NULL, NULL, NULL, NULL, '3,4', NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section A)', 'BSCS Batch - 20', NULL, 'CC111', 'Programming Fundamentals', 3, 'A', 20, 50, 'Dr. Naila', 'KUST ROOM 2', '2', NULL, '1', NULL, NULL, NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section A)', 'BSCS Batch - 20', NULL, 'CC111L', 'Programming Fundamentals Lab', 1, 'A', 20, 50, 'Mr. Muhammad Qasim', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section A)', 'BSCS Batch - 20', NULL, 'CC121', 'Digital Logic Design', 2, 'A', 20, 50, 'Mr. Tayyab Waqar', 'KUSC ROOM 4', NULL, NULL, '2,3', NULL, NULL, NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section A)', 'BSCS Batch - 20', NULL, 'CC121L', 'Digital Logic Design Lab', 1, 'A', 20, 50, 'Ms. Fatima Wajahat', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section A)', 'BSCS Batch - 20', NULL, 'MA107', 'Calculus and Analytic Geometry', 3, 'A', 20, 50, 'Dr. M Kashif Shafiq', 'KUSC ROOM 3', NULL, NULL, NULL, '1,2', NULL, NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section A)', 'BSCS Batch - 20', NULL, 'MK210', 'Principles of Marketing', 3, 'A', 20, 50, 'TBA', 'KUSC ROOM 2', NULL, NULL, NULL, '4,5', NULL, NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section A)', 'BSCS Batch - 20', 'BSSE,BSCS(A+B)', 'MA050', 'Algebra and Trigonometry', 3, 'A,B', 20, 50, 'Ms. Mariyah Aslam', 'KUST ROOM 3', '4,5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section B)', 'BSCS Batch - 20', NULL, 'ISL104', 'Islamic Thought and Perspectives', 2, 'B', 20, 50, 'TBA', 'KUSC ROOM 2', NULL, NULL, NULL, NULL, NULL, '11:30-1:30', NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section B)', 'BSCS Batch - 20', NULL, 'EN123', 'English-II', 3, 'B', 20, 50, 'TBA', 'KUSC ROOM 2', NULL, NULL, NULL, NULL, NULL, '1,2', NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section B)', 'BSCS Batch - 20', NULL, 'CC111', 'Programming Fundamentals', 3, 'B', 20, 50, 'Dr. Naila', 'KUST ROOM 3', '3', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section B)', 'BSCS Batch - 20', NULL, 'CC111', 'Programming Fundamentals', 3, 'B', 20, 50, 'Dr. Naila', 'KUST ROOM 4', NULL, NULL, '3', NULL, NULL, NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section B)', 'BSCS Batch - 20', NULL, 'CC111L', 'Programming Fundamentals Lab', 1, 'B', 20, 50, 'Mr. Muhammad Qasim', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section B)', 'BSCS Batch - 20', NULL, 'CC121', 'Digital Logic Design', 2, 'B', 20, 50, 'Mr. Tayyab Waqar', 'KUST ROOM 2', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section B)', 'BSCS Batch - 20', NULL, 'CC121L', 'Digital Logic Design Lab', 1, 'B', 20, 50, 'Ms. Fatima Wajahat', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section B)', 'BSCS Batch - 20', NULL, 'MA107', 'Calculus and Analytic Geometry', 3, 'B', 20, 50, 'Dr. M Kashif Shafiq', 'KUSC ROOM 2', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section B)', 'BSCS Batch - 20', NULL, 'MK210', 'Principles of Marketing', 3, 'B', 20, 50, 'TBA', 'KUSC ROOM 2', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('BSCS Batch 20 (2nd  Semester) (Ms. Zainab IrfanBatch Advisor Name: ) (Section B)', 'BSCS Batch - 20', 'BSSE,BSCS(A+B)', 'MA050', 'Algebra and Trigonometry', 3, 'A,B', 20, 50, 'Ms. Mariyah Aslam', 'KUST ROOM 3', '4,5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 8: 8th Semster (Batch Advisor Name :  Ms. Aqsa Zahid)', 'BSIT Batch - 8', NULL, 'CC4182', 'Final Year Project – II', 3, 'A', 8, 42, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 8: 8th Semster (Batch Advisor Name :  Ms. Aqsa Zahid)', 'BSIT Batch - 8', NULL, 'SC330', 'Business Ethics', 3, 'A', 8, 42, 'TBA', 'KUST ROOM 2', '4,5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 8: 8th Semster (Batch Advisor Name :  Ms. Aqsa Zahid)', 'BSIT Batch - 8', NULL, 'CS391', 'Computer Vision', 3, 'A', 8, 42, 'TBA', 'KUST ROOM 3', NULL, '4,5', NULL, NULL, NULL, NULL, NULL),
  ('Batch - 8: 8th Semster (Batch Advisor Name :  Ms. Aqsa Zahid)', 'BSIT Batch - 8', NULL, 'HU4092', 'Professional Practices', 3, 'A', 8, 36, 'Ms. Maha Saddal', 'KUST ROOM 7', NULL, '3', '3', NULL, NULL, NULL, NULL),
  ('Batch - 8: 8th Semster (Batch Advisor Name :  Ms. Aqsa Zahid)', 'BSIT Batch - 8', NULL, 'POL101', 'Pakistan Studies', 3, 'A', 8, 42, 'TBA', 'KUSC ROOM 4', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('Batch - 9: 6th Semster  (Section - A)Batch Advisor Name :  Ms. Javeria Jalil', 'BSIT batch - 9', NULL, 'IT321', 'System and Network Administration', 2, 'A', NULL, 24, 'TBA', 'KUST ROOM 6', '3,4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 9: 6th Semster  (Section - A)Batch Advisor Name :  Ms. Javeria Jalil', 'BSIT batch - 9', NULL, 'IT321L', 'System and Network Administration Lab', 1, 'A', NULL, 24, 'Mr.Muhammad Shabban', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 9: 6th Semster  (Section - A)Batch Advisor Name :  Ms. Javeria Jalil', 'BSIT batch - 9', NULL, 'CY361', 'Cyber Security', 2, 'A', NULL, 24, 'Dr. Imtiaz', 'KUST ROOM 5', NULL, NULL, '3,4', NULL, NULL, NULL, NULL),
  ('Batch - 9: 6th Semster  (Section - A)Batch Advisor Name :  Ms. Javeria Jalil', 'BSIT batch - 9', NULL, 'CY361L', 'Cyber Security Lab', 1, 'A', NULL, 24, 'Ms.Zainab Irfan', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 9: 6th Semster  (Section - A)Batch Advisor Name :  Ms. Javeria Jalil', 'BSIT batch - 9', NULL, 'CC342', 'Analysis of Algorithms', 3, 'A', NULL, 24, 'Muhammad Junaid', 'KUST ROOM 6', '1', NULL, '5', NULL, NULL, NULL, NULL),
  ('Batch - 9: 6th Semster  (Section - A)Batch Advisor Name :  Ms. Javeria Jalil', 'BSIT batch - 9', 'A+B', 'EN220', 'Technical and Business Writing', 3, 'A', NULL, 24, 'TBA', 'KUSC ROOM 1', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('Batch - 9: 6th Semster  (Section - A)Batch Advisor Name :  Ms. Javeria Jalil', 'BSIT batch - 9', NULL, 'CS4152', 'Deep learning and Neural networks', 3, 'A', NULL, 24, 'Ms. Hina Tufail', 'KUST ROOM 6', '2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 9: 6th Semster  (Section - A)Batch Advisor Name :  Ms. Javeria Jalil', 'BSIT batch - 9', NULL, 'CS4152', 'Deep learning and Neural networks', 3, 'A', NULL, 24, 'Ms. Hina Tufail', 'KUST ROOM 5', NULL, '2', NULL, NULL, NULL, NULL, NULL),
  ('Batch - 9: 6th Semster  (Section - A)Batch Advisor Name :  Ms. Javeria Jalil', 'BSIT batch - 9', NULL, 'IT4073', 'Data Communications', 3, 'A', NULL, 24, 'Mr. Tayyab Waqar', 'KUST ROOM 7', NULL, '4,5', NULL, NULL, NULL, NULL, NULL),
  ('Batch - 9: 6th Semster  (Section - A)Batch Advisor Name :  Ms. Javeria Jalil', 'BSIT batch - 9', NULL, 'SD101', '21st Century Skills', 0, 'A', NULL, 24, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 9: 5th 6emster  (Section - B)Batch Advisor Name:  Ms. Zainab Pervaiz', 'BSIT batch - 9', NULL, 'IT321', 'System and Network Administration', 2, 'B', 9, 38, 'TBA', 'KUST ROOM 7', NULL, '1', NULL, NULL, '5', NULL, NULL),
  ('Batch - 9: 5th 6emster  (Section - B)Batch Advisor Name:  Ms. Zainab Pervaiz', 'BSIT batch - 9', NULL, 'IT321L', 'System and Network Administration Lab', 1, 'B', 9, 38, 'Mr.Muhammad Shabban', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 9: 5th 6emster  (Section - B)Batch Advisor Name:  Ms. Zainab Pervaiz', 'BSIT batch - 9', NULL, 'CY361', 'Cyber Security', 2, 'B', 9, 38, 'Dr. Imtiaz', 'KUST ROOM 5', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('Batch - 9: 5th 6emster  (Section - B)Batch Advisor Name:  Ms. Zainab Pervaiz', 'BSIT batch - 9', NULL, 'CY361L', 'Cyber Security Lab', 1, 'B', 9, 38, 'Ms.Zainab Irfan', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 9: 5th 6emster  (Section - B)Batch Advisor Name:  Ms. Zainab Pervaiz', 'BSIT batch - 9', NULL, 'CC342', 'Analysis of Algorithms', 3, 'B', 9, 38, 'Muhammad Junaid', 'KUST ROOM 7', NULL, '2', NULL, NULL, NULL, NULL, NULL),
  ('Batch - 9: 5th 6emster  (Section - B)Batch Advisor Name:  Ms. Zainab Pervaiz', 'BSIT batch - 9', 'A+B', 'EN220', 'Technical and Business Writing', 3, 'B', 9, 38, 'TBA', 'KUSC ROOM 1', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('Batch - 9: 5th 6emster  (Section - B)Batch Advisor Name:  Ms. Zainab Pervaiz', 'BSIT batch - 9', NULL, 'SE4167', 'Mobile Application Development', 3, 'B', 9, 38, 'Mr.Haseeb Nasir', 'KUSC ROOM 3', NULL, '3', NULL, NULL, NULL, NULL, NULL),
  ('Batch - 9: 5th 6emster  (Section - B)Batch Advisor Name:  Ms. Zainab Pervaiz', 'BSIT batch - 9', NULL, 'SE4167', 'Mobile Application Development', 3, 'B', 9, 38, 'Mr.Haseeb Nasir', 'KUST ROOM 4', NULL, NULL, NULL, '5', NULL, NULL, NULL),
  ('Batch - 9: 5th 6emster  (Section - B)Batch Advisor Name:  Ms. Zainab Pervaiz', 'BSIT batch - 9', NULL, 'SE4154', 'Machine learning', 3, 'B', 9, 38, 'Dr. Akbar', 'KUST ROOM 1', NULL, NULL, '3', '3', NULL, NULL, NULL),
  ('Batch - 9: 5th 6emster  (Section - B)Batch Advisor Name:  Ms. Zainab Pervaiz', 'BSIT batch - 9', NULL, 'SD101', '21st Century Skills', 0, 'B', 9, 38, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 10( 4th Semster) (Batch Advisor Name : Mr. Saqlain Sajjad)(Section A)', 'BSIT batch - 10', NULL, 'CC230', 'Database Systems', 3, 'A', 10, 50, 'Ms. Zainab', 'KUST ROOM 1', '4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 10( 4th Semster) (Batch Advisor Name : Mr. Saqlain Sajjad)(Section A)', 'BSIT batch - 10', NULL, 'CC230', 'Database Systems', 3, 'A', 10, 50, 'Ms. Zainab', 'KUST ROOM 2', NULL, '3', NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 10( 4th Semster) (Batch Advisor Name : Mr. Saqlain Sajjad)(Section A)', 'BSIT batch - 10', NULL, 'CC230L', 'Database Systems Lab', 1, 'A', 10, 50, 'Ms.Jannat ul Mava', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 10( 4th Semster) (Batch Advisor Name : Mr. Saqlain Sajjad)(Section A)', 'BSIT batch - 10', NULL, 'CC251', 'Computer Networks', 2, 'A', 10, 50, 'TBA', 'KUSC ROOM 4', NULL, NULL, '1', '1', NULL, NULL, NULL),
  ('BSIT Batch 10( 4th Semster) (Batch Advisor Name : Mr. Saqlain Sajjad)(Section A)', 'BSIT batch - 10', NULL, 'CC251L', 'Computer Networks Lab', 1, 'A', 10, 50, 'Ms.Javeria Jalil', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 10( 4th Semster) (Batch Advisor Name : Mr. Saqlain Sajjad)(Section A)', 'BSIT batch - 10', NULL, 'CS4135', 'Data Science Technologies', 3, 'A', 10, 50, 'TBA', 'KUST ROOM 3', NULL, '2', NULL, '4', NULL, NULL, NULL),
  ('BSIT Batch 10( 4th Semster) (Batch Advisor Name : Mr. Saqlain Sajjad)(Section A)', 'BSIT batch - 10', NULL, 'HU201', 'Professional Practices', 3, 'A', 10, 50, 'Mr.Tayyab', 'KUST ROOM 4', NULL, '4', NULL, '2', NULL, NULL, NULL),
  ('BSIT Batch 10( 4th Semster) (Batch Advisor Name : Mr. Saqlain Sajjad)(Section A)', 'BSIT batch - 10', NULL, 'IT291', 'Web Technologies', 2, 'A', 10, 50, 'Mr. Syed Waleed Hussain', 'ROOM 84', '2,3', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 10( 4th Semster) (Batch Advisor Name : Mr. Saqlain Sajjad)(Section A)', 'BSIT batch - 10', NULL, 'IT291L', 'Web Technologies Lab', 1, 'A', 10, 50, 'Mr. Syed Waleed Hussain', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 10( 4th Semster) (Batch Advisor Name : Mr. Saqlain Sajjad)(Section A)', 'BSIT batch - 10', NULL, 'MG367', 'IT Entrepreneurship', 3, 'A', 10, 50, 'TBA', 'ROOM 84', NULL, NULL, '4', '5', NULL, NULL, NULL),
  ('BSIT Batch 10 ( 4th Semester) (Batch Advisor Name: Mr. Muhammad Junaid (Section B)', 'BSIT batch - 10', NULL, 'CC230', 'Database Systems', 3, 'B', 10, 50, 'Mr. Muhammad Sajjad', 'ROOM 50', NULL, NULL, '3', '5', NULL, NULL, NULL),
  ('BSIT Batch 10 ( 4th Semester) (Batch Advisor Name: Mr. Muhammad Junaid (Section B)', 'BSIT batch - 10', NULL, 'CC230L', 'Database Systems Lab', 1, 'B', 10, 50, 'Ms.Jannat ul Mava', 'lab', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 10 ( 4th Semester) (Batch Advisor Name: Mr. Muhammad Junaid (Section B)', 'BSIT batch - 10', NULL, 'CC251', 'Computer Networks', 2, 'B', 10, 50, 'TBA', 'ROOM 50', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 10 ( 4th Semester) (Batch Advisor Name: Mr. Muhammad Junaid (Section B)', 'BSIT batch - 10', NULL, 'CC251L', 'Computer Networks Lab', 1, 'B', 10, 50, 'Ms.Zainab Irfan', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 10 ( 4th Semester) (Batch Advisor Name: Mr. Muhammad Junaid (Section B)', 'BSIT batch - 10', NULL, 'SE4154', 'Machine learning', 3, 'B', 10, 50, 'Dr. Akbar', 'ROOM 50', NULL, NULL, '4', '4', NULL, NULL, NULL),
  ('BSIT Batch 10 ( 4th Semester) (Batch Advisor Name: Mr. Muhammad Junaid (Section B)', 'BSIT batch - 10', NULL, 'HU201', 'Professional Practices', 3, 'B', 10, 50, 'Mr.Tayyab', 'ROOM 50', '3', NULL, '2', NULL, NULL, NULL, NULL),
  ('BSIT Batch 10 ( 4th Semester) (Batch Advisor Name: Mr. Muhammad Junaid (Section B)', 'BSIT batch - 10', NULL, 'IT291', 'Web Technologies', 2, 'B', 10, 50, 'Mr. Syed Waleed Hussain', 'KUST ROOM 4', NULL, '1', NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 10 ( 4th Semester) (Batch Advisor Name: Mr. Muhammad Junaid (Section B)', 'BSIT batch - 10', NULL, 'IT291', 'Web Technologies', 2, 'B', 10, 50, 'Mr. Syed Waleed Hussain', 'ROOM 50', NULL, NULL, NULL, '3', NULL, NULL, NULL),
  ('BSIT Batch 10 ( 4th Semester) (Batch Advisor Name: Mr. Muhammad Junaid (Section B)', 'BSIT batch - 10', NULL, 'IT291L', 'Web Technologies Lab', 1, 'B', 10, 50, 'Mr. Syed Waleed Hussain', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 10 ( 4th Semester) (Batch Advisor Name: Mr. Muhammad Junaid (Section B)', 'BSIT batch - 10', NULL, 'MG367', 'IT Entrepreneurship', 3, 'B', 10, 50, 'TBA', 'ROOM 50', NULL, '3,4', NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section A)', 'BSIT batch - 11', NULL, 'NS125', 'Applied Physics', 2, 'A', 11, 50, 'Dr Azeem Mir', 'KUSC ROOM 1', NULL, '4,5', NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section A)', 'BSIT batch - 11', NULL, 'NS125L', 'Applied Physics Lab', 1, 'A', 11, 50, 'Mr.Azad', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section A)', 'BSIT batch - 11', NULL, 'SD221', 'Life and Learning', 3, 'A', 11, 50, 'TBA', 'KUSC ROOM 4', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section A)', 'BSIT batch - 11', NULL, 'MA108', 'Multivariable Calculus', 3, 'A', 11, 50, 'Dr. M Nazim Tufail', 'KUSC ROOM 4', '2', '3', NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section A)', 'BSIT batch - 11', NULL, 'EN125', 'English-II', 3, 'A', 11, 50, 'Ms.Hina Sadia', 'KUSC ROOM 1', '4,5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section A)', 'BSIT batch - 11', NULL, 'CC121', 'Digital Logic Design', 2, 'A', 11, 50, 'TBA', 'KUSC ROOM 4', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section A)', 'BSIT batch - 11', NULL, 'CC121L', 'Digital Logic Design Lab', 1, 'A', 11, 50, 'Ms. Fatima Wajahat', 'LAB', NULL, NULL, '2,3', NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section A)', 'BSIT batch - 11', NULL, 'CC111', 'Programming Fundamentals', 3, 'A', 11, 50, 'Ms. Saleha', 'KUSC ROOM 2', NULL, '1', '1', NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section A)', 'BSIT batch - 11', NULL, 'CC111L', 'Programming Fundamentals Lab', 1, 'A', 11, 50, 'Mr. Muhammad Qasim', 'LAB', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section A)', 'BSIT batch - 11', 'BSIT,BSAI(A+B+C)', 'MA050', 'Algebra and Trigonometry', 3, 'A,B', 11, 50, 'Ms. Mariyah Aslam', 'KUSC ROOM 4', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section B)', 'BSIT batch - 11', 'BSSE(B),BSIT', 'NS125', 'Applied Physics', 2, 'B', 11, 7, 'Ms Tayyaba', 'KUST ROOM 3', NULL, NULL, '3,4', NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section B)', 'BSIT batch - 11', 'BSSE(B),BSIT', 'NS125L', 'Applied Physics Lab', 1, 'B', 11, 7, 'Mr.Azad', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section B)', 'BSIT batch - 11', 'BSSE(B),BSIT', 'SD221', 'Life and Learning', 3, 'B', 11, 7, 'TBA', 'ROOM 50', NULL, NULL, NULL, NULL, NULL, '3,4', NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section B)', 'BSIT batch - 11', 'BSIT,BSAI(A+C)', 'MA108', 'Multivariable Calculus', 3, 'B', 11, 7, 'Dr. M Nazim Tufail', 'KUSC ROOM 2', '4,5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section B)', 'BSIT batch - 11', 'BSSE(B),BSIT,BSAI', 'EN125', 'English-II', 3, 'B', 11, 7, 'TBA', 'ROOM 50', NULL, NULL, NULL, NULL, NULL, '1,2', NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section B)', 'BSIT batch - 11', 'BSAI,BSIT', 'CC121', 'Digital Logic Design', 2, 'B', 11, 7, 'Mr. Talal Maqsood', 'KUST ROOM 6', NULL, '3,4', NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section B)', 'BSIT batch - 11', 'BSAI,BSIT', 'CC121L', 'Digital Logic Design Lab', 1, 'B,C', 11, 7, 'Mr. Talal Maqsood', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section B)', 'BSIT batch - 11', 'BSAI,BSIT', 'CC111', 'Programming Fundamentals', 3, 'B,C', 11, 7, 'Ms. Aqsa Zahid', 'KUSC ROOM 3', '1', NULL, '1', NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section B)', 'BSIT batch - 11', NULL, 'CC111L', 'Programming Fundamentals Lab', 1, 'B,C', 11, 7, 'Mr. Muhammad Qasim', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSIT Batch 11 ( 2nd  Semester) (Batch Advisor Name :Mr. Shaban ) (Section B)', 'BSIT batch - 11', 'BSIT,BSAI(A+B+C)', 'MA050', 'Algebra and Trigonometry', 3, 'A,B', 11, 7, 'Ms. Mariyah Aslam', 'KUSC ROOM 4', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BSAI Batch 002 (8th SemesterBatch Advisor Name: Ms. Saleha)', 'BSAI Batch -02', NULL, 'CC4991', 'Capstone Project Part- II', 3, 'A', 2, 12, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 002 (8th SemesterBatch Advisor Name: Ms. Saleha)', 'BSAI Batch -02', NULL, 'HU4092', 'Professional Practices', '3', 'A', 2, 12, 'Ms. Maha Saddal', 'KUST ROOM 5', NULL, NULL, NULL, '3', '3', NULL, NULL),
  ('BSAI Batch 002 (8th SemesterBatch Advisor Name: Ms. Saleha)', 'BSAI Batch -02', NULL, 'SD422', 'Foreign Language', '3', 'A', 2, 12, 'TBA', 'KUST ROOM 5', NULL, NULL, NULL, '1,2', NULL, NULL, NULL),
  ('BSAI Batch 002 (8th SemesterBatch Advisor Name: Ms. Saleha)', 'BSAI Batch -02', NULL, 'MG301', 'Entrepreneurship', '3', 'A', 2, 12, 'TBA', 'KUST ROOM 5', NULL, '4,5', NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 002 (8th SemesterBatch Advisor Name: Ms. Saleha)', 'BSAI Batch -02', NULL, 'IT452', 'Cloud Computing', 3, 'A', 2, 12, 'TBA', 'KUST ROOM 5', NULL, '3', NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 002 (8th SemesterBatch Advisor Name: Ms. Saleha)', 'BSAI Batch -02', NULL, 'IT452', 'Cloud Computing', 3, 'A', 2, 12, 'TBA', 'KUST ROOM 9', NULL, NULL, NULL, NULL, '2', NULL, NULL),
  ('BSAI Batch 002 (8th SemesterBatch Advisor Name: Ms. Saleha)', 'BSAI Batch -02', NULL, 'SD102', '21ST Century Skills', 0, 'A', 2, 12, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 003 6th Semester (Batch Advisor Name :Mr. Waleed)', 'BSAI Batch -03', NULL, 'IT3161', 'Web Technologies', 3, 'A', 3, 46, 'Mr. Syed Waleed Hussain', 'KUST ROOM 3', '1', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 003 6th Semester (Batch Advisor Name :Mr. Waleed)', 'BSAI Batch -03', NULL, 'IT3161', 'Web Technologies', 3, 'A', 3, 46, 'Mr. Syed Waleed Hussain', 'KUSC ROOM 1', NULL, NULL, '5', NULL, NULL, NULL, NULL),
  ('BSAI Batch 003 6th Semester (Batch Advisor Name :Mr. Waleed)', 'BSAI Batch -03', NULL, 'CC361', 'Information Security', 3, 'A', 3, 46, 'Dr. Muhammad Asif', 'KUSC ROOM 3', '3,4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 003 6th Semester (Batch Advisor Name :Mr. Waleed)', 'BSAI Batch -03', NULL, 'AI374', 'Knowledge Representation & Reasoning', 3, 'A', 3, 46, 'TBA', 'KUSC ROOM 2', NULL, '5', NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 003 6th Semester (Batch Advisor Name :Mr. Waleed)', 'BSAI Batch -03', NULL, 'AI374', 'Knowledge Representation & Reasoning', 3, 'A', 3, 46, 'TBA', 'KUSC ROOM 1', NULL, NULL, '1', NULL, NULL, NULL, NULL),
  ('BSAI Batch 003 6th Semester (Batch Advisor Name :Mr. Waleed)', 'BSAI Batch -03', NULL, 'AI473', 'Artificial Neural Networks & Deep Learning', 2, 'A', 3, 46, 'Ms. Hina Tufail', 'ROOM 50', NULL, NULL, NULL, NULL, '2,3', NULL, NULL),
  ('BSAI Batch 003 6th Semester (Batch Advisor Name :Mr. Waleed)', 'BSAI Batch -03', NULL, 'AI473L', 'Artificial Neural Networks & Deep Learning Lab', 1, 'A', 3, 46, 'Ms. Hina Tufail', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 003 6th Semester (Batch Advisor Name :Mr. Waleed)', 'BSAI Batch -03', NULL, 'CS 458', 'Data Mining', 3, 'A', 3, 46, 'Dr. Umair Muneer', 'AI LAB', NULL, NULL, '3,4', NULL, NULL, NULL, NULL),
  ('BSAI Batch 003 6th Semester (Batch Advisor Name :Mr. Waleed)', 'BSAI Batch -03', NULL, 'EN220', 'Technical and Business Writing', 3, 'A', 3, 46, 'TBA', 'KUSC ROOM 4', NULL, '4', NULL, NULL, '5', NULL, NULL),
  ('BSAI Batch 004 (4th  Semester)(Batch Advisor Name : Ms. Maha saddal)', 'BSAI Batch -04', NULL, 'C251', 'Computer Networks', 2, 'A', 4, 50, 'TBA', 'KUST ROOM 3', NULL, NULL, NULL, NULL, '8:30-10:30', NULL, NULL),
  ('BSAI Batch 004 (4th  Semester)(Batch Advisor Name : Ms. Maha saddal)', 'BSAI Batch -04', NULL, 'CC251L', 'Computer Networks Lab', 1, 'A', 4, 50, 'Ms.Zainab Irfan', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 004 (4th  Semester)(Batch Advisor Name : Ms. Maha saddal)', 'BSAI Batch -04', NULL, 'CC230', 'Database Systems', 3, 'A', 4, 50, 'Mr. Muhammad Sajjad', 'KUST ROOM 2', NULL, NULL, '5', '3', NULL, NULL, NULL),
  ('BSAI Batch 004 (4th  Semester)(Batch Advisor Name : Ms. Maha saddal)', 'BSAI Batch -04', NULL, 'CC230L', 'Database Systems Lab', 1, 'A', 4, 50, 'Ms.Jannat ul Mava', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 004 (4th  Semester)(Batch Advisor Name : Ms. Maha saddal)', 'BSAI Batch -04', NULL, 'AI271', 'Programming for AI', 2, 'A', 4, 50, 'TBA', 'KUST ROOM 3', NULL, NULL, NULL, NULL, '10:30-12:30', NULL, NULL),
  ('BSAI Batch 004 (4th  Semester)(Batch Advisor Name : Ms. Maha saddal)', 'BSAI Batch -04', NULL, 'AI271L', 'Programming for AI Lab', 1, 'A', 4, 50, 'Ms.Zainab Irfan', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 004 (4th  Semester)(Batch Advisor Name : Ms. Maha saddal)', 'BSAI Batch -04', NULL, 'CC3121', 'Information Security', 3, 'A', 4, 50, 'TBA', 'KUST ROOM 7', NULL, NULL, '4', '1', NULL, NULL, NULL),
  ('BSAI Batch 004 (4th  Semester)(Batch Advisor Name : Ms. Maha saddal)', 'BSAI Batch -04', NULL, 'MK210', 'Principles of Marketing', 3, 'A', 4, 50, 'TBA', 'KUST ROOM 4', '4,5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 004 (4th  Semester)(Batch Advisor Name : Ms. Maha saddal)', 'BSAI Batch -04', NULL, 'HU201', 'Professional Practices', 3, 'A', 4, 50, 'Mr. Ahsan Ali', 'KUST ROOM 4', NULL, NULL, '1,2', NULL, NULL, NULL, NULL),
  ('BSAI Batch 004 (4th  Semester)(Batch Advisor Name : Ms. Maha saddal)', 'BSAI Batch -04', NULL, 'SD101', '21st Century', 0, 'A', 4, 50, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)Section A)(Batch Advisor Name : Ms. Maryam Faqir)', 'BSAI Batch -05', NULL, 'ISL104', 'Islamic Thought and Perspectives', 2, 'A', 5, 50, 'TBA', 'KUST ROOM 2', NULL, NULL, NULL, NULL, NULL, '1,2', NULL),
  ('BSAI Batch 005 (2nd  Semester)Section A)(Batch Advisor Name : Ms. Maryam Faqir)', 'BSAI Batch -05', NULL, 'EN123', 'English II', 3, 'A', 5, 50, 'Ms.Hina Sadia', 'KUSC ROOM 4', NULL, NULL, NULL, '2,3', NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)Section A)(Batch Advisor Name : Ms. Maryam Faqir)', 'BSAI Batch -05', NULL, 'MA108', 'Multivariable Calculus', 3, 'A', 5, 50, 'Dr. Musharafa Saleem', 'KUSC ROOM 3', NULL, '5', NULL, '5', NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)Section A)(Batch Advisor Name : Ms. Maryam Faqir)', 'BSAI Batch -05', NULL, 'CC111', 'Programming Fundamentals', 3, 'A', 5, 50, 'Ms. Aqsa Zahid', 'KUSC ROOM 3', '2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)Section A)(Batch Advisor Name : Ms. Maryam Faqir)', 'BSAI Batch -05', NULL, 'CC111', 'Programming Fundamentals', 3, 'A', 5, 50, 'Ms. Aqsa Zahid', 'KUST ROOM 4', NULL, NULL, NULL, '1', NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)Section A)(Batch Advisor Name : Ms. Maryam Faqir)', 'BSAI Batch -05', NULL, 'CC111L', 'Programming Fundamentals Lab', 1, 'A', 5, 50, 'Mr. Muhammad Shabaan', 'LAB', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)Section A)(Batch Advisor Name : Ms. Maryam Faqir)', 'BSAI Batch -05', NULL, 'CC121', 'Digital Logic Design', 2, 'A', 5, 50, 'TBA', 'Networking Lab', NULL, '3,4', NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)Section A)(Batch Advisor Name : Ms. Maryam Faqir)', 'BSAI Batch -05', NULL, 'CC121L', 'Digital Logic Design Lab', 1, 'A', 5, 50, 'Ms. Fatima Wajahat', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)Section A)(Batch Advisor Name : Ms. Maryam Faqir)', 'BSAI Batch -05', NULL, 'MK210', 'Principles of Marketing', 3, 'A', 5, 50, 'TBA', 'KUSC ROOM 4', NULL, NULL, NULL, NULL, NULL, '3,4', NULL),
  ('BSAI Batch 005 (2nd  Semester)Section A)(Batch Advisor Name : Ms. Maryam Faqir)', 'BSAI Batch -05', 'BSIT,BSAI(A+B+C)', 'MA050', 'Algebra and Trigonometry', 3, 'A,B, C', 5, 'TBA', 'Ms. Mariyah Aslam', 'KUSC ROOM 4', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)(Section B)(Batch Advisor Name :Ms. Maryam Faqir )', 'BSAI Batch -05', NULL, 'ISL104', 'Islamic Thought and Perspectives', 2, 'B', 5, 50, 'TBA', 'KUSC ROOM 1', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)(Section B)(Batch Advisor Name :Ms. Maryam Faqir )', 'BSAI Batch -05', NULL, 'EN123', 'English II', 3, 'B', 5, 50, 'Ms.Hina Sadia', 'KUSC ROOM 4', NULL, '5', NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)(Section B)(Batch Advisor Name :Ms. Maryam Faqir )', 'BSAI Batch -05', NULL, 'EN123', 'English II', 3, 'B', 5, 50, 'Ms.Hina Sadia', 'KUST ROOM 2', NULL, NULL, NULL, '5', NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)(Section B)(Batch Advisor Name :Ms. Maryam Faqir )', 'BSAI Batch -05', NULL, 'MA108', 'Multivariable Calculus', 3, 'B', 5, 50, 'Dr. Musharafa Saleem', 'KUSC ROOM 4', '3,4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)(Section B)(Batch Advisor Name :Ms. Maryam Faqir )', 'BSAI Batch -05', NULL, 'CC111', 'Programming Fundamentals', 3, 'B', 5, 50, 'Ms. Aqsa Zahid', 'KUSC ROOM 3', NULL, '1', NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)(Section B)(Batch Advisor Name :Ms. Maryam Faqir )', 'BSAI Batch -05', NULL, 'CC111', 'Programming Fundamentals', 3, 'B', 5, 50, 'Ms. Aqsa Zahid', 'KUST ROOM 2', NULL, NULL, '2', NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)(Section B)(Batch Advisor Name :Ms. Maryam Faqir )', 'BSAI Batch -05', NULL, 'CC111L', 'Programming Fundamentals Lab', 1, 'B', 5, 50, 'Mr. Muhammad Shabaan', 'LAB', NULL, '3,4', NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)(Section B)(Batch Advisor Name :Ms. Maryam Faqir )', 'BSAI Batch -05', NULL, 'CC121', 'Digital Logic Design', 2, 'B', 5, 50, 'Mr. Tayyab Waqar', 'ROOM 50', NULL, NULL, NULL, '1,2', NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)(Section B)(Batch Advisor Name :Ms. Maryam Faqir )', 'BSAI Batch -05', NULL, 'CC121L', 'Digital Logic Design Lab', 1, 'B', 5, 50, 'Ms. Fatima Wajahat', 'LAB', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)(Section B)(Batch Advisor Name :Ms. Maryam Faqir )', 'BSAI Batch -05', NULL, 'MK210', 'Principles of Marketing', 3, 'B', 5, 50, 'TBA', 'KUST ROOM 4', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSAI Batch 005 (2nd  Semester)(Section B)(Batch Advisor Name :Ms. Maryam Faqir )', 'BSAI Batch -05', 'BSIT,BSAI(A+B+C)', 'MA050', 'Algebra and Trigonometry', 3, 'A,B, C', 5, 'TBA', 'Ms. Mariyah Aslam', 'KUSC ROOM 4', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BSAI Batch 005 (1st  Semester)(Section C)(Batch Advisor Name :Ms. Maryam Faqir  )', 'BSAI Batch -05', 'BSAI(B,C)', 'ISL104', 'Islamic Thought and Perspectives', 2, 'BC', NULL, 25, 'TBA', 'KUSC ROOM 1', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (1st  Semester)(Section C)(Batch Advisor Name :Ms. Maryam Faqir  )', 'BSAI Batch -05', 'BSSE(B),BSAI', 'EN123', 'English II', 3, 'B,C', NULL, 25, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, '1,2', NULL),
  ('BSAI Batch 005 (1st  Semester)(Section C)(Batch Advisor Name :Ms. Maryam Faqir  )', 'BSAI Batch -05', 'BSIT,BSAI(A+C)', 'MA108', 'Multivariable Calculus', 3, 'C', NULL, 25, 'Dr. M Nazim Tufail', 'KUSC ROOM 2', '4,5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (1st  Semester)(Section C)(Batch Advisor Name :Ms. Maryam Faqir  )', 'BSAI Batch -05', 'BSSE(B),BSAI', 'CC111', 'Programming Fundamentals', 3, 'B,C', NULL, 25, 'Mr. Muhammad Safi ullah', 'KUST ROOM 3', NULL, '1', NULL, '5', NULL, NULL, NULL),
  ('BSAI Batch 005 (1st  Semester)(Section C)(Batch Advisor Name :Ms. Maryam Faqir  )', 'BSAI Batch -05', NULL, 'CC111L', 'Programming Fundamentals Lab', 1, 'C', NULL, 25, 'Mr. Muhammad Qasim', 'LAB', NULL, NULL, NULL, '3,4', NULL, NULL, NULL),
  ('BSAI Batch 005 (1st  Semester)(Section C)(Batch Advisor Name :Ms. Maryam Faqir  )', 'BSAI Batch -05', 'BSSIT,BSAI', 'CC121', 'Digital Logic Design', 2, 'B,C', NULL, 25, 'Mr. Talal Maqsood', 'KUST ROOM 6', NULL, '3,4', NULL, NULL, NULL, NULL, NULL),
  ('BSAI Batch 005 (1st  Semester)(Section C)(Batch Advisor Name :Ms. Maryam Faqir  )', 'BSAI Batch -05', NULL, 'CC121L', 'Digital Logic Design Lab', 1, 'C', NULL, 25, 'Mr. Talal Maqsood', 'LAB', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSAI Batch 005 (1st  Semester)(Section C)(Batch Advisor Name :Ms. Maryam Faqir  )', 'BSAI Batch -05', NULL, 'MK210', 'Principles of Marketing', 3, 'C', NULL, 25, 'TBA', 'KUST ROOM 8', NULL, NULL, NULL, '1,2', NULL, NULL, NULL),
  ('BSAI Batch 005 (1st  Semester)(Section C)(Batch Advisor Name :Ms. Maryam Faqir  )', 'BSAI Batch -05', 'BSIT,BSAI(A+B+C)', 'MA050', 'Algebra and Trigonometry', 3, 'A,B, C', NULL, 'TBA', 'Ms. Mariyah Aslam', 'KUSC ROOM 4', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('ADP (CS) Batch 6(4th Semester) (Batch Advisor Name : Mr. Mustahsan Hammad Naqvi)', 'ADP (CS) Batch -6', NULL, 'CS- 322', 'Data Structures and Algorithms', 3, 'A', 6, 13, 'Muhammad Junaid', 'ROOM 40', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('ADP (CS) Batch 6(4th Semester) (Batch Advisor Name : Mr. Mustahsan Hammad Naqvi)', 'ADP (CS) Batch -6', NULL, 'CS- 380', 'Introduction to Software Engineering', 3, 'A', 6, 13, 'TBA', 'KUST ROOM 7', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('ADP (CS) Batch 6(4th Semester) (Batch Advisor Name : Mr. Mustahsan Hammad Naqvi)', 'ADP (CS) Batch -6', NULL, 'CS- 393', 'Web Design and Development', 3, 'A', 6, 13, 'TBA', 'KUST ROOM 7', '3,4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('ADP (CS) Batch 6(4th Semester) (Batch Advisor Name : Mr. Mustahsan Hammad Naqvi)', 'ADP (CS) Batch -6', NULL, 'CS- 361', 'Introduction to Operating Systems', 3, 'A', 6, 13, 'TBA', 'ROOM 40', NULL, NULL, '2,3', NULL, NULL, NULL, NULL),
  ('ADP (CS) Batch 6(4th Semester) (Batch Advisor Name : Mr. Mustahsan Hammad Naqvi)', 'ADP (CS) Batch -6', NULL, 'CS- 400', 'Final Project', 3, 'A', 6, 13, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ADP (CS) Batch 7(5th Semester) (Batch Advisor Name : Mr. Mustahsan Hammad Naqvi)', 'ADP (CS) Batch -7', NULL, 'IS- 228', 'Introduction to Computer Systems', 3, 'A', 7, 'TBA', 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ADP (CS) Batch 7(5th Semester) (Batch Advisor Name : Mr. Mustahsan Hammad Naqvi)', 'ADP (CS) Batch -7', 'ADPCS,BSBT', 'EN- 114', 'English Grammar and Composition I', 3, 'A', 7, 'TBA', 'Ms.Hina Sadia', 'KUSC ROOM 2', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('ADP (CS) Batch 7(5th Semester) (Batch Advisor Name : Mr. Mustahsan Hammad Naqvi)', 'ADP (CS) Batch -7', 'BSBT,ADPCS,BSBT', 'MA- 100', 'Calculus I', 3, 'A', 7, 'TBA', 'Dr. Shahzad Ahmad', 'KUSC ROOM 1', NULL, NULL, '2,3', NULL, NULL, NULL, NULL),
  ('ADP (CS) Batch 7(5th Semester) (Batch Advisor Name : Mr. Mustahsan Hammad Naqvi)', 'ADP (CS) Batch -7', NULL, 'AC- 104', 'Accounting Principles', 3, 'A', 7, 'TBA', 'TBA', 'KUST ROOM 5', NULL, NULL, NULL, NULL, NULL, '1,2', NULL),
  ('ADP (CS) Batch 7(5th Semester) (Batch Advisor Name : Mr. Mustahsan Hammad Naqvi)', 'ADP (CS) Batch -7', NULL, 'CS- 212', 'Introduction to Logic', 3, 'A', 7, 'TBA', 'TBA', 'KUST ROOM 5', NULL, NULL, NULL, NULL, NULL, '3,4', NULL),
  ('ADP (CS) Batch 7(5th Semester) (Batch Advisor Name : Mr. Mustahsan Hammad Naqvi)', 'ADP (CS) Batch -7', NULL, 'SC- 222', 'Islamic Studies', 3, 'A', 7, 'TBA', 'TBA', 'KUSC ROOM 1', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('MSCS Batch 007 (4th Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -07', 'MSCS', 'CS5165', 'Natural Language Processing', 3, 'A', 7.8, 25, 'Dr. Wasim', 'KUST ROOM 1', NULL, NULL, NULL, NULL, NULL, '2,3', NULL),
  ('MSCS Batch 007 (4th Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -07', NULL, 'CS5131', 'Digital Image Processing', 3, 'A', 7, 25, 'Dr. Naila', 'AI LAB', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('MSCS Batch 008 (3rd Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -08', NULL, 'CS699', 'Thesis', 6, 'A', NULL, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('MSCS Batch 008 (3rd Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -08', 'MSCS', 'CS5165', 'Natural Language Processing', 3, 'A', NULL, 7, 'Dr. Wasim', 'KUST ROOM 1', NULL, NULL, NULL, NULL, NULL, '2,3', NULL),
  ('MSCS Batch 008 (3rd Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -08', NULL, 'CS5162', 'Data Mining', 3, 'A', NULL, 7, 'Dr. Umair Muneer', 'KUST ROOM 1', NULL, NULL, NULL, NULL, NULL, '4,5', NULL),
  ('MSCS Batch 009 (2nd  Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -09', 'MSCS', 'CS5033', 'Machine Learning', 3, 'A', '9,10', 22, 'Dr. Akbar', 'AI LAB', NULL, NULL, NULL, NULL, '3;4', NULL, NULL),
  ('MSCS Batch 009 (2nd  Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -09', 'MSCS', 'CS5091', 'Advanced Operating Systems', 3, 'A', '9,10', 22, 'Dr. Imtiaz', 'AI LAB', NULL, NULL, NULL, NULL, '5,6', NULL, NULL),
  ('MSCS Batch 009 (2nd  Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -09', 'MSCS', 'CS6052', 'Advanced Computer Architecture', 3, 'A', '9,10', 22, 'Dr. Imtiaz', 'KUST ROOM 4', NULL, NULL, NULL, NULL, NULL, '4,5', NULL),
  ('MSCS Batch 009 (2nd  Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -09', NULL, 'ITC722', 'Understanding of Quran II', 1, 'A', NULL, 22, 'TBA', 'ROOM 84', NULL, NULL, NULL, NULL, NULL, '1.2', NULL),
  ('MSCS Batch -10 1st  Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -10', 'MSCS', 'CS5033', 'Machine Learning', 3, NULL, '9,10', NULL, 'Dr. Akbar', 'AI LAB', NULL, NULL, NULL, NULL, '3;4', NULL, NULL),
  ('MSCS Batch -10 1st  Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -10', 'MSCS', 'CS5091', 'Advanced Operating Systems', 3, NULL, '9,10', NULL, 'Dr. Imtiaz', 'AI LAB', NULL, NULL, NULL, NULL, '5,6', NULL, NULL),
  ('MSCS Batch -10 1st  Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -10', 'MSCS', 'CS6052', 'Advanced Computer Architecture', 3, NULL, '9,10', NULL, 'Dr. Imtiaz', 'KUST ROOM 4', NULL, NULL, NULL, NULL, NULL, '4,5', NULL),
  ('MSCS Batch -10 1st  Semester Batch Advisor Ms.Hina Tufail)', 'MSCS Batch -10', NULL, 'ITC711', 'Understanding of Quran I', 1, NULL, NULL, NULL, NULL, 'ROOM 84', NULL, NULL, NULL, NULL, NULL, '1.2', NULL),
  ('MSDS Batch -1 (1st  Semester Batch Advisor Ms.Hina Tufail)', 'MSDS', NULL, 'DS5161', 'Tools and Techniques in Data Science', '2+1', 'A', NULL, NULL, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('MSDS Batch -1 (1st  Semester Batch Advisor Ms.Hina Tufail)', 'MSDS', NULL, 'DS6169', 'Statistical and Mathematical Methods for Data Analysis', 3, 'A', NULL, NULL, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('MSDS Batch -1 (1st  Semester Batch Advisor Ms.Hina Tufail)', 'MSDS', NULL, 'DS5104', 'Research Methods', 3, 'A', NULL, NULL, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('MSDS Batch -1 (1st  Semester Batch Advisor Ms.Hina Tufail)', 'MSDS', NULL, 'ITC711', 'Understanding of Quran I', 1, 'A', NULL, NULL, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSBT Batch 14(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -14', 'BSBC/BSBT', 'BT-401', 'Food Biotechnology', 4, 'A', '7,14,15', '39,9', 'Miss Ruba Shahid', 'KUSC ROOM 1', NULL, NULL, '4', '5', NULL, NULL, NULL),
  ('BSBT Batch 14(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -14', 'BSBC/BSBT', 'BT-402', 'Agricultural Biotechnology', 4, 'A', '7,14,16', '39,9', 'Dr Muhammad Shafiq', 'KUSC ROOM 2', '2', '2', NULL, NULL, NULL, NULL, NULL),
  ('BSBT Batch 14(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -14', 'BSBC/BSBT', 'BT-415', 'Seminar in Biotechnology', 1, 'A', '7,14,17', '39,9', 'Dr Sajed Ali', 'KUST ROOM 1', NULL, NULL, '1', NULL, NULL, NULL, NULL),
  ('BSBT Batch 14(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -14', 'BSBC/BSBT', 'BT-405', 'Vitamins and Minerals', 3, 'A', '7,14,18', '39,9', 'Miss Falak Sajjad', 'KUSC ROOM 1', '3', '1', NULL, NULL, NULL, NULL, NULL),
  ('BSBT Batch 14(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -14', 'BSBC/BSBT', 'BT-406', 'Basic Pharmacology', 3, 'A', '7,14,19', '39,9', 'Muhammad Usama Munir', 'KUSC ROOM 3', NULL, '4', NULL, '4', NULL, NULL, NULL),
  ('BSBT Batch 14(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -14', 'BSBC/BSBT', 'BT-437', 'Senior Project - II', 3, 'A', '7,14,20', '39,9', 'Muhammad Usama Munir', 'KUSC ROOM 2', NULL, NULL, '2', '3', NULL, NULL, NULL),
  ('BSBT Batch 15(Batch Advisor Name : Dr Muhammad Shafiq)', 'BSBT Batch -15', 'BSBC/BSBT', 'BT-401', 'Food Biotechnology', 4, 'A', '7,14,15', '39,9', 'Miss Ruba Shahid', 'KUSC ROOM 1', NULL, NULL, '4', '5', NULL, NULL, NULL),
  ('BSBT Batch 15(Batch Advisor Name : Dr Muhammad Shafiq)', 'BSBT Batch -15', 'BSBC/BSBT', 'BT-402', 'Agricultural Biotechnology', 4, 'A', '7,14,16', '39,9', 'Dr Muhammad Shafiq', 'KUSC ROOM 2', '2', '2', NULL, NULL, NULL, NULL, NULL),
  ('BSBT Batch 15(Batch Advisor Name : Dr Muhammad Shafiq)', 'BSBT Batch -15', 'BSBC/BSBT', 'BT-415', 'Seminar in Biotechnology', 1, 'A', '7,14,17', '39,9', 'Dr Sajed Ali', 'KUST ROOM 1', NULL, NULL, '1', NULL, NULL, NULL, NULL),
  ('BSBT Batch 15(Batch Advisor Name : Dr Muhammad Shafiq)', 'BSBT Batch -15', 'BSBC/BSBT', 'BT-405', 'Vitamins and Minerals', 3, 'A', '7,14,18', '39,9', 'Miss Falak Sajjad', 'KUSC ROOM 1', '3', '1', NULL, NULL, NULL, NULL, NULL),
  ('BSBT Batch 15(Batch Advisor Name : Dr Muhammad Shafiq)', 'BSBT Batch -15', 'BSBC/BSBT', 'BT-406', 'Basic Pharmacology', 3, 'A', '7,14,19', '39,9', 'Muhammad Usama Munir', 'KUSC ROOM 3', NULL, '4', NULL, '4', NULL, NULL, NULL),
  ('BSBT Batch 15(Batch Advisor Name : Dr Muhammad Shafiq)', 'BSBT Batch -15', 'BSBC/BSBT', 'BT-437', 'Senior Project - II', 3, NULL, '7,14,20', '39,9', 'Muhammad Usama Munir', 'KUSC ROOM 2', NULL, NULL, '2', '3', NULL, NULL, NULL),
  ('BSBT Batch 16(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -16', 'BSBC/BSBT', 'BT-301', 'Human Physiology', 3, 'A', '16,17, 8', '31,9', 'Muhammad Usama Munir', 'ROOM 84', NULL, NULL, NULL, NULL, '2,3', NULL, NULL),
  ('BSBT Batch 16(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -16', 'BSBC/BSBT', 'BT-302', 'Fundamentals of Forensic Science', 3, 'A', '16,17, 9', '31,9', 'Dr Sajed Ali', 'ROOM 84', NULL, NULL, '3', '2', NULL, NULL, NULL),
  ('BSBT Batch 16(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -16', 'BSBC/BSBT', 'CH-203', 'Principles of Chemistry - III', 3, 'A', '16,17, 10', '31,9', 'TBA', 'ROOM 84', NULL, '2', '2', NULL, NULL, NULL, NULL),
  ('BSBT Batch 16(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -16', 'BSBC/BSBT', 'BT-404', 'Industrial Biotechnology', 3, 'A', '16,17, 11', '31,9', 'Mr.Hasnat Mueen', 'ROOM 84', NULL, NULL, NULL, '3', '1', NULL, NULL),
  ('BSBT Batch 16(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -16', 'BSBC/BSBT', 'BT-304', 'Immunology', 3, 'A', '16,17, 12', '31,9', 'Miss Ruba Shahid', 'ROOM 84', NULL, '4', NULL, '4', NULL, NULL, NULL),
  ('BSBT Batch 16(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -16', 'BSBC/BSBT', 'SD-102', '21st Century Skills', 0, 'A', '16,17, 13', '31,9', 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSBT Batch 16(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -16', 'BSBC/BSBT', 'BT-306', 'Enzymology', 4, 'A', '16,17, 14', '31,9', 'Mr.Hasnat Mueen', 'ROOM 84', NULL, '5', '1', NULL, NULL, NULL, NULL),
  ('BSBT Batch 17(Batch Advisor Name : Miss Falak Sajjad)', 'BSBT Batch -17', 'BSBC/BSBT', 'BT-301', 'Human Physiology', 3, 'A', '16,17, 8', '31,9', 'Muhammad Usama Munir', 'ROOM 84', NULL, NULL, NULL, NULL, '2,3', NULL, NULL),
  ('BSBT Batch 17(Batch Advisor Name : Miss Falak Sajjad)', 'BSBT Batch -17', 'BSBC/BSBT', 'BT-302', 'Fundamentals of Forensic Science', 3, 'A', '16,17, 9', '31,9', 'Dr Sajed Ali', 'ROOM 84', NULL, NULL, '3', '2', NULL, NULL, NULL),
  ('BSBT Batch 17(Batch Advisor Name : Miss Falak Sajjad)', 'BSBT Batch -17', 'BSBC/BSBT', 'CH-203', 'Principles of Chemistry - III', 3, 'A', '16,17, 10', '31,9', 'TBA', 'ROOM 84', NULL, '2', '2', NULL, NULL, NULL, NULL),
  ('BSBT Batch 17(Batch Advisor Name : Miss Falak Sajjad)', 'BSBT Batch -17', 'BSBC/BSBT', 'BT-404', 'Industrial Biotechnology', 3, 'A', '16,17, 11', '31,9', 'Mr.Hasnat Mueen', 'ROOM 84', NULL, NULL, NULL, '3', '1', NULL, NULL),
  ('BSBT Batch 17(Batch Advisor Name : Miss Falak Sajjad)', 'BSBT Batch -17', 'BSBC/BSBT', 'BT-304', 'Immunology', 3, 'A', '16,17, 12', '31,9', 'Miss Ruba Shahid', 'ROOM 84', NULL, '4', NULL, '4', NULL, NULL, NULL),
  ('BSBT Batch 17(Batch Advisor Name : Miss Falak Sajjad)', 'BSBT Batch -17', 'BSBC/BSBT', 'SD-102', '21st Century Skills', 0, 'A', '16,17, 13', '31,9', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSBT Batch 17(Batch Advisor Name : Miss Falak Sajjad)', 'BSBT Batch -17', 'BSBC/BSBT', 'BT-306', 'Enzymology', 4, NULL, '16,17, 14', '31,9', 'Mr.Hasnat Mueen', 'ROOM 84', NULL, '5', '1', NULL, NULL, NULL, NULL),
  ('BSBT Batch 18(Batch Advisor Name : Dr Muhammad Shafiq)', 'BSBT Batch -18', 'BSBT,BSBC', 'PH-106', 'Medical Physics', 3, 'A', NULL, '25,9', 'Dr Azeem Mir', 'Modern Physics LAB', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('BSBT Batch 18(Batch Advisor Name : Dr Muhammad Shafiq)', 'BSBT Batch -18', 'BSBT,BSBC', 'BT-213', 'Microbiology', 4, 'A', NULL, '25,9', 'Dr Muhammad Shafiq', 'ROOM 84', '1', '1', NULL, NULL, NULL, NULL, NULL),
  ('BSBT Batch 18(Batch Advisor Name : Dr Muhammad Shafiq)', 'BSBT Batch -18', NULL, 'ISL-112', 'Islamic Thoughts & Perspectives', 3, 'A', NULL, '25,9', 'TBA', 'KUSC ROOM 1', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BSBT Batch 18(Batch Advisor Name : Dr Muhammad Shafiq)', 'BSBT Batch -18', 'BSBT,BSBC', 'CH-102', 'Principles of Chemistry -II', 4, 'A', NULL, '25,9', 'TBA', 'KUSC ROOM 2', '3', NULL, NULL, NULL, '5', NULL, NULL),
  ('BSBT Batch 18(Batch Advisor Name : Dr Muhammad Shafiq)', 'BSBT Batch -18', 'BSBT,BSBC', 'BT-301', 'Biochemistry - I', 4, 'A', NULL, '25,9', 'Miss Ruba Shahid', 'KUSC ROOM 3', NULL, '2', '2', NULL, NULL, NULL, NULL),
  ('BSBT Batch-19(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -19', 'BSBT,BSBC', 'PH-106', 'Medical Physics', 3, 'A', NULL, '25,9', 'Dr Azeem Mir', 'Modern Physics LAB', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('BSBT Batch-19(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -19', 'BSBT,BSBC', 'BT-213', 'Microbiology', 4, 'A', NULL, '25,9', 'Dr Muhammad Shafiq', 'ROOM 84', '1', '1', NULL, NULL, NULL, NULL, NULL),
  ('BSBT Batch-19(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -19', NULL, 'ISL-112', 'Islamic Thoughts & Perspectives', 3, 'A', NULL, '25,9', 'TBA', 'KUSC ROOM 1', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BSBT Batch-19(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -19', 'BSBT,BSBC', 'CH-102', 'Principles of Chemistry -II', 4, 'A', NULL, '25,9', 'TBA', 'KUSC ROOM 2', '3', NULL, NULL, NULL, '5', NULL, NULL),
  ('BSBT Batch-19(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -19', 'BSBT,BSBC', 'BT-301', 'Biochemistry - I', 4, 'A', NULL, '25,9', 'Miss Ruba Shahid', 'KUSC ROOM 3', NULL, '2', '2', NULL, NULL, NULL, NULL),
  ('BSBT Batch-20(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -20', 'ADPCS,BSBT,BRIS', 'EN-110', 'English-I', 3, 'A', NULL, 20, 'Ms.Hina Sadia', 'KUSC ROOM 2', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSBT Batch-20(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -20', 'BSBT,ADPCS,BSBT', 'MA-101', 'Calculus', 3, 'A', NULL, 20, 'Dr. Shahzad Ahmad', 'KUSC ROOM 1', NULL, NULL, '2,3', NULL, NULL, NULL, NULL),
  ('BSBT Batch-20(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -20', 'BSBC/BSMA/BSCH/BSPH', 'IS-135', 'Computer Applications', 3, 'A', NULL, 20, 'TBA', 'KUST ROOM 9', NULL, NULL, '4', NULL, '5', NULL, NULL),
  ('BSBT Batch-20(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -20', 'BSBC/BSMA/BSCH/BSPH', 'BT-101', 'Cell Biology', 3, 'A', NULL, 20, 'Mr.Hasnat Mueen', 'KUST ROOM 9', NULL, '3,4', NULL, NULL, NULL, NULL, NULL),
  ('BSBT Batch-20(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -20', NULL, 'BT-102', 'Everyday Science', 3, 'A', NULL, 20, 'Miss Falak Sajjad', 'KUST ROOM 9', NULL, '2', NULL, '2', NULL, NULL, NULL),
  ('BSBT Batch-20(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -20', 'BSBC/BSMA/BSCH/BSPH', 'SC-165', 'Introduction to Psychology', 3, 'A', NULL, 20, 'Dr Sajed Ali', 'KUSC ROOM 4', NULL, NULL, NULL, '4,5', NULL, NULL, NULL),
  ('BSBT Batch-20(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -20', NULL, 'CH-101', 'Principles of Chemistry -I', 3, 'A', NULL, 20, 'Bio LAB', NULL, '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSBT Batch-21(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -21', 'ADPCS,BSBT,BRIS', 'EN-110', 'English-I', 3, 'A', NULL, NULL, 'Ms.Hina Sadia', 'KUSC ROOM 2', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSBT Batch-21(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -21', 'BSBT,ADPCS,BSBT', 'MA-101', 'Calculus', 3, 'A', NULL, NULL, 'Dr. Shahzad Ahmad', 'KUSC ROOM 1', NULL, NULL, '2,3', NULL, NULL, NULL, NULL),
  ('BSBT Batch-21(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -21', 'BSBC/BSMA/BSCH/BSPH', 'IS-135', 'Computer Applications', 3, 'A', NULL, NULL, 'TBA', 'KUST ROOM 9', NULL, NULL, '4', NULL, '5', NULL, NULL),
  ('BSBT Batch-21(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -21', 'BSBC/BSMA/BSCH/BSPH', 'BT-101', 'Cell Biology', 3, 'A', NULL, NULL, 'Mr.Hasnat Mueen', 'KUST ROOM 9', NULL, '3,4', NULL, NULL, NULL, NULL, NULL),
  ('BSBT Batch-21(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -21', 'BSBC/BSMA/BSCH/BSPH', 'BT-102', 'Everyday Science', 3, 'A', NULL, NULL, 'Miss Falak Sajjad', 'KUST ROOM 9', NULL, '2', NULL, '2', NULL, NULL, NULL),
  ('BSBT Batch-21(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -21', 'BSBC/BSMA/BSCH/BSPH', 'SC-165', 'Introduction to Psychology', 3, 'A', NULL, NULL, 'Dr Sajed Ali', 'KUSC ROOM 4', NULL, NULL, NULL, '4,5', NULL, NULL, NULL),
  ('BSBT Batch-21(Batch Advisor Name : Dr Sajed Ali)', 'BSBT Batch -21', 'BSBC/BSMA/BSCH/BSPH', 'CH-101', 'Principles of Chemistry -I', 3, 'A', NULL, NULL, 'Bio LAB', NULL, '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('MS BT Batch 007 (Batch Advisor Name : Dr Mudassar Fareed Awan)', 'MS BT Batch -07', 'BSBT', 'BT-612', 'Principles of Forensic Science', 3, 'A', NULL, NULL, 'Dr Sajed Ali', 'KUST ROOM 1', NULL, NULL, NULL, NULL, '2:30-5:30', NULL, NULL),
  ('MS BT Batch 007 (Batch Advisor Name : Dr Mudassar Fareed Awan)', 'MS BT Batch -07', NULL, 'BT-678', 'Advances in Industrial Biotechnology', 3, 'A', NULL, NULL, 'Miss Falak Sajjad', 'KUST ROOM 4', NULL, NULL, NULL, NULL, NULL, NULL, '1,2'),
  ('MS BT Batch 008(Batch Advisor Name : Dr Sajed Ali)', 'MS BT Batch -08', 'BSBT', 'BT-612', 'Principles of Forensic Science', 3, 'A', NULL, NULL, 'Dr Sajed Ali', 'KUST ROOM 1', NULL, NULL, NULL, NULL, '2:30-5:30', NULL, NULL),
  ('MS BT Batch 008(Batch Advisor Name : Dr Sajed Ali)', 'MS BT Batch -08', NULL, 'BT-678', 'Advances in Industrial Biotechnology', 3, 'A', NULL, NULL, 'Miss Falak Sajjad', 'KUST ROOM 4', NULL, NULL, NULL, NULL, NULL, NULL, '1,2'),
  ('MS BT Batch 009(Batch Advisor Name : Dr Sajed Ali) (Ist Semester)', 'MS BT Batch -09', NULL, 'BT-502', 'Recombinant DNA Technology', 3, 'A', NULL, NULL, 'Dr Muhammad Shafiq', 'KUST ROOM 4', NULL, NULL, NULL, NULL, NULL, NULL, '3,4'),
  ('MS BT Batch 009(Batch Advisor Name : Dr Sajed Ali) (Ist Semester)', 'MS BT Batch -09', 'BSBT', 'BT-612', 'Principles of Forensic Science', 3, 'A', NULL, NULL, 'Dr Sajed Ali', 'KUST ROOM 1', NULL, NULL, NULL, NULL, '2:30-5:30', NULL, NULL),
  ('MS BT Batch 009(Batch Advisor Name : Dr Sajed Ali) (Ist Semester)', 'MS BT Batch -09', NULL, 'BT-678', 'Advances in Industrial Biotechnology', 3, 'A', NULL, NULL, 'Miss Falak Sajjad', 'KUST ROOM 4', NULL, NULL, NULL, NULL, NULL, NULL, '1,2'),
  ('MS BT Batch 009(Batch Advisor Name : Dr Sajed Ali)', 'MS BT Batch -09', NULL, 'BT-502', 'Recombinant DNA Technology', 3, 'A', NULL, NULL, 'Dr Muhammad Shafiq', 'KUST ROOM 4', NULL, NULL, NULL, NULL, NULL, NULL, '3,4'),
  ('MS BT Batch 009(Batch Advisor Name : Dr Sajed Ali)', 'MS BT Batch -09', 'BSBT', 'BT-612', 'Principles of Forensic Science', 3, 'A', NULL, NULL, 'Dr Sajed Ali', 'KUST ROOM 1', NULL, NULL, NULL, NULL, '2:30-5:30', NULL, NULL),
  ('MS BT Batch 009(Batch Advisor Name : Dr Sajed Ali)', 'MS BT Batch -09', NULL, 'BT-678', 'Advances in Industrial Biotechnology', 3, 'A', NULL, NULL, 'Miss Falak Sajjad', 'KUST ROOM 4', NULL, NULL, NULL, NULL, NULL, NULL, '1,2'),
  ('BSBC Batch 07(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-07', 'BSBC/BSBT', 'BC-401', 'Nutritional Biochemistry', 4, 'A', '7,14,15', '39,9', 'Miss Ruba Shahid', 'KUSC ROOM 1', NULL, NULL, '4', '5', NULL, NULL, NULL),
  ('BSBC Batch 07(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-07', 'BSBC/BSBT', 'BC-402', 'Plant Biochemistry', 3, 'A', NULL, 9, 'Dr Muhammad Shafiq', 'KUSC ROOM 2', '2', '2', NULL, NULL, NULL, NULL, NULL),
  ('BSBC Batch 07(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-07', 'BSBC/BSBT', 'BC-415', 'Seminar in Biochemistry', 1, 'A', '7,14,17', 9, 'Dr Sajed Ali', 'KUST ROOM 1', NULL, NULL, '1', NULL, NULL, NULL, NULL),
  ('BSBC Batch 07(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-07', 'BSBC/BSBT', 'BC-405', 'Vitamins and Minerals', 3, 'A', '7,14,18', '39,9', 'Miss Falak Sajjad', 'KUSC ROOM 1', '3', '1', NULL, NULL, NULL, NULL, NULL),
  ('BSBC Batch 07(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-07', 'BSBC/BSBT', 'BC-406', 'Basic Pharmacology', 3, 'A', NULL, 9, 'Muhammad Usama Munir', 'KUSC ROOM 3', NULL, '4', NULL, '4', NULL, NULL, NULL),
  ('BSBC Batch 07(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-07', 'BSBC/BSBT', 'BT-437', 'Senior Project - I', 3, NULL, '7,14,20', '39,9', 'Muhammad Usama Munir', 'KUSC ROOM 2', NULL, NULL, '2', '3', NULL, NULL, NULL),
  ('BSBC Batch 8(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-08', 'BSBC/BSBT', 'BC-301', 'Human Physiology', 3, 'A', '16,17, 8', '31,9', 'Muhammad Usama Munir', 'ROOM 84', NULL, NULL, NULL, NULL, '2,3', NULL, NULL),
  ('BSBC Batch 8(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-08', 'BSBC/BSBT', 'BC-302', 'Fundamentals of Forensic Science', 3, NULL, NULL, NULL, 'Dr Sajed Ali', 'ROOM 84', NULL, NULL, '3', '2', NULL, NULL, NULL),
  ('BSBC Batch 8(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-08', 'BSBC/BSBT', 'BC-404', 'Industrial Biotechnology', 3, NULL, '16,17, 11', '31,9', 'Mr.Hasnat Mueen', 'ROOM 84', NULL, NULL, NULL, '3', '1', NULL, NULL),
  ('BSBC Batch 8(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-08', 'BSBC/BSBT', 'BC-304', 'Immunology', 3, NULL, '16,17, 12', '31,9', 'Miss Ruba Shahid', 'ROOM 84', NULL, '4', NULL, '4', NULL, NULL, NULL),
  ('BSBC Batch 8(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-08', NULL, 'SD-102', '21st Century Skills', 0, NULL, NULL, NULL, 'Miss Ruba Shahid', 'BIO LAB', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSBC Batch 8(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-08', 'BSBC/BSBT', 'BC-306', 'Enzymology', 3, NULL, NULL, NULL, 'Mr.Hasnat Mueen', 'ROOM 84', NULL, '5', '1', NULL, NULL, NULL, NULL),
  ('BSBC Batch 8(Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-08', 'BSBC/BSMA/BSCH/BSPH', 'SC-165', 'Introduction to Psychology', 3, NULL, NULL, NULL, 'Dr Sajed Ali', 'KUSC ROOM 4', NULL, NULL, NULL, '4,5', NULL, NULL, NULL),
  ('BSBC Batch 9 (Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-09', 'BSBT,BSBC', 'PH-106', 'Medical Physics', 3, 'A', NULL, NULL, 'Dr Azeem Mir', 'Modern Physics LAB', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('BSBC Batch 9 (Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-09', 'BSBT,BSBC', 'BC-213', 'Microbiology', 4, 'A', NULL, NULL, 'Dr Muhammad Shafiq', 'ROOM 84', '1', '1', NULL, NULL, NULL, NULL, NULL),
  ('BSBC Batch 9 (Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-09', NULL, 'ISL-112', 'Islamic Thoughts & Perspectives', 3, 'A', NULL, '25,9', 'TBA', 'KUSC ROOM 1', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BSBC Batch 9 (Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-09', 'BSBT,BSBC', 'CH-102', 'Principles of Chemistry -II', 4, 'A', NULL, '25,9', 'TBA', 'KUSC ROOM 2', '3', NULL, NULL, NULL, '5', NULL, NULL),
  ('BSBC Batch 9 (Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-09', 'BSBT,BSBC', 'CH-203', 'Principles of Chemistry -III', 3, 'A', NULL, '25,9', 'TBA', 'KUSC ROOM 2', '3', NULL, NULL, NULL, '5', NULL, NULL),
  ('BSBC Batch 9 (Batch Advisor Name : Dr. Sajed Ali)', 'BSBC  Batch-09', 'BSBT,BSBC', 'BC-211', 'Amino Acids, Proteins and Nucleic Acids', 4, 'A', NULL, NULL, 'Miss Ruba Shahid', 'KUSC ROOM 3', NULL, '2', '2', NULL, NULL, NULL, NULL),
  ('BSPH Batch 8', 'BSPH Batch -8', 'BSPH', 'PH312', 'Mathematical Methods of Physics II', 3, 'A', '8,9,11', NULL, 'Dr Azeem Mir', 'Modern Physics LAB', '2,3', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSPH Batch 8', 'BSPH Batch -8', 'BSPH', 'PH313', 'Quantum Mechanics II', 3, 'A', '8,9,11', NULL, 'Ms Tayyaba', 'Modern Physics LAB', '1', '1', NULL, NULL, NULL, NULL, NULL),
  ('BSPH Batch 8', 'BSPH Batch -8', 'BSPH', 'PH421', 'Solid State Physics', 3, 'A', '8,9,11', NULL, 'Dr Ali Abdullah', 'Modern Physics LAB', NULL, '2', '2', NULL, NULL, NULL, NULL),
  ('BSPH Batch 8', 'BSPH Batch -8', 'BSPH', 'PH431', 'Renewable Energy Resources', 3, 'A', '8,9,11', NULL, 'Dr Ali Abdullah', 'Modern Physics LAB', NULL, '3', '3', NULL, NULL, NULL, NULL),
  ('BSPH Batch 8', 'BSPH Batch -8', 'BSPH', 'SS171', 'Pakistan Studies', 2, 'A', '8,9,11', NULL, 'TBA', 'KUSC ROOM 4', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('BSPH Batch 9', 'BSPH Batch -9', 'BSPH', 'PH312', 'Mathematical Methods of Physics II', 3, 'A', '8,9,11', NULL, 'Dr Azeem Mir', 'Modern Physics LAB', '2,3', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSPH Batch 9', 'BSPH Batch -9', 'BSPH', 'PH313', 'Quantum Mechanics II', 3, 'A', '8,9,11', NULL, 'Ms Tayyaba', 'Modern Physics LAB', '1', '1', NULL, NULL, NULL, NULL, NULL),
  ('BSPH Batch 9', 'BSPH Batch -9', 'BSPH', 'PH421', 'Solid State Physics', 3, 'A', '8,9,11', NULL, 'Dr Ali Abdullah', 'Modern Physics LAB', NULL, '2', '2', NULL, NULL, NULL, NULL),
  ('BSPH Batch 9', 'BSPH Batch -9', 'BSPH', 'PH431', 'Renewable Energy Resources', 3, 'A', '8,9,11', NULL, 'Dr Ali Abdullah', 'Modern Physics LAB', NULL, '3', '3', NULL, NULL, NULL, NULL),
  ('BSPH Batch -11', 'BSPH Batch -11', 'BSPH', 'PH312', 'Mathematical Methods of Physics II', 3, 'A', '8,9,11', NULL, 'Dr Azeem Mir', 'Modern Physics LAB', '2,3', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSPH Batch -11', NULL, 'BSPH', 'PH313', 'Quantum Mechanics II', 3, 'A', '8,9,11', NULL, 'Ms Tayyaba', 'Modern Physics LAB', '1', '1', NULL, NULL, NULL, NULL, NULL),
  ('BSPH Batch -11', 'BSPH Batch -11', 'BSPH', 'PH421', 'Solid State Physics', 3, 'A', '8,9,11', NULL, 'Dr Ali Abdullah', 'Modern Physics LAB', NULL, '2', '2', NULL, NULL, NULL, NULL),
  ('BSPH Batch -11', 'BSPH Batch -11', 'BSPH', 'PH431', 'Renewable Energy Resources', 3, 'A', '8,9,11', NULL, 'Dr Ali Abdullah', 'Modern Physics LAB', NULL, '3', '3', NULL, NULL, NULL, NULL),
  ('BSPH Batch -11', 'BSPH Batch -11', NULL, 'CH102', 'Principles of Chemistry II', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSPH Batch -11', NULL, NULL, 'CH102L', 'Principles of Chemistry II Lab', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSPH Batch -11', 'BSPH Batch -11', NULL, 'SD100', 'English Immersion', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('MS PH Batch 8', 'MS PH Batch-8', NULL, 'PH6041', 'Advanced Electrodynamics', 3, NULL, NULL, 14, 'Ms Tayyaba', 'Modern Physics LAB', NULL, NULL, NULL, NULL, NULL, '2:00-5:00', NULL),
  ('MS PH Batch 8', 'MS PH Batch-8', NULL, 'PH7125', 'Nanotechnology', 3, NULL, NULL, 14, 'Dr Ali Abdullah', 'Modern Physics LAB', NULL, NULL, NULL, NULL, NULL, NULL, '9:00-12:00'),
  ('MS PH Batch 8', 'MS PH Batch-8', NULL, 'PH6031', 'Advanced Mathematical Methods for Scientists and Engineers', 3, NULL, NULL, 14, 'Dr Azeem Mir', 'Modern Physics LAB', NULL, NULL, NULL, NULL, NULL, NULL, '12:00-3:00'),
  ('MS PH Batch 8', 'MS PH Batch-8', NULL, 'ITC722', 'Understanding of Quran-II', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('MS PH Batch 9New Intake)', 'MS PH Batch-9', NULL, 'PH741', 'Advanced Electrodynamics', 3, NULL, NULL, NULL, 'Ms Tayyaba', 'Modern Physics LAB', NULL, NULL, NULL, NULL, NULL, '2:00-5:00', NULL),
  ('MS PH Batch 9New Intake)', 'MS PH Batch-9', NULL, 'PH731', 'Advanced Mathematical Physics', 3, NULL, NULL, NULL, 'Dr Ali Abdullah', 'Modern Physics LAB', NULL, NULL, NULL, NULL, NULL, NULL, '9:00-12:00'),
  ('MS PH Batch 9New Intake)', 'MS PH Batch-9', NULL, 'PH726', 'Nanoscience and Nanotechnology', 3, NULL, NULL, NULL, 'Dr Azeem Mir', 'Modern Physics LAB', NULL, NULL, NULL, NULL, NULL, NULL, '12:00-3:00'),
  ('MS PH Batch 9New Intake)', 'MS PH Batch-9', NULL, 'ITC711', 'Understanding of Quran-I', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('MS PH Batch 9New Intake)', 'MS PH Batch-9', NULL, NULL, 'Approval from ACM pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMA Batch 7 (Batch Advisor Name :Mr. Ahsan Ali)', 'BSMA Batch -7', NULL, 'MA-314', 'Real Analysis II', 3, 'A', NULL, NULL, 'Mr. Ahsan Ali', 'ROOM 40', NULL, '3', NULL, NULL, NULL, NULL, NULL),
  ('BSMA Batch 7 (Batch Advisor Name :Mr. Ahsan Ali)', 'BSMA Batch -7', NULL, 'MA-314', 'Real Analysis II', 3, 'A', NULL, NULL, 'Mr. Ahsan Ali', 'KUST ROOM 8', NULL, NULL, '3', NULL, NULL, NULL, NULL),
  ('BSMA Batch 7 (Batch Advisor Name :Mr. Ahsan Ali)', 'BSMA Batch -7', NULL, 'MA-311', 'Differntial Geometry', 3, 'A', NULL, NULL, 'Dr.Adnan Mailk', 'ROOM 40', NULL, NULL, '4', NULL, NULL, NULL, NULL),
  ('BSMA Batch 7 (Batch Advisor Name :Mr. Ahsan Ali)', 'BSMA Batch -7', NULL, 'MA-311', 'Differntial Geometry', 3, 'A', NULL, NULL, 'Dr.Adnan Mailk', 'KUST ROOM 9', NULL, NULL, NULL, '5', NULL, NULL, NULL),
  ('BSMA Batch 7 (Batch Advisor Name :Mr. Ahsan Ali)', 'BSMA Batch -7', NULL, 'MA-426', 'Functional Analysis', 3, 'A', NULL, NULL, 'Dr. Muhammad Asif', 'ROOM 40', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMA Batch 7 (Batch Advisor Name :Mr. Ahsan Ali)', 'BSMA Batch -7', NULL, 'MA-445', 'Topology', 3, 'A', NULL, NULL, 'Dr. M Kashif Shafiq', 'ROOM 40', NULL, NULL, NULL, '3,4', NULL, NULL, NULL),
  ('BSMA Batch 7 (Batch Advisor Name :Mr. Ahsan Ali)', 'BSMA Batch -7', NULL, 'MA-476', 'Fractional Calculus', 0, 'A', NULL, NULL, 'Mr. Ahsan Ali', 'KUST ROOM 9', NULL, '5', '5', NULL, NULL, NULL, NULL),
  ('BSMA Batch 8 (Batch Advisor Name : Ms Mariyah Aslam)', 'BSMA Batch -8', NULL, 'MA-314', 'Real Analysis II', 3, 'A', NULL, NULL, 'Mr. Ahsan Ali', 'ROOM 40', NULL, '3', NULL, NULL, NULL, NULL, NULL),
  ('BSMA Batch 8 (Batch Advisor Name : Ms Mariyah Aslam)', 'BSMA Batch -8', NULL, 'MA-314', 'Real Analysis II', 3, 'A', NULL, NULL, 'Mr. Ahsan Ali', 'KUST ROOM 8', NULL, NULL, '3', NULL, NULL, NULL, NULL),
  ('BSMA Batch 8 (Batch Advisor Name : Ms Mariyah Aslam)', 'BSMA Batch -8', NULL, 'MA-311', 'Differntial Geometry', 3, 'A', NULL, NULL, 'Dr.Adnan Mailk', 'ROOM 40', NULL, NULL, '4', NULL, NULL, NULL, NULL),
  ('BSMA Batch 8 (Batch Advisor Name : Ms Mariyah Aslam)', 'BSMA Batch -8', NULL, 'MA-426', 'Functional Analysis', 3, 'A', NULL, NULL, 'Dr.Adnan Mailk', 'KUST ROOM 9', NULL, NULL, NULL, '5', NULL, NULL, NULL),
  ('BSMA Batch 8 (Batch Advisor Name : Ms Mariyah Aslam)', 'BSMA Batch -8', NULL, 'MA-445', 'Topology', 3, 'A', NULL, NULL, 'Dr. Muhammad Asif', 'ROOM 40', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMA Batch 8 (Batch Advisor Name : Ms Mariyah Aslam)', 'BSMA Batch -8', NULL, NULL, 'Fractional Calculus', 3, 'A', NULL, NULL, 'Dr. M Kashif Shafiq', 'ROOM 40', NULL, NULL, NULL, '3,4', NULL, NULL, NULL),
  ('BSMA Batch 8 (Batch Advisor Name : Ms Mariyah Aslam)', 'BSMA Batch -8', NULL, 'SD101', '21st Century Skills', 0, 'A', NULL, NULL, 'Mr. Ahsan Ali', 'KUST ROOM 9', NULL, '5', '5', NULL, NULL, NULL, NULL),
  ('MS-MA Batch 20(Batch Advisor Name :  Dr. Adnan Malik)												)', 'MS-MA Batch -20', NULL, 'MTH621', 'Advanced Geometry', 3, 'A', NULL, NULL, 'Dr. Adnan Malik', 'KUSC ROOM 3', NULL, NULL, NULL, NULL, NULL, NULL, '1,2'),
  ('MS-MA Batch 20(Batch Advisor Name :  Dr. Adnan Malik)												)', 'MS-MA Batch -20', NULL, 'MTH729', 'Analysis of Ordinary Differential Equations', 3, 'A', NULL, NULL, 'Dr. M Nazim Tufail', 'KUSC ROOM 3', NULL, NULL, NULL, NULL, NULL, NULL, '3,4'),
  ('MS-MA Batch 20(Batch Advisor Name :  Dr. Adnan Malik)												)', 'MS-MA Batch -20', NULL, 'MTH699', 'Thesis', 6, 'A', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('MS-MA Batch 20(Batch Advisor Name : Dr. Muhammad Asif													)', 'MS-MA Batch -21', NULL, 'MTH611', 'Advanced Functional Analysis', 3, 'A', NULL, 8, 'Dr. Muhammad Asif', 'KUST ROOM 1', NULL, NULL, NULL, NULL, NULL, NULL, '1,2'),
  ('MS-MA Batch 20(Batch Advisor Name : Dr. Muhammad Asif													)', 'MS-MA Batch -21', NULL, 'MTH621', 'Advanced Geometry', 3, 'A', NULL, 8, 'Dr. Adnan Malik', 'KUSC ROOM 3', NULL, NULL, NULL, NULL, NULL, NULL, '3,4'),
  ('MS-MA Batch 20(Batch Advisor Name : Dr. Muhammad Asif													)', 'MS-MA Batch -21', NULL, 'MTH699', 'Thesis', 6, 'A', NULL, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('MS-MA Batch 22 (Batch Advisor Name: Dr. M Nazim Tufail)', 'MS-MA Batch -22', NULL, 'MTH605', 'Advanced Abstract Algebra', 3, 'A', NULL, NULL, 'Dr. Shahzad Ahmad', 'KUSC ROOM 1', NULL, NULL, NULL, NULL, NULL, NULL, '1,2'),
  ('MS-MA Batch 22 (Batch Advisor Name: Dr. M Nazim Tufail)', 'MS-MA Batch -22', NULL, 'MTH514', 'Graph Theory and Its Applications', 3, 'A', NULL, NULL, 'Dr. M Kashif Shafiq', 'KUST ROOM 4', NULL, NULL, NULL, NULL, '5,6', NULL, NULL),
  ('MS-MA Batch 22 (Batch Advisor Name: Dr. M Nazim Tufail)', 'MS-MA Batch -22', NULL, 'MTH729', 'Analysis of Ordinary Differential Equations', 3, 'A', NULL, NULL, 'Dr. M Nazim Tufail', 'KUSC ROOM 3', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('MS-MA Batch 23 (Batch Advisor Name : Dr. M. Kashif Shafiq)', 'MS-MA Batch -23', NULL, 'MTH611', 'Advanced Functional Analysis', 3, 'A', NULL, NULL, 'Dr. Muhammad Asif', 'KUST ROOM 1', NULL, NULL, NULL, NULL, NULL, NULL, '1,2'),
  ('MS-MA Batch 23 (Batch Advisor Name : Dr. M. Kashif Shafiq)', 'MS-MA Batch -23', NULL, 'MTH514', 'Graph Theory and Its Applications', 3, 'A', NULL, NULL, 'Dr. M Kashif Shafiq', 'KUST ROOM 4', NULL, NULL, NULL, NULL, '5,6', NULL, NULL),
  ('MS-MA Batch 23 (Batch Advisor Name : Dr. M. Kashif Shafiq)', 'MS-MA Batch -23', NULL, 'MTH621', 'Advanced Geometry', 3, 'A', NULL, NULL, 'Dr. Adnan Malik', 'KUSC ROOM 3', NULL, NULL, NULL, NULL, NULL, NULL, '3,4'),
  ('BSEE Batch 9 Batch Advisor Name :  Dr. Aun Haider, Engr. Muhammad Shoaib Saleem', 'BSEE Batch-9', NULL, 'EE-492', 'Senior Design Project – II', 3, 'A', NULL, 7, NULL, 'Instrument Lab', '3,4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSEE Batch 9 Batch Advisor Name :  Dr. Aun Haider, Engr. Muhammad Shoaib Saleem', 'BSEE Batch-9', NULL, 'MS-323', 'Engineering Management', 3, 'A', NULL, 7, 'Engr. Irfanullah Khan', 'DLD LAB', NULL, '1,2', NULL, NULL, NULL, NULL, NULL),
  ('BSEE Batch 9 Batch Advisor Name :  Dr. Aun Haider, Engr. Muhammad Shoaib Saleem', 'BSEE Batch-9', NULL, 'EE-423', 'Power System Protection', 3, 'A', NULL, 7, 'Dr. Aun Haider', 'Power Sytem Lab', NULL, '4', '3', NULL, NULL, NULL, NULL),
  ('BSEE Batch 9 Batch Advisor Name :  Dr. Aun Haider, Engr. Muhammad Shoaib Saleem', 'BSEE Batch-9', NULL, 'EE-424', 'Electrical Machine Design', 3, 'A', NULL, 7, 'Engr. Muhammad Shoaib Saleem', 'Power Sytem Lab', NULL, NULL, '1,2', NULL, NULL, NULL, NULL),
  ('BSEE Batch 10 (Batch Advisor Name: Engr. Irfanullah khan & Engr. Taha Mujahid )', 'BSEE Batch-10', NULL, 'EE-465        Breadth Core – I                      3', 'Instrumentation and Measurement', 3, 'A', NULL, 10, 'Engr. Zagham Muhio Din', 'Instrument Lab', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSEE Batch 10 (Batch Advisor Name: Engr. Irfanullah khan & Engr. Taha Mujahid )', 'BSEE Batch-10', NULL, 'EE-465L', 'Instrumentation and Measurement Lab', 1, 'A', NULL, 10, 'Engr. Zainab Mubeen Tahir', 'Instrument Lab', NULL, '3,4', NULL, NULL, NULL, NULL, NULL),
  ('BSEE Batch 10 (Batch Advisor Name: Engr. Irfanullah khan & Engr. Taha Mujahid )', 'BSEE Batch-10', NULL, 'EE-322', 'Power Distribution and Transmission', 3, 'A', NULL, 10, 'Dr. Saad Dilshad', 'Power Sytem Lab', '4,5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSEE Batch 10 (Batch Advisor Name: Engr. Irfanullah khan & Engr. Taha Mujahid )', 'BSEE Batch-10', NULL, 'EE-322L', 'Power Distribution and Transmission Lab', 1, 'A', NULL, 10, 'Engr. Abdul Wahab Khurram', 'Power Sytem Lab', NULL, '1,2', NULL, NULL, NULL, NULL, NULL),
  ('BSEE Batch 10 (Batch Advisor Name: Engr. Irfanullah khan & Engr. Taha Mujahid )', 'BSEE Batch-10', NULL, 'EE-328', 'Control Systems', 3, 'A', NULL, 10, 'Dr. Saad Dilshad', 'Signal Lab', NULL, NULL, NULL, '1,2', NULL, NULL, NULL),
  ('BSEE Batch 10 (Batch Advisor Name: Engr. Irfanullah khan & Engr. Taha Mujahid )', 'BSEE Batch-10', NULL, 'EE-328L', 'Control Systems Lab', 1, 'A', NULL, 10, 'Engr. Zagham Muhio Din', 'Signal Lab', NULL, NULL, NULL, '3,4', NULL, NULL, NULL),
  ('BSEE Batch 10 (Batch Advisor Name: Engr. Irfanullah khan & Engr. Taha Mujahid )', 'BSEE Batch-10', NULL, 'MS-323', 'Engineering Management', 3, 'A', NULL, 10, 'Engr. Irfanullah Khan', 'Power Sytem Lab', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('BSEE Batch 10 (Batch Advisor Name: Engr. Irfanullah khan & Engr. Taha Mujahid )', 'BSEE Batch-10', NULL, 'EE-424', 'Electrical Machine Design', 3, 'A', NULL, 10, 'Engr. Muhammad Shoaib Saleem', 'Instrument Lab', NULL, NULL, '1,2', NULL, NULL, NULL, NULL),
  ('BSEE Batch 11 (Batch Advisor Name : Dr.  Saad Dilshad)', 'BSEE Batch-11', NULL, 'MA-210', 'Linear Algebra', 3, 'A', NULL, NULL, NULL, 'ROOM 40', '4,5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSEE Batch 11 (Batch Advisor Name : Dr.  Saad Dilshad)', 'BSEE Batch-11', NULL, 'EN-110', 'Expository Writing', 3, 'A', NULL, NULL, 'Dr. Saad Dilshad', 'circuits Lab', NULL, '1,2', NULL, NULL, NULL, NULL, NULL),
  ('BSEE Batch 11 (Batch Advisor Name : Dr.  Saad Dilshad)', 'BSEE Batch-11', NULL, 'EE-315', 'Signals and Systems', 3, 'A', NULL, NULL, 'Dr. Aun Haider', 'Signal Lab', '2', '5', NULL, NULL, NULL, NULL, NULL),
  ('BSEE Batch 11 (Batch Advisor Name : Dr.  Saad Dilshad)', 'BSEE Batch-11', NULL, 'EE-315L', 'Signals and Systems Lab', 1, 'A', NULL, NULL, 'Engr. Zainab Mubeen Tahir', 'Signal Lab', NULL, NULL, NULL, NULL, '3;4', NULL, NULL),
  ('BSEE Batch 11 (Batch Advisor Name : Dr.  Saad Dilshad)', 'BSEE Batch-11', NULL, 'EE-310', 'Electromagnetics', 3, 'A', NULL, NULL, 'Engr. Bilal Arif', 'circuits Lab', NULL, NULL, '1,2', NULL, NULL, NULL, NULL),
  ('BSEE Batch 11 (Batch Advisor Name : Dr.  Saad Dilshad)', 'BSEE Batch-11', NULL, 'EE-408', 'Artificial Intelligence', 3, 'A', NULL, NULL, 'Engr. Zagham Muhio Din', 'circuits Lab', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('BSEE Batch 11 (Batch Advisor Name : Dr.  Saad Dilshad)', 'BSEE Batch-11', NULL, 'EE-408L', 'Artificial Intelligence Lab', 1, 'A', NULL, NULL, 'Engr. Zainab Mubeen Tahir', 'circuits Lab', NULL, NULL, NULL, '1,2', NULL, NULL, NULL),
  ('Batch - 1 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Bilal Arif and Engr. Zainab Mubeen Tahir )', 'BSRIS Batch -1', NULL, 'MA230', 'Differential Equations', 3, 'A', NULL, NULL, NULL, 'ROOM 40', NULL, '1,2', NULL, NULL, NULL, NULL, NULL),
  ('Batch - 1 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Bilal Arif and Engr. Zainab Mubeen Tahir )', 'BSRIS Batch -1', NULL, 'RI120', 'Robot Kinematics', 3, 'A', NULL, NULL, 'Engr. Bilal Arif', 'circuits Lab', NULL, '3', '2', NULL, NULL, NULL, NULL),
  ('Batch - 1 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Bilal Arif and Engr. Zainab Mubeen Tahir )', 'BSRIS Batch -1', NULL, 'RI110', 'Introduction to Robotics', 3, 'A', NULL, NULL, 'Engr. Zagham Muhio Din', 'Networking lab', NULL, NULL, NULL, '1,2', NULL, NULL, NULL),
  ('Batch - 1 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Bilal Arif and Engr. Zainab Mubeen Tahir )', 'BSRIS Batch -1', NULL, 'RI110L', 'Introduction to Robotics Lab', 1, 'A', NULL, NULL, 'Engr. Abdul Wahab Khurram', 'Exbith Room', NULL, NULL, NULL, '4,5', NULL, NULL, NULL),
  ('Batch - 1 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Bilal Arif and Engr. Zainab Mubeen Tahir )', 'BSRIS Batch -1', NULL, 'CS143', 'Programming Fundamentals', 3, 'A', NULL, NULL, 'Engr. Bilal Arif', 'DLD LAB', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('Batch - 1 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Bilal Arif and Engr. Zainab Mubeen Tahir )', 'BSRIS Batch -1', NULL, 'CS143L', 'Programming Fundamentals Lab', 1, 'A', NULL, NULL, 'Engr. Bilal Arif', 'DLD LAB', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('Batch - 1 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Bilal Arif and Engr. Zainab Mubeen Tahir )', 'BSRIS Batch -1', NULL, 'HM150', 'Islamic Studies/Ethics', 2, 'A', NULL, NULL, 'TBA', 'KUSC ROOM', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 1 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Bilal Arif and Engr. Zainab Mubeen Tahir )', 'BSRIS Batch -1', NULL, 'HM222', 'Pakistan Studies', 2, 'A', NULL, NULL, 'TBA', 'KUSC ROOM 4', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('Batch - 2 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Zagham Muhio Din, Engr. Abdul Wahab Khurram )', 'BSRIS Batch -2', NULL, 'EE125', 'Applications of ICT', 2, 'A', NULL, NULL, 'Engr. Irfanullah Khan', 'Networking lab', NULL, NULL, NULL, '1,2', NULL, NULL, NULL),
  ('Batch - 2 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Zagham Muhio Din, Engr. Abdul Wahab Khurram )', 'BSRIS Batch -2', NULL, 'EE125L', 'Applications of ICT Lab', 1, 'A', NULL, NULL, 'Engr. Irfanullah Khan', 'Signal Lab', NULL, NULL, NULL, '3,4', NULL, NULL, NULL),
  ('Batch - 2 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Zagham Muhio Din, Engr. Abdul Wahab Khurram )', 'BSRIS Batch -2', NULL, 'MA107', 'Calculus and Analytical Geometry', 3, 'A', NULL, NULL, 'TBA', 'KUST ROOM 9', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 2 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Zagham Muhio Din, Engr. Abdul Wahab Khurram )', 'BSRIS Batch -2', 'ADPCS,BSBT,BRIS', 'EN104', 'Functional English', 3, 'A', NULL, NULL, 'Ms.Hina Sadia', 'KUSC ROOM 2', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('Batch - 2 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Zagham Muhio Din, Engr. Abdul Wahab Khurram )', 'BSRIS Batch -2', NULL, 'EE110', 'Circuit Analysis', 3, 'A', NULL, NULL, 'Dr. Saad Dilshad', 'DLD LAB', NULL, NULL, '3,4', NULL, NULL, NULL, NULL),
  ('Batch - 2 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Zagham Muhio Din, Engr. Abdul Wahab Khurram )', 'BSRIS Batch -2', NULL, 'EE110L', 'Circuit Analysis Lab', 1, 'A', NULL, NULL, 'Engr. Abdul Wahab Khurram', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Batch - 2 BS Robotics and Intelligent Systems (Batch Advisor Name : Engr. Zagham Muhio Din, Engr. Abdul Wahab Khurram )', 'BSRIS Batch -2', NULL, 'ME124', 'Engineering Mechanics', 3, 'A', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('MS-EE Batch 6,7,8,9', 'MS-EE Batch 6,7,8,9', NULL, 'EE638', 'Solar Concentrators', 3, 'A', NULL, NULL, 'TBA', NULL, NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('MS-EE Batch 6,7,8,9', 'MS-EE Batch 6,7,8,9', NULL, 'EE526', 'Photovoltaic Energy Systems', 3, 'A', NULL, NULL, 'TBA', NULL, NULL, '4,5', NULL, NULL, NULL, NULL, NULL),
  ('MS-EE Batch 6,7,8,9', 'MS-EE Batch 6,7,8,9', NULL, 'EE609', 'Thesis', 6, NULL, NULL, NULL, 'TBA', NULL, NULL, NULL, NULL, '4,5', NULL, NULL, NULL),
  ('BSME Batch 9(  6th Semester)(Batch Advisor Engr.Abdullah Muneeb Akram)', 'BSME Batch-9', NULL, 'ME 432', 'Power Plants', 2, 'A', NULL, 11, 'Engr. Allah Ditta', 'Fluid Lab', NULL, '1,2', NULL, NULL, NULL, NULL, NULL),
  ('BSME Batch 9(  6th Semester)(Batch Advisor Engr.Abdullah Muneeb Akram)', 'BSME Batch-9', NULL, 'ME 432 L', 'Power Plants Lab', 1, 'A', NULL, 11, 'Engr. Saeed Hassan', 'Power Lab', '3,4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSME Batch 9(  6th Semester)(Batch Advisor Engr.Abdullah Muneeb Akram)', 'BSME Batch-9', NULL, 'MS 403', 'Production Management', 3, 'A', NULL, 11, 'Engr. Waheed Ashraf', 'Drawing Hall', '2', '4', NULL, NULL, NULL, NULL, NULL),
  ('BSME Batch 9(  6th Semester)(Batch Advisor Engr.Abdullah Muneeb Akram)', 'BSME Batch-9', NULL, 'ME 422', 'Finite Element Analysis', 3, 'A', NULL, 11, 'Engr. Bader Munir', 'ROOM 40', NULL, '5', NULL, NULL, NULL, NULL, NULL),
  ('BSME Batch 9(  6th Semester)(Batch Advisor Engr.Abdullah Muneeb Akram)', 'BSME Batch-9', NULL, 'ME 422 L', 'Finite Element Analysis Lab', 1, 'A', NULL, 11, 'Engr. Bader Munir', 'Themal Lab', NULL, NULL, '1,2', NULL, NULL, NULL, NULL),
  ('BSME Batch 9(  6th Semester)(Batch Advisor Engr.Abdullah Muneeb Akram)', 'BSME Batch-9', NULL, 'MS 402', 'Entrepreneurship', 3, 'A', NULL, 11, 'Dr. Sibghat Ullah', 'Drawing Hall', NULL, NULL, '4,5', NULL, NULL, NULL, NULL),
  ('BSME Batch 9(  6th Semester)(Batch Advisor Engr.Abdullah Muneeb Akram)', 'BSME Batch-9', NULL, 'ME 443', 'Health Safety and Environment', 2, 'A', NULL, 11, 'Dr. Shahid Saghir', 'Fluid Lab', NULL, NULL, NULL, '9:00-11:00', NULL, NULL, NULL),
  ('BSME Batch 9(  6th Semester)(Batch Advisor Engr.Abdullah Muneeb Akram)', 'BSME Batch-9', NULL, 'ME 452', 'Project Phase-II', 3, 'A', NULL, 11, 'Miscellaneous', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSME Batch 10( 4rd Semester)(Batch Advisor Dr. Sibghatullah)', 'BSME Batch-10', NULL, 'NS 331', 'Probability and Statistics', 3, 'A', NULL, 11, 'TBA', 'ROOM 40', NULL, NULL, NULL, '1,2', NULL, NULL, NULL),
  ('BSME Batch 10( 4rd Semester)(Batch Advisor Dr. Sibghatullah)', 'BSME Batch-10', NULL, 'ME 332', 'Heat and Mass Transfer', 3, 'A', NULL, 11, 'Engr. Saeed Hassan', 'Computer Lab', NULL, NULL, '3,4', NULL, NULL, NULL, NULL),
  ('BSME Batch 10( 4rd Semester)(Batch Advisor Dr. Sibghatullah)', 'BSME Batch-10', NULL, 'ME 333', 'Refrigeration and Air Conditioning', 3, 'A', NULL, 11, 'Dr. Sibghat Ullah', 'Computer Lab', NULL, NULL, NULL, '4,5', NULL, NULL, NULL),
  ('BSME Batch 10( 4rd Semester)(Batch Advisor Dr. Sibghatullah)', 'BSME Batch-10', NULL, 'ME 333 L', 'Refrigeration and Air Conditioning Lab', 1, 'A', NULL, 11, 'Engr. Saeed Hassan', 'Thermodyanmic lab', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSME Batch 10( 4rd Semester)(Batch Advisor Dr. Sibghatullah)', 'BSME Batch-10', NULL, 'ME 323', 'Mechanics of Materials-II', 3, 'A', NULL, 11, 'Engr. Waheed Ashraf', 'ROOM 50', NULL, '1,2', NULL, NULL, NULL, NULL, NULL),
  ('BSME Batch 10( 4rd Semester)(Batch Advisor Dr. Sibghatullah)', 'BSME Batch-10', NULL, 'ME 323 L', 'Mechanics of Materials-II Lab', 1, 'A', NULL, 11, 'Engr. Abdullah Muneeb', 'Work Shop', NULL, NULL, '1,2', NULL, NULL, NULL, NULL),
  ('BSME Batch 10( 4rd Semester)(Batch Advisor Dr. Sibghatullah)', 'BSME Batch-10', NULL, 'HM 321', 'Social and Ethical Aspects in Engineering', 2, 'A', NULL, 11, 'Dr. Shahid Saghir', 'Fluid Lab', NULL, '4,5', NULL, NULL, NULL, NULL, NULL),
  ('BSME Batch 11( 2nd Semester)(Batch AdvisorEngr Allah Ditta)', 'BSME Batch-11', NULL, 'EE 205', 'Basic Electrical Engineering', 2, 'A', NULL, 16, 'TBA', 'ROOM 40', NULL, '5', NULL, '5', NULL, NULL, NULL),
  ('BSME Batch 11( 2nd Semester)(Batch AdvisorEngr Allah Ditta)', 'BSME Batch-11', NULL, 'EE 205 L', 'Basic Electrical Engineering Lab', 1, 'A', NULL, 16, 'TBA', 'Work Shop', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BSME Batch 11( 2nd Semester)(Batch AdvisorEngr Allah Ditta)', 'BSME Batch-11', NULL, 'ME 231', 'Fluid Mechanics-1', 3, 'A', NULL, 16, 'Engr. Allah Ditta', 'Fluid Lab', NULL, NULL, '3,4', NULL, NULL, NULL, NULL),
  ('BSME Batch 11( 2nd Semester)(Batch AdvisorEngr Allah Ditta)', 'BSME Batch-11', NULL, 'ME 231 L', 'Fluid Mechanics-1 Lab', 1, 'A', NULL, 16, 'Engr. Allah Ditta', 'Fluid Lab', NULL, NULL, NULL, '3;4', NULL, NULL, NULL),
  ('BSME Batch 11( 2nd Semester)(Batch AdvisorEngr Allah Ditta)', 'BSME Batch-11', NULL, 'ME 242', 'Mechanical Measurements and Metrology', 2, 'A', NULL, 16, 'Engr. Bader Munir', 'Fluid Lab', '1,2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSME Batch 11( 2nd Semester)(Batch AdvisorEngr Allah Ditta)', 'BSME Batch-11', NULL, 'ME 242 L', 'Mechanical Measurements and Metrology Lab', 1, 'A', NULL, 16, 'Engr. Bader Munir', 'Themal Lab', NULL, '2,3', NULL, NULL, NULL, NULL, NULL),
  ('BSME Batch 11( 2nd Semester)(Batch AdvisorEngr Allah Ditta)', 'BSME Batch-11', NULL, 'ME 222', 'Mechanics of Machines', 3, 'A', NULL, 16, 'Engr. Waheed Ashraf', 'Drawing Hall', NULL, NULL, '2,3', NULL, NULL, NULL, NULL),
  ('BSME Batch 11( 2nd Semester)(Batch AdvisorEngr Allah Ditta)', 'BSME Batch-11', NULL, 'ME 222 L', 'Mechanics of Machines Lab', 1, 'A', NULL, 16, 'Engr. Abdullah Muneeb', 'Work Shop', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BSME Batch 11( 2nd Semester)(Batch AdvisorEngr Allah Ditta)', 'BSME Batch-11', NULL, 'ME 223', 'Machine Design and CAD-I', 2, 'A', NULL, 16, 'Engr. Saeed Hassan', 'Computer Lab', NULL, '4', NULL, '2', NULL, NULL, NULL),
  ('BSME Batch 11( 2nd Semester)(Batch AdvisorEngr Allah Ditta)', 'BSME Batch-11', NULL, 'ME 223 L', 'Machine Design and CAD-I Lab', 1, 'A', NULL, 16, 'Engr. Abdullah Muneeb', 'Work Shop', '3,4', NULL, NULL, NULL, NULL, NULL, NULL);



-- =====================================================================

-- City Campus Timetable data (252 rows)

-- =====================================================================

INSERT INTO city_campus_timetable (group_header, program, merged_programs, course_code, course_title, credit_hours, section, batch, strength, resource_person, classroom, mon, tue, wed, thu, fri, sat, sun) VALUES
  ('DPT Batch 009', 'DPT Batch 009', NULL, 'SHS.509', 'Obstetrics & Gynaecological PT', 2, 'A', 9, 26, 'Dr.Khadija', 'BC1', NULL, NULL, '10:30-11:30', NULL, '10:30-11:30', NULL, NULL),
  ('DPT Batch 009', 'DPT Batch 009', NULL, 'SHS.510', 'Pediatric PT', 2, 'A', 9, 26, 'Dr.Sana Tariq', 'BC1', NULL, '9:30-10:30', NULL, NULL, '8:30-9:30', NULL, NULL),
  ('DPT Batch 009', 'DPT Batch 009', NULL, 'SHS.511', 'Gerontology & Geriatric PT', 2, 'A', 9, 26, 'Dr.Ramish', 'BC1', NULL, NULL, '9:30-10:30', NULL, '9:30-10:30', NULL, NULL),
  ('DPT Batch 009', 'DPT Batch 009', NULL, 'SHS.512', 'Sports PT', 2, 'A', 9, 26, 'Dr.Amna', 'BC1', NULL, '8:30-9:30', '8:30-9:30', NULL, NULL, NULL, NULL),
  ('DPT Batch 009', 'DPT Batch 009', NULL, 'SHS.595', 'Supervised Clinical Practice VI', 4, 'A', 9, 26, 'Dr.Danyal', 'Bethania Hospital Practice', '1,2,3,4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 009', 'DPT Batch 009', NULL, 'SHS.599', 'Research Project', 6, 'A', 9, 26, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 0010', 'DPT Batch 0010', NULL, 'SHS.501', 'Cardiopulmonary PT', 3, 'A', 9, 10, 'Dr.Ramish', 'BC1', '5', NULL, NULL, NULL, '1', NULL, NULL),
  ('DPT Batch 0010', 'DPT Batch 0010', NULL, 'SHS.502', 'Emergency Procedures & Primary Care in PT', 2, 'A', 9, 10, 'Dr.Aneeba', 'BC1', '4', NULL, NULL, '4', NULL, NULL, NULL),
  ('DPT Batch 0010', 'DPT Batch 0010', NULL, 'SHS.503', 'Clinical Decision Making & Differential Diagnosis', 3, 'A', 9, 10, 'Dr.Faiza', 'BC1', NULL, '4', NULL, '3', NULL, NULL, NULL),
  ('DPT Batch 0010', 'DPT Batch 0010', 'DPT,BSNS', 'SHS.504', 'Scientific Inquiry & Research Methodology', 3, 'A', '10,6', '10+45', 'Mr.Yahya', 'BC1', NULL, '3', NULL, NULL, '2', NULL, NULL),
  ('DPT Batch 0010', 'DPT Batch 0010', NULL, 'SHS.505', 'Professional Practice (Law, Ethics & Administration)', 2, 'A', 9, 10, 'Dr.Hira', 'GC1', NULL, '5', NULL, NULL, '3', NULL, NULL),
  ('DPT Batch 0010', 'DPT Batch 0010', NULL, 'SHS.506', 'Integumentary Physical Therapy', 2, 'A', 9, 10, 'Dr.Amna', 'BC1', NULL, NULL, NULL, '8:30-10:30', NULL, NULL, NULL),
  ('DPT Batch 0010', 'DPT Batch 0010', NULL, 'SHS.590', 'Supervised Clinical Practice V', 3, 'A', 10, 10, 'Dr.Hamza', 'Bethania Hospital Practice', NULL, NULL, '1,2,3,4', NULL, NULL, NULL, NULL),
  ('DPT Batch 011', 'DPT Batch 11', NULL, 'SHS.420', 'Medicine II', 3, 'A', '11,12', '27+10', 'Dr.Maida', 'BC4', NULL, '3', '3', NULL, NULL, NULL, NULL),
  ('DPT Batch 011', 'DPT Batch 11', 'DPT,BSMIU', 'SHS.421', 'Surgery II', 3, 'A', '11,3', 27, 'Dr.Aneeba', 'BC4', NULL, '2', NULL, '2', NULL, NULL, NULL),
  ('DPT Batch 011', 'DPT Batch 11', 'DPT', 'SHS.422', 'Neurological Physical Therapy', 2, 'A', '11,12', '27+10', 'Dr.Amna', 'BC6', NULL, NULL, '4', '4', NULL, NULL, NULL),
  ('DPT Batch 011', 'DPT Batch 11', 'DPT', 'SHS.422', 'Neurological Physical Therapy (Lab)', 1, 'A', '11,12', '27+10', 'Dr.Amna', 'LAB', NULL, NULL, '5', NULL, NULL, NULL, NULL),
  ('DPT Batch 011', 'DPT Batch 11', 'DPT,BSMIU', 'SHS.423', 'Evidence Based Practice', 2, 'A', 11, 27, 'Dr.Faiza', 'BC4', '3', NULL, NULL, '1', NULL, NULL, NULL),
  ('DPT Batch 011', 'DPT Batch 11', 'DPT,BSMIU', 'SHS.423', 'Evidence Based Practice (Lab)', 1, 'A', 11, 27, 'Dr.Faiza', 'LAB', '4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 011', 'DPT Batch 11', NULL, 'SHS.424', 'Prosthetics & Orthotics', 2, 'A', 11, 27, 'Dr.Aneeba', 'BC6', '5', '5', NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 011', 'DPT Batch 11', NULL, 'SHS.480', 'Supervised Clinical Practice IV', 3, 'A', 11, 27, 'Dr.Hamza', 'Bethania Hospital Practice', NULL, NULL, NULL, NULL, '9:00-4:00', NULL, NULL),
  ('DPT Batch 011', 'DPT Batch 11', NULL, NULL, '21st century skills', 0, NULL, 11, 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 011', 'DPT Batch 11', NULL, NULL, 'English immersion', 0, NULL, 11, 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 12', 'DPT Batch 12', NULL, 'SHS.420', 'Medicine II', 3, 'A', '11,12', '27+10', 'Dr.Maida', 'BC4', NULL, '3', '3', NULL, NULL, NULL, NULL),
  ('DPT Batch 12', 'DPT Batch 12', 'DPT,BSMIU', 'SHS.421', 'Surgery II', 3, 'A', '11,3', 27, 'Dr.Aneeba', 'BC4', NULL, '2', NULL, '2', NULL, NULL, NULL),
  ('DPT Batch 12', 'DPT Batch 12', 'DPT', 'SHS.422', 'Neurological Physical Therapy', 2, 'A', '11,12', '27+10', 'Dr.Amna', 'BC6', NULL, NULL, '4', '4', NULL, NULL, NULL),
  ('DPT Batch 12', 'DPT Batch 12', 'DPT', 'SHS.422', 'Neurological Physical Therapy (Lab)', 1, 'A', '11,12', '27+10', 'Dr.Amna', 'LAB', NULL, NULL, '5', NULL, NULL, NULL, NULL),
  ('DPT Batch 12', 'DPT Batch 12', 'DPT,BSMIU', 'SHS.423', 'Evidence Based Practice', 2, 'A', 11, 29, 'Dr.Faiza', 'BC4', '3', NULL, NULL, '4', NULL, NULL, NULL),
  ('DPT Batch 12', 'DPT Batch 12', 'DPT,BSMIU', 'SHS.423', 'Evidence Based Practice (Lab)', 1, 'A', 11, 29, 'Dr.Faiza', 'LAB', '4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 12', 'DPT Batch 12', NULL, 'SHS.424', 'Prosthetics & Orthotics', 2, 'A', 11, 29, 'Dr.Aneeba', 'BC6', '5', '5', NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 12', 'DPT Batch 12', NULL, 'SHS.480', 'Supervised Clinical Practice IV', 3, 'A', 12, 7, 'Dr.Hamza', 'Bethania Hospital Practice', NULL, NULL, NULL, NULL, '9:00-4:00', NULL, NULL),
  ('DPT Batch 12', 'DPT Batch 12', NULL, NULL, '21st century skills', 0, NULL, 11, 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 12', 'DPT Batch 12', NULL, NULL, 'English immersion', 0, NULL, 11, 29, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 13', 'DPT Batch 13', NULL, 'SHS.313', 'Pathology & Microbiology II', 2, 'A', 13, 45, 'Dr.Maida', 'BC3', '1', NULL, NULL, NULL, '4', NULL, NULL),
  ('DPT Batch 13', 'DPT Batch 13', NULL, 'SHS.313', 'Pathology & Microbiology II (Lab)', 1, 'A', 13, 45, 'Dr.Maida', 'Patho Lab', NULL, NULL, NULL, NULL, '2', NULL, NULL),
  ('DPT Batch 13', 'DPT Batch 13', NULL, 'SHS.314', 'Pharmacology II', 2, 'A', 13, 45, 'Dr.Ramish', 'BC3', NULL, NULL, '4', NULL, '3', NULL, NULL),
  ('DPT Batch 13', 'DPT Batch 13', NULL, 'DPT.321', 'Therapeutic Exercises & Techniques II', 2, 'A', 13, 45, 'Dr.Amna', 'BC3', NULL, '10:30-12:30', NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 13', 'DPT Batch 13', NULL, 'DPT.321', 'Therapeutic Exercises & Techniques II (Lab)', 1, 'A', 13, 45, 'Dr.Amna', 'Lab', NULL, NULL, '2', NULL, NULL, NULL, NULL),
  ('DPT Batch 13', 'DPT Batch 13', NULL, 'DPT.322', 'Physical Agents & Electrotherapy II', 2, 'A', 13, 45, 'Dr.Kahdija', 'BC3', '2', '4', NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 13', 'DPT Batch 13', NULL, 'DPT.322', 'Physical Agents & Electrotherapy II (Lab)', 1, 'A', 13, 45, 'Dr.Kahdija', 'PA & Electro Lab', NULL, '5', NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 13', 'DPT Batch 13', NULL, 'DPT.323', 'Radiology & Diagnostic Imaging', 2, 'A', 13, 45, 'Dr.Hira', 'BC3', '3', NULL, '3', NULL, NULL, NULL, NULL),
  ('DPT Batch 13', 'DPT Batch 13', NULL, 'DPT.323', 'Radiology & Diagnostic Imaging (Lab)', 1, 'A', 13, 45, 'Dr.Hira', 'RDI Lab', NULL, NULL, NULL, '5', NULL, NULL, NULL),
  ('DPT Batch 13', 'DPT Batch 13', NULL, 'DPT.324', 'Molecular biology & Genetics', 2, 'A', 13, 45, 'TBA', 'BC3', NULL, NULL, '1', NULL, '1', NULL, NULL),
  ('DPT Batch 13', 'DPT Batch 13', NULL, 'SHS.360', 'Supervised Clinical Practice II', 3, 'A', 13, 45, 'Dr.Danyal', 'Bethania Hospital Practice', NULL, NULL, NULL, '1,2,3,4', NULL, NULL, NULL),
  ('DPT Batch 14', 'DPT Batch 14', NULL, 'SHS.301', 'Pathology & Microbiology I', 2, 'A', '14,9', 12, 'Dr.Hamza', 'F1C5', NULL, NULL, '3', '3', NULL, NULL, NULL),
  ('DPT Batch 14', 'DPT Batch 14', NULL, 'SHS.302', 'Pharmacology I', 2, 'A', 14, 12, 'Dr.Hira', 'BC4', NULL, NULL, NULL, '2', '2', NULL, NULL),
  ('DPT Batch 14', 'DPT Batch 14', 'DPT,BSMIU', 'MG224', 'Innovation and Entrepreneurship', 3, 'A', 14, 12, 'TBA', 'BC4', '5', NULL, NULL, '5', NULL, NULL, NULL),
  ('DPT Batch 14', 'DPT Batch 14', NULL, 'DPT.310', 'Therapeutic Exercises & Techniques I', 2, 'A', 14, 12, 'Dr.Areeba', 'BC4', NULL, NULL, '5', NULL, '3', NULL, NULL),
  ('DPT Batch 14', 'DPT Batch 14', NULL, 'DPT.310', 'Therapeutic Exercises & Techniques I (Lab)', 1, 'A', 14, 12, 'Dr.Areeba', 'Physio Lab', NULL, NULL, NULL, NULL, '4', NULL, NULL),
  ('DPT Batch 14', 'DPT Batch 14', NULL, 'DPT.311', 'Physical Agents & Electrotherapy I', 2, 'A', 14, 12, 'Dr.Khadija', 'BC4', '3', NULL, NULL, '4', NULL, NULL, NULL),
  ('DPT Batch 14', 'DPT Batch 14', NULL, 'DPT.311', 'Physical Agents & Electrotherapy I (Lab)', 1, 'A', 14, 12, 'Dr.Khadija', 'Psysio Lab', NULL, NULL, '2', NULL, NULL, NULL, NULL),
  ('DPT Batch 14', 'DPT Batch 14', 'BSHEL,DPT', 'DPT.312', 'Health & Wellness', 2, 'A', '16,17,14', '5,5,12', 'Dr.Areeba', 'BC2', '4', NULL, '4', NULL, NULL, NULL, NULL),
  ('DPT Batch 14', 'DPT Batch 14', NULL, 'SHS.350', 'Supervised Clinical Practice I', 3, 'A', 14, 12, 'Dr.Danyal', 'Bethania Hospital Practice', NULL, '1,2,3,4', NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 14', 'DPT Batch 14', NULL, 'SD. 100', 'English Immersion', 0, 'A', 14, 12, '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 15', 'DPT Batch 15', 'DPT,MLS,BSNS', 'QM111', 'Understanding Society & Socio-Cultural Dynamics', 3, 'A', 15, 33, 'Mr.Usman Mahmood VF', 'BC6', NULL, NULL, NULL, '1', '3', NULL, NULL),
  ('DPT Batch 15', 'DPT Batch 15', 'DPT,BSMIU,BSNS', 'HND104', 'Biostatistics', 3, 'A', 15, 33, 'Mr.Anwar Maqsood', 'BC3', NULL, NULL, NULL, '3', '1', NULL, NULL),
  ('DPT Batch 15', 'DPT Batch 15', 'DPT,BSMIU', 'SHS.210', 'Anatomy IV', 2, 'A', 15, 33, 'Dr.Faiza', 'BC6', '4', NULL, '4', NULL, NULL, NULL, NULL),
  ('DPT Batch 15', 'DPT Batch 15', 'DPT,BSMIU', 'SHS.210', 'Anatomy IV', 1, 'A', 15, 33, 'Dr.Faiza', 'Anatomy LAB', NULL, '3', NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 15', 'DPT Batch 15', NULL, 'DPT.222', 'Exercise Physiology', 3, 'A', 15, 33, 'Dr.Khadija', 'BC6', NULL, '4', NULL, NULL, '2', NULL, NULL),
  ('DPT Batch 15', 'DPT Batch 15', NULL, 'DPT.223', 'Medical Physics', 2, 'A', 15, 33, 'Dr.Hira', 'BC6', '5', NULL, NULL, '5', NULL, NULL, NULL),
  ('DPT Batch 15', 'DPT Batch 15', NULL, 'DPT.223', 'Medical Physics (Lab)', 1, 'A', 15, 33, 'Dr.Hira', 'MP Lab', NULL, NULL, '5', NULL, NULL, NULL, NULL),
  ('DPT Batch 15', 'DPT Batch 15', NULL, 'DPT.224', 'Biomechanics & Ergonomics II', 2, 'A', 15, 33, 'Dr.Ramish', 'BC6', NULL, '5', '3', NULL, NULL, NULL, NULL),
  ('DPT Batch 15', 'DPT Batch 15', NULL, 'DPT.224', 'Biomechanics & Ergonomics II (Lab)', 1, 'A', 15, 33, 'Dr.Ramish', 'Biochem Lab', '3', NULL, NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 16', 'DPT Batch 16', NULL, 'SHS.107', 'Anatomy II', 3, NULL, 17, 26, 'Dr.Maida', NULL, NULL, '1', NULL, NULL, '2', NULL, NULL),
  ('DPT Batch 16', 'DPT Batch 16', NULL, 'SHS.107', 'Anatomy II (Lab)', 1, NULL, 17, 26, 'Dr.Maida', NULL, NULL, '2', NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 16', 'DPT Batch 16', NULL, 'SHS.108', 'Physiology II', 2, NULL, 17, 26, 'Dr.Sana Tariq', NULL, '2', NULL, NULL, '2', NULL, NULL, NULL),
  ('DPT Batch 16', 'DPT Batch 16', NULL, 'SHS.108', 'Physiology II (Lab)', 1, NULL, 17, 26, 'Dr.Sana Tariq', NULL, NULL, '11:00-12:00', NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 16', 'DPT Batch 16', NULL, 'SHS.109', 'Biochemistry & Genetics II', 2, NULL, 17, 26, 'Dr.Hira', NULL, NULL, '4', NULL, NULL, '5', NULL, NULL),
  ('DPT Batch 16', 'DPT Batch 16', NULL, 'SHS.109', 'Biochemistry & Genetics II (Lab)', 1, NULL, 17, 26, 'Dr.Hira', NULL, NULL, NULL, '4', NULL, NULL, NULL, NULL),
  ('DPT Batch 16', 'DPT Batch 16', '16,4', 'EN 123', 'English II', 3, 'A', '16,4', '26+12', 'ms:saima mir', NULL, '1', NULL, '1', NULL, NULL, NULL, NULL),
  ('DPT Batch 16', 'DPT Batch 16', NULL, 'POL-121', 'Pakistan: Ideology, Constitution and Society', 3, NULL, 17, 26, 'TBA', NULL, NULL, NULL, NULL, '1', '1', NULL, NULL),
  ('DPT Batch 16', 'DPT Batch 16', NULL, 'DPT.120', 'Kinesiology I', 2, NULL, 17, 26, NULL, NULL, '3', NULL, '3', NULL, NULL, NULL, NULL),
  ('DPT Batch 16', 'DPT Batch 16', NULL, 'DPT.120', 'Kinesiology I (Lab)', 1, NULL, 17, 26, NULL, NULL, NULL, NULL, NULL, '3', NULL, NULL, NULL),
  ('DPT Batch 17 (1st Semester)', 'DPT Batch 18', 'DPT,MLS,MIU', 'SHS.101', 'Anatomy I', 3, 'A', '16,9,12', 'TBA', 'Dr.Sana Tariq', 'BC2', NULL, NULL, '8:30:10:00', NULL, '11:30-1:00', NULL, NULL),
  ('DPT Batch 17 (1st Semester)', 'DPT Batch 17', 'DPT,MLS,MIU', 'SHS.101', 'Anatomy I (LAB)', 1, 'A', '16,9,12', 'TBA', 'Dr.Sana Tariq', 'Anatomy LAB', NULL, NULL, NULL, NULL, '2:00-400', NULL, NULL),
  ('DPT Batch 17 (1st Semester)', 'DPT Batch 17', 'DPT,BSMLS', 'SHS.102', 'Physiology I', 2, 'A', '16,4', 'TBA', 'Dr.Qasim', 'BC2', '9:00-10:00', NULL, NULL, '1:30-2:30', NULL, NULL, NULL),
  ('DPT Batch 17 (1st Semester)', 'DPT Batch 17', 'DPT,BSMLS', 'SHS.102', 'Physiology I (Lab)', 1, 'A', '16,4', 'TBA', 'Dr.Qasim', 'Physio Lab', NULL, NULL, '1:00-3:00', NULL, NULL, NULL, NULL),
  ('DPT Batch 17 (1st Semester)', 'DPT Batch 17', NULL, 'DPT120', 'Kinesiology I', 2, 'A', 16, 'TBA', 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 17 (1st Semester)', 'DPT Batch 17', NULL, 'SHS.103', 'Kinesiology I (Lab)', 1, 'A', 16, 'TBA', 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('DPT Batch 17 (1st Semester)', 'DPT Batch 17', 'DPT,BSNS', 'EN110', 'English I (Functional English )', 3, 'A', '16,2', 'TBA', 'Ms.Mishal', 'BC2', NULL, NULL, '11:30-1:00', NULL, '10:00-11:30', NULL, NULL),
  ('DPT Batch 17 (1st Semester)', 'DPT Batch 17', NULL, NULL, 'Foreign Language', 2, 'A', NULL, 'TBA', 'Dr.Falak Shair', 'F1C4 & BC2', NULL, '2:30-4:00', NULL, '2:30-3:30', NULL, NULL, NULL),
  ('DPT Batch 17 (1st Semester)', 'DPT Batch 17', 'DPT,MLS,MIU,BSNS', 'ITC 111', 'Understanding of Holy Quran (Fahm ul Quran)', 1, 'A', '16,4,9,12', 'TBA', 'Dr.Naeem Qaiser', 'BC2', '11:30-12:00', NULL, NULL, '11:30-12:00', NULL, NULL, NULL),
  ('DPT Batch 17 (1st Semester)', 'DPT Batch 17', NULL, NULL, 'Everyday Science', 2, 'A', '17,4,9,12', 'TBA', 'Mr.Messam Shamsi', 'BC6', NULL, NULL, '1:30-2:30', '9:00-10:00', NULL, NULL, NULL),
  ('BSMLS Batch 01', 'BSMLS Batch 001', NULL, 'MLS.406', 'Advanced Clinical Chemistry', 2, 'A', 1, 10, 'Ms. Anum', 'GC1 & BC1', NULL, NULL, NULL, '1:00-2:00', '1', NULL, NULL),
  ('BSMLS Batch 01', 'BSMLS Batch 001', NULL, 'MLS.406', 'Advanced Clinical Chemistry  (Lab)', 1, 'A', NULL, NULL, 'Ms. Anum', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS Batch 01', 'BSMLS Batch 001', NULL, 'MLS.407', 'Advanced Clinical Microbiology', 2, 'A', 1, 10, 'Dr.Qasim', 'LAB', NULL, NULL, NULL, NULL, '2', NULL, NULL),
  ('BSMLS Batch 01', 'BSMLS Batch 001', NULL, 'MLS.408', 'Advanced Clinical Microbiology (Lab)', 1, 'A', 1, 10, 'Dr.Qasim', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS Batch 01', 'BSMLS Batch 001', NULL, 'MLS.408', 'Clinical lab Establishment and Management', 3, 'A', 1, 10, 'TBA', 'BC1', NULL, NULL, NULL, '9:00-11:00', NULL, NULL, NULL),
  ('BSMLS Batch 01', 'BSMLS Batch 001', NULL, 'MLS.409', 'Advanced Clinical Immunology', 2, 'A', 1, 10, 'Dr.Qasim', 'LAB', NULL, NULL, NULL, '3', NULL, NULL, NULL),
  ('BSMLS Batch 01', 'BSMLS Batch 001', NULL, 'MLS.410', 'Advanced Clinical Immunology (Lab)', 1, 'A', 1, 10, 'Dr.Qasim', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS Batch 01', 'BSMLS Batch 001', NULL, 'MLS.410', 'Research Project for Allied Health Sciences', 6, 'A', 1, 10, 'Ms. Anum', 'BC1', NULL, '8:30-10:30', NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 02 (4th Semester)', 'BSMLS Batch 002', 'TBA', 'SHS.317', 'Pathology II', 2, 'A', 2, 13, 'TBA', 'BC1 & BC5', '2:30-3:30', NULL, NULL, NULL, '11:30-12:30', NULL, NULL),
  ('BSMLS 02 (4th Semester)', 'BSMLS Batch 002', 'TBA', 'SHS.365', 'Pharmacology', 2, 'A', 2, 13, 'TBA', 'LAB', '12:00-2:00', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 02 (4th Semester)', 'BSMLS Batch 002', 'Dr.Qasim', 'MLS.204', 'Biomedical Instrumentation', 2, 'A', 2, 13, 'Dr.Qasim', 'BC5', NULL, NULL, '9:30-11:30', NULL, NULL, NULL, NULL),
  ('BSMLS 02 (4th Semester)', 'BSMLS Batch 002', 'Dr.Qasim', 'MLS.204', 'Biomedical Instrumentation (Lab)', 1, 'A', 2, 13, 'Dr.Qasim', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 02 (4th Semester)', 'BSMLS Batch 002', 'Ms. Anum', 'SHS.320', 'Virology and Parasitology', 2, 'A', 2, 13, 'Ms. Anum', 'LAB', NULL, NULL, '1:00-3:00', NULL, NULL, NULL, NULL),
  ('BSMLS 02 (4th Semester)', 'BSMLS Batch 002', 'Ms. Anum', 'SHS.320', 'Virology and Parasitology (Lab)', 1, 'A', 2, 13, 'Ms. Anum', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 02 (4th Semester)', 'BSMLS Batch 002', 'TBA', 'MB.402', 'Epidemiology and Public Health', 2, 'A', 2, 13, 'TBA', 'BC5', NULL, '8:30-9:30', NULL, '12:00-1:00', NULL, NULL, NULL),
  ('BSMLS 02 (4th Semester)', 'BSMLS Batch 002', 'TBA', 'SHS. 504', 'Scientific Inquiry & Research Methodology', 2, 'A', 2, 13, 'TBA', 'LAB', NULL, '1:00-3:30', NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 02 (4th Semester)', 'BSMLS Batch 002', 'TBA', 'SHS. 504', 'Scientific Inquiry & Research Methodology (Lab)', 1, 'A', 2, 13, 'TBA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 02 (4th Semester)', 'BSMLS Batch 002', 'Dr.Qasim', 'MLS.310', 'Clinical Lab Practice I', 3, 'A', 2, 13, 'Dr.Qasim', 'BC5', NULL, NULL, NULL, NULL, '1:30-3:30', NULL, NULL),
  ('BSMLS 02 (4th Semester)', 'BSMLS Batch 002', NULL, 'SD.102', '21ST Century Skills', 0, 'A', 2, 13, NULL, 'LAB', NULL, NULL, NULL, NULL, '9:00-11:30', NULL, NULL),
  ('BSMLS 003 (4th Semester)', 'BSMLS Batch 003', NULL, 'SD210', 'Civics and Community Engagement', 2, 'A', '3,7,10', 10, 'Mr.Usman Mahmood VF', 'Conf Hall', NULL, NULL, NULL, NULL, '11:30-1:30', NULL, NULL),
  ('BSMLS 003 (4th Semester)', 'BSMLS Batch 003', NULL, 'SHS221', 'Biostatistics', 3, 'A', 3, 10, 'TBA', 'LAB', NULL, NULL, NULL, NULL, '4', NULL, NULL),
  ('BSMLS 003 (4th Semester)', 'BSMLS Batch 003', NULL, 'MG224', 'Innovation and Entrepreneurship', 3, 'A', 3, 10, 'TBA', 'BC4 & GC1', '10:00-11:00', '1:00-2:00', NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (4th Semester)', 'BSMLS Batch 003', NULL, 'MLS.205', 'Basic Clinical Chemistry', 2, 'A', 3, 10, 'TBA', 'Physio Lab', '3', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (4th Semester)', 'BSMLS Batch 003', NULL, 'MLS.205', 'Basic Clinical Chemistry (Lab)', 1, 'A', 3, 10, 'TBA', 'Physio Lab', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (4th Semester)', 'BSMLS Batch 003', NULL, 'MLS.202', 'General Microbiology & Sterilization', 2, 'A', 3, 10, 'Ms. Anum', 'BC3', NULL, NULL, '8:30-9:30', NULL, '2:30-3:30', NULL, NULL),
  ('BSMLS 003 (4th Semester)', 'BSMLS Batch 003', NULL, 'MLS.202', 'General Microbiology & Sterilization (Lab)', 1, 'A', 3, 10, 'Ms. Anum', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (4th Semester)', 'BSMLS Batch 003', NULL, 'MLS.203', 'Haematology I', 2, 'A', 3, 10, 'Dr.Qasim', 'GC1', '4', NULL, NULL, '4', NULL, NULL, NULL),
  ('BSMLS 003 (4th Semester)', 'BSMLS Batch 003', NULL, 'MLS.203', 'Haematology I (Lab)', 1, 'A', 3, 10, 'Dr.Qasim', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (2nd Semester)', 'BSMLS Batch 004', NULL, 'SHS.107', 'Anatomy II', 3, 'A', 4, NULL, 'Dr.Maida', NULL, NULL, '1', NULL, NULL, '2', NULL, NULL),
  ('BSMLS 003 (2nd Semester)', 'BSMLS Batch 004', NULL, 'SHS.107', 'Anatomy II (Lab)', 1, 'A', 4, NULL, 'Dr.Maida', NULL, NULL, '2', NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (2nd Semester)', 'BSMLS Batch 004', NULL, 'SHS.108', 'Physiology II', 2, 'A', 4, NULL, 'Dr.Sana Tariq', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (2nd Semester)', 'BSMLS Batch 004', NULL, 'SHS.108', 'Physiology II (Lab)', 1, 'A', 4, NULL, 'Dr.Sana Tariq', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (2nd Semester)', 'BSMLS Batch 004', NULL, 'SHS.115', 'Biochemistry II', 2, 'A', 4, NULL, 'Dr.Hira', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (2nd Semester)', 'BSMLS Batch 004', NULL, 'SHS.115', 'Biochemistry II (Lab)', 1, 'A', 4, NULL, 'Dr.Hira', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (2nd Semester)', 'BSMLS Batch 004', '16,4', 'EN123', 'English II', 3, 'A', '16,4', '26+12', 'Ms:saima mir', 'F1C1', '1', NULL, '1', NULL, NULL, NULL, NULL),
  ('BSMLS 003 (2nd Semester)', 'BSMLS Batch 004', NULL, 'POL121', 'Pakistan: Ideology, Constitution and Society', 2, 'A', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (2nd Semester)', 'BSMLS Batch 004', NULL, NULL, 'Fehm ul Quran', 1, 'A', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (2nd Semester)', 'BSMLS Batch 004', NULL, 'CH211', 'Natural Science', 2, 'A', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 003 (2nd Semester)', 'BSMLS Batch 004', NULL, 'CH211', 'Natural Science (Lab)', 1, 'A', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 005 (1st Semester)', 'BSMLS Batch 005', 'DPT,MLS,MIU', 'SHS.101', 'Anatomy I', 3, 'A', 5, 'TBA', NULL, 'BC2', NULL, NULL, '8:30:10:00', NULL, '11:30-1:00', NULL, NULL),
  ('BSMLS 005 (1st Semester)', 'BSMLS Batch 005', 'DPT,MLS,MIU', 'SHS.101', 'Anatomy I (LAB)', 1, 'A', 5, 'TBA', NULL, 'Anatomy LAB', NULL, NULL, NULL, NULL, '2:00-4:00', NULL, NULL),
  ('BSMLS 005 (1st Semester)', 'BSMLS Batch 005', 'DPT,BSMLS', 'SHS.102', 'Physiology I', 2, 'A', 5, 'TBA', NULL, 'BC2 /GC1', '9:00-10:00', NULL, NULL, '1:30-2:30', NULL, NULL, NULL),
  ('BSMLS 005 (1st Semester)', 'BSMLS Batch 005', 'DPT,BSMLS', 'SHS.102', 'Physiology I (Lab)', 1, 'A', 5, 'TBA', NULL, 'Physio Lab', NULL, NULL, '1:00-3:00', NULL, NULL, NULL, NULL),
  ('BSMLS 005 (1st Semester)', 'BSMLS Batch 005', NULL, 'SHS 114', 'Biochemistry I', 2, 'A', 5, 'TBA', NULL, 'BC2', '10:00-11:00', NULL, '10:00-11:00', NULL, NULL, NULL, NULL),
  ('BSMLS 005 (1st Semester)', 'BSMLS Batch 005', NULL, 'SHS 114', 'Biochemistry I (Lab)', 1, 'A', 5, 'TBA', NULL, 'Biochem Lab', NULL, NULL, NULL, '9:00-11:00', NULL, NULL, NULL),
  ('BSMLS 005 (1st Semester)', 'BSMLS Batch 005', NULL, 'EN110', 'English I', 3, 'A', 5, 'TBA', NULL, NULL, NULL, '1', NULL, NULL, '10:00-11:30', NULL, NULL),
  ('BSMLS 005 (1st Semester)', 'BSMLS Batch 005', 'DPT,MLS,MIU,BSNS', 'ITC 111', 'Understanding of Holy Quran (Fahm ul Quran)', 1, 'A', 5, 'TBA', NULL, 'BC2', '11:30-12:00', NULL, NULL, '11:30-12:00', NULL, NULL, NULL),
  ('BSMLS 005 (1st Semester)', 'BSMLS Batch 005', 'MLS,MIU', 'ISL-112', 'Islamic Thought & Perspectives/Ethics', 2, 'A', 5, 'TBA', NULL, 'BC2', '12:00-1:00', NULL, NULL, '12:00-1:00', NULL, NULL, NULL),
  ('BSMLS 005 (1st Semester)', 'BSMLS Batch 005', 'BSCPSY,MLS,HND', 'ISL-135', 'Computer Applications', 2, 'A', 5, 'TBA', NULL, 'BC2', NULL, '11:30-1:30', NULL, NULL, NULL, NULL, NULL),
  ('BSMLS 005 (1st Semester)', 'BSMLS Batch 005', 'BSCPSY,MLS,HND', 'ISL-135', 'Computer Applications (LAB)', 1, 'A', 5, 'TBA', NULL, 'BC2', NULL, '1:30-3:30', NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 003 (Semester 8)', 'BSMIU Batch 003', NULL, 'SHS.420', 'Medicine II', 3, 'A', 3, 45, 'Dr.Areeb', 'BC4', NULL, '3', '3', NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 003 (Semester 8)', 'BSMIU Batch 003', 'DPT,BSMIU', 'SHS.421', 'Surgery II', 3, 'A', '11,3', 45, 'Dr.Aneeba', 'BC4', NULL, '2', NULL, '2', NULL, NULL, NULL),
  ('BS-MIU Batch 003 (Semester 8)', 'BSMIU Batch 003', NULL, 'SHS.432', 'Echocardiography & Special USG', 3, 'A', 3, 50, 'Dr.Rachel', 'BC4', NULL, NULL, '1', '1', NULL, NULL, NULL),
  ('BS-MIU Batch 003 (Semester 8)', 'BSMIU Batch 003', NULL, 'SHS.480', 'Supervised Clinical Practice IV', 3, 'A', 3, 50, 'Dr.Areeb', 'Bethania Hospital Practice', '2,3,4,5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 004 (7th Semester)', 'BSMIU Batch 004', NULL, 'SHS.401', 'Medicine I', 3, 'A', 4, 5, 'Dr.Areeb', 'BC1', '11:30-12:30', '2:00-3:00', NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 004 (7th Semester)', 'BSMIU Batch 004', NULL, 'SHS.402', 'Surgery I', 2, 'A', 4, 5, 'Dr.Rachel', 'F1C2', '1', '2', NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 004 (7th Semester)', 'BSMIU Batch 004', NULL, 'SHS.413', 'MRI', 1, 'A', 4, 5, 'Dr.Rachel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 004 (7th Semester)', 'BSMIU Batch 004', NULL, 'SHS.415', 'Musculoskeletal USG', 2, 'A', 4, 5, 'Ms.Nimra Altaf', 'GC2', NULL, NULL, NULL, NULL, '3,4', NULL, NULL),
  ('BS-MIU Batch 004 (7th Semester)', 'BSMIU Batch 004', 'MIU', 'SHS.423', 'Evidence Based Practice', 1, 'A', 4, 5, 'Ms.Nimra Altaf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 004 (7th Semester)', 'BSMIU Batch 004', NULL, 'SHS.480', 'Supervised Clinical Practice IV', 3, 'A', 3, 50, 'Dr.Areeb', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 005', 'BSMIU Batch 005', 'BSMIU,BSNS', 'SHS 340', 'Clinical Medicine', 3, 'A', 5, 50, 'Dr.Areeb', 'BC1', '11:30-12:30', '2:00-3:00', NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 005', 'BSMIU Batch 005', 'BSMIU', 'MIU 312', 'Computed tomography II', 2, 'A', 5, 50, 'Dr.Rachel', 'F1C2', '1', '2', NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 005', 'BSMIU Batch 005', 'BSMIU', 'MIU 312', 'Computed tomography II (Lab)', 1, 'A', 5, 50, 'Dr.Rachel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 005', 'BSMIU Batch 005', NULL, 'MIU 313', 'Echocardiography', 2, 'A', 5, 50, 'Ms.Nimra Altaf', 'GC2', NULL, NULL, '1:00-2:00', NULL, '1:30-2:30', NULL, NULL),
  ('BS-MIU Batch 005', 'BSMIU Batch 005', NULL, 'MIU 313', 'Echocardiography  (Lab)', 1, 'A', 5, 50, 'Ms.Nimra Altaf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 005', 'BSMIU Batch 005', NULL, 'MIU 314', 'Supervised Clinical Practice II', 4, NULL, 5, 50, 'Dr.Rachel', 'LAB', NULL, NULL, '2:00-4:00', NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 006', NULL, 'MIU 301', 'General Ultrasound', 2, 'A', 6, 56, 'Dr.Rachel', 'F1C2', NULL, '9:00-10:00', NULL, '10:00-11:00', NULL, NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 006', NULL, 'MIU 301', 'General Ultrasound (Lab)', 1, 'A', 6, 56, 'Dr.Rachel', 'General Ultrasound Lab', NULL, NULL, NULL, '12:30-2:30', NULL, NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 006', 'BSMIU', 'MIU 302', 'Computed Tomography I', 3, 'A', 6, '4,56', 'Ms.Nimra Altaf', 'F1C2', NULL, '2', NULL, '1', NULL, NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 006', NULL, 'MIU 303', 'Angiography & Cardiac Imaging', 2, 'A', 6, 56, 'Dr.Rachel', 'F1C2 & BC6', NULL, '11:30-12:30', NULL, '11:30:12:30', NULL, NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 006', NULL, 'MIU 303', 'Angiography & Cardiac Imaging (Lab)', 1, 'A', 6, 56, 'Dr.Rachel', NULL, '5', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 006', 'MIU', 'MIU 304', 'Evidence Based Practice', 3, 'A', 6, 56, 'Dr.Maida', 'BC4', '5', NULL, NULL, '5', NULL, NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 006', NULL, 'MIU 305', 'Supervised Clinical Practice I', 4, 'A', 6, 56, 'Dr.Areeb', 'Bethania Hospital Practice', NULL, NULL, NULL, NULL, '8:30-11:30', NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 007', 'DPT,BSMIU', 'SHS.210', 'Anatomy IV', 2, 'A', 7, 50, 'Dr.Faiza', 'BC6', '11:30-12:30', NULL, '11:30-12:30', NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 007', 'DPT,BSMIU', 'SHS.210', 'Anatomy IV (Lab)', 1, 'A', 7, 50, 'Dr.Faiza', 'Anatomy LAB', NULL, '10:30-12:30', NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 007', NULL, 'MIU.206', 'Mammography & Special Radiological Techniques', 2, 'A', 7, 50, 'Ms.Nimra Altaf', 'GC2', NULL, NULL, '1:00-2:00', NULL, '1:30-2:30', NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 007', NULL, 'MIU.206', 'Mammography & Special Radiological Techniques (Lab)', 1, 'A', 7, 50, 'Ms.Nimra Altaf', 'LAB', NULL, NULL, '2:00-4:00', NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 007', NULL, 'SHS.235', 'General Pharmacology', 3, 'A', 7, 50, 'Dr.Ramish', 'BC4', NULL, NULL, NULL, '10:30-11:30', '10:00-11:00', NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 007', 'DPT,BSMIU', 'MG224', 'Innovation and Entrepreneurship', 3, 'A', 7, 50, 'Dr.Inam', 'BC4', '5', NULL, NULL, '5', NULL, NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 007', NULL, 'SD 210', 'Civics & Community Engagement', 2, 'A', '3,7,10', NULL, 'Mr.Usman Mahmood VF', 'Conf Hall', NULL, NULL, NULL, NULL, '11:30-1:30', NULL, NULL),
  ('BS-MIU Batch 006', 'BSMIU Batch 007', 'DPT,BSMIU,BSNS', 'HND104', 'Biostatistics', 3, 'A', 7, 50, 'Mr.Anwar Maqsood', 'BC3', NULL, NULL, NULL, '11:30-1:00', '8:30-10:00', NULL, NULL),
  ('BS-MIU Batch 008 (3rd Semester)', 'BSMIU Batch 008', NULL, 'SHS.201', 'Anatomy III', 2, 'A', 8, 13, 'Dr.Ramish', 'Conf Hall', '12:00-1:00', NULL, NULL, NULL, '12:00-1:00', NULL, NULL),
  ('BS-MIU Batch 008 (3rd Semester)', 'BSMIU Batch 008', NULL, 'SHS.201', 'Anatomy III (Lab)', 1, 'A', 8, 13, 'Dr.Ramish', 'Anatomy Lab', NULL, '12:00-2:00', NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 008 (3rd Semester)', 'BSMIU Batch 008', NULL, 'MIU.201', 'General Radiology', 2, 'A', 8, 13, 'Dr.Areeb', 'F1C2 & F2C2', '2:30-3:30', NULL, '2:00-3:00', NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 008 (3rd Semester)', 'BSMIU Batch 008', NULL, 'MIU.201', 'General Radiology (Lab)', 1, 'A', 8, 13, 'Dr.Areeb', 'Electro LAB', NULL, '2:00-4:00', NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 008 (3rd Semester)', 'BSMIU Batch 008', NULL, 'SHS.144', 'General Pathology', 3, 'A', 8, 13, 'Ms.Anum', 'GC1 /', NULL, NULL, '3:00-4:00', '11:30-12:30', NULL, NULL, NULL),
  ('BS-MIU Batch 008 (3rd Semester)', 'BSMIU Batch 008', 'BSMIU,BSMLS', 'SD 222', 'Foreign Language', 3, 'A', 8, 13, 'Dr.Falak Shair', 'GC1', '4', NULL, NULL, '4', NULL, NULL, NULL),
  ('BS-MIU Batch 008 (3rd Semester)', 'BSMIU Batch 008', NULL, 'SHS.205', 'Quantitative Skills & Reasoning', '2(1+1)', 'A', 8, 13, 'Dr.Adnan Malik', 'GC1', NULL, NULL, '11:30-1:30', NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 008 (3rd Semester)', 'BSMIU Batch 008', NULL, 'QM111', 'Understanding Society & Socio-Cultural Dynamics', 3, 'A', 8, 13, 'Mr.Usman Mahmood VF', 'BC3', NULL, NULL, NULL, NULL, '1,2', NULL, NULL),
  ('BS-MIU Batch 009 (2nd Semester)', 'BSMIU Batch 009', 'BSMIU,BSNS', 'SHS.107', 'Anatomy II', 3, 'A', 9, '13+10', 'Dr.Faiza', 'F2C4 & GC2', NULL, NULL, '1', NULL, '3', NULL, NULL),
  ('BS-MIU Batch 009 (2nd Semester)', 'BSMIU Batch 009', 'BSMIU,BSNS', 'SHS.107', 'Anatomy II (Lab)', 1, 'A', 9, '13+10', 'Dr.Faiza', 'Anatomy LAB', NULL, NULL, NULL, '4', NULL, NULL, NULL),
  ('BS-MIU Batch 009 (2nd Semester)', 'BSMIU Batch 009', NULL, 'SHS.133', 'Principles of biochemistry / Biochemistry Genetics II', 2, 'A', 9, 13, 'Mr.Fahid Nazir', 'GC2', '11:00-1:00', NULL, NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 009 (2nd Semester)', 'BSMIU Batch 009', NULL, 'SHS.133', 'Principles of biochemistry / Biochemistry Genetics II  (Lab)', 1, 'A', 9, 13, 'Mr.Fahid Nazir', 'Biochem Lab', NULL, '3', NULL, NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 009 (2nd Semester)', 'BSMIU Batch 009', NULL, 'MIU.101', 'Radiation Science', 3, 'A', 9, 13, 'Ms.Nimra Altaf', 'GC3', NULL, NULL, '2', NULL, '2', NULL, NULL),
  ('BS-MIU Batch 009 (2nd Semester)', 'BSMIU Batch 009', NULL, 'EN 123', 'English II', 3, 'A', 9, NULL, 'Ms.Seemab', 'F1C2', NULL, '4', '4', NULL, NULL, NULL, NULL),
  ('BS-MIU Batch 009 (2nd Semester)', 'BSMIU Batch 009', 'BSHEL,,MIU,BSHNS', 'POL-121', 'Pakistan: Ideology,Constitution and Society', 3, 'A', 9, '22+6 +5+13+13', 'Mr.Ghulam Mohiudin', 'F1C6', '5', NULL, NULL, '5', NULL, NULL, NULL),
  ('BS-MIU Batch 009 (2nd Semester)', 'BSMIU Batch 009', 'DPT,MIU,HND', 'CH211', 'Everyday Science', 3, 'A', 9, 15, 'Mr.Messam Shamsi', 'BC6', NULL, NULL, NULL, '2', '1:30-3:30', NULL, NULL),
  ('BSMIU Batch 10  (1st  Semester)', 'BSMIU Batch 10', 'DPT,MLS,MIU', 'SHS.101', 'Anatomy I', 3, 'A', '17,5,10', 'TBA', 'Dr.Sana Tariq', 'BC2', NULL, NULL, '8:30:10:00', NULL, '11:30-1:00', NULL, NULL),
  ('BSMIU Batch 10  (1st  Semester)', 'BSMIU Batch 10', 'DPT,MLS,MIU', 'SHS.101', 'Anatomy I (LAB)', 1, 'A', '17,5,10', 'TBA', 'Dr.Sana Tariq', 'Anatomy LAB', NULL, NULL, NULL, NULL, '2:00-4:00', NULL, NULL),
  ('BSMIU Batch 10  (1st  Semester)', 'BSMIU Batch 10', NULL, 'SHS.132', 'General Physiology', 2, 'A', 10, 'TBA', 'Ms.Nimra Altaf', 'BC6', '10:00-11:00', NULL, '10:00-11:00', NULL, NULL, NULL, NULL),
  ('BSMIU Batch 10  (1st  Semester)', 'BSMIU Batch 10', NULL, 'SHS.132', 'General Physiology (LAB)', 1, 'A', 10, 'TBA', 'Ms.Nimra Altaf', 'Physio Lab', NULL, NULL, NULL, '10:00-11:00', NULL, NULL, NULL),
  ('BSMIU Batch 10  (1st  Semester)', 'BSMIU Batch 10', NULL, 'EN110', 'English I', 3, 'A', 10, 'TBA', 'Ms.Shahneela', 'GC3 & F1C1', NULL, NULL, '11:30-1:00', NULL, '10:00-11:30', NULL, NULL),
  ('BSMIU Batch 10  (1st  Semester)', 'BSMIU Batch 10', 'MLS,MIU', 'ISL-112', 'Islamic Thought & Perspectives/Ethics', 2, 'A', 10, 'TBA', 'Dr.Naeem Qaiser', 'BC2', '12:00-1:00', NULL, NULL, '12:00-1:00', NULL, NULL, NULL),
  ('BSMIU Batch 10  (1st  Semester)', 'BSMIU Batch 10', 'DPT,MLS,MIU,BSNS', 'ITC 111', 'Understanding of Holy Quran (Fahm ul Quran)', 1, 'A', '17,5,10,3', 'TBA', 'Dr.Naeem Qaiser', 'BC2', '11:30-12:00', NULL, NULL, '11:30-12:00', NULL, NULL, NULL),
  ('BSMIU Batch 10  (1st  Semester)', 'BSMIU Batch 10', 'MIU', 'ISL-135', 'Computer Applications', 2, 'A', 10, 'TBA', NULL, 'Conf. Hall', NULL, '5', NULL, NULL, NULL, NULL, NULL),
  ('BSMIU Batch 10  (1st  Semester)', 'BSMIU Batch 10', 'MIU', 'ISL-135', 'Computer Applications (LAB)', 1, 'A', 10, 'TBA', NULL, 'LAB', NULL, '2', NULL, NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 006', 'BSNS Batch 6', 'DPT,BSNS', 'SHS.504', 'Scientific Inquiry & Research Methodology', 3, 'A', '10,6', '10+45', 'Mr.Yahya', 'BC1', NULL, '3', NULL, NULL, '2', NULL, NULL),
  ('Program BSNS Batch 006', 'BSNS Batch 6', NULL, 'SHS-490', 'Research project for allied health sciences', 6, 'A', 6, 45, '-', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 006', 'BSNS Batch 6', NULL, 'SHS.426', 'Public health nutrition', 3, 'A', 6, 45, NULL, 'BC3 & BC5', NULL, '1', NULL, NULL, '5', NULL, NULL),
  ('Program BSNS Batch 006', 'BSNS Batch 6', NULL, 'SHS.518', 'Dietetics III', 3, 'A', 6, 45, 'Ms.Wajeeha', 'BC5', NULL, '4', NULL, NULL, '12:30-2:00', NULL, NULL),
  ('Program BSNS Batch 006', 'BSNS Batch 6', NULL, 'SHS.480', 'Supervised Clinical Practice IV', 3, 'A', 6, 45, 'Mr.Messam Shamsi', 'Bethania Hospital Practice', '9:00-4:00', NULL, NULL, NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 006', 'BSNS Batch 7', NULL, 'SHS.505', 'Professional Practice (Law, Ethics & Administration)', 2, 'A', 7, 7, 'Ms.Maham VF', 'BC2', NULL, '2:30-3:30', NULL, NULL, '1:00-2:00', NULL, NULL),
  ('Program BSNS Batch 006', 'BSNS Batch 7', NULL, 'SHS.508', 'Nutrition and exercise Physiology', 2, 'A', 7, 7, 'Mr.Fahid Nazir', 'BC3', NULL, NULL, '10:30-12:30', NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 006', 'BSNS Batch 7', NULL, 'SHS.515', 'Nutrient and Drug Interaction', 3, 'A', 7, 7, 'Mr.Yahya', 'BC3', '11:30-1:00', NULL, '5', NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 006', 'BSNS Batch 7', NULL, 'SHS.517', 'Community Project', 2, 'A', 7, 7, 'Ms.Wajeeha', 'BC6', '2:00-4:00', NULL, NULL, NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 006', 'BSNS Batch 7', NULL, 'SHS.514', 'Critical care & Emergency Nutrition', 3, 'A', 7, 7, 'Ms.Wajeeha', 'BC4', '3', NULL, '4', NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 006', 'BSNS Batch 7', NULL, 'SHS.470', 'Supervised Clinical Practice III', 3, 'A', 7, 7, 'Mr.Fahid Nazir', 'Bethania Hospital Practice', NULL, NULL, NULL, '9:00:4:00', NULL, NULL, NULL),
  ('Program BSNS Batch 006', 'BSNS Batch 7', NULL, 'SHS.516', 'Dietetics II', 3, 'A', 7, 7, 'Mr.Messam Shamsi', 'BC4', NULL, '4', NULL, NULL, '2', NULL, NULL),
  ('Program BSNS Batch 008', 'BSNS Batch 8', 'BSMIU,BSNS', 'SHS.317', 'Pathology II', 2, 'A', 8, 45, 'Dr.Khadija', 'BC1', '11:30-12:30', '1:00-2:00', NULL, NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 008', 'BSNS Batch 8', 'DPT,BSNS', 'SHS.318', 'Microbiology II', 2, 'A', 8, 45, 'Mr.Yahya', 'BC3', NULL, '2:00-3:00', NULL, '2:30-3:30', NULL, NULL, NULL),
  ('Program BSNS Batch 008', 'BSNS Batch 8', NULL, 'SHS.504', 'Scientific inquiry and research methodology', 2, 'A', 8, 45, 'Mr.Usman Habib', 'BC5  & BC6', '2:30-3:30', NULL, NULL, NULL, '1:00-2:00', NULL, NULL),
  ('Program BSNS Batch 008', 'BSNS Batch 8', NULL, 'SHS.406', 'Community Nutrition', 2, 'A', 8, 45, 'Mr.Messam Shamsi', 'Nutrition Lab', NULL, NULL, NULL, '12:30-2:30', NULL, NULL, NULL),
  ('Program BSNS Batch 008', 'BSNS Batch 8', NULL, 'SHS.406', 'Community Nutrition (Lab)', 1, 'A', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 008', 'BSNS Batch 8', NULL, 'SHS.360', 'Supervised Clinical Practice II', 3, 'A', 8, 45, 'Mr.Usman Habib', 'Bethania Hospital Practice', NULL, NULL, '9:00-4:00', NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 008', 'BSNS Batch 8', NULL, 'SHS.320', 'Virology & Parasitology', 3, 'A', 8, 45, 'Mr.Yahya', 'Nutrition Lab', NULL, NULL, NULL, NULL, '11:00-1:00', NULL, NULL),
  ('Program BSNS Batch 008', 'BSNS Batch 8', NULL, 'SHS.437', 'Dietetics I', 3, 'A', 8, 45, 'Ms.Wajeeha', 'BC4 & BC5', '4', NULL, NULL, '8:30-10:00', NULL, NULL, NULL),
  ('Program BSNS Batch 008', 'BSNS Batch 8', NULL, 'SHS.437', 'Dietetics I (Lab)', 3, 'A', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 009', 'BSNS Batch 9', NULL, 'SHS.301', 'Pathology & Microbiology I', 3, 'A', '14,9', 7, 'Dr.Hamza', 'F1C5', NULL, NULL, '3', '3', NULL, NULL, NULL),
  ('Program BSNS Batch 009', 'BSNS Batch 9', NULL, 'SHS.435', 'Nutrigenomics', 2, 'A', 9, 7, 'Mr.Fahid Nazir', 'BC3 & F1C2', '1:00-2:30', NULL, '1', NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 009', 'BSNS Batch 9', NULL, 'SHS.435', 'Nutrigenomics (Lab)', 1, 'A', 9, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 009', 'BSNS Batch 9', NULL, 'SHS.319', 'Food Toxicology & Safety', 3, 'A', 9, 7, 'Mr.Yahya', 'F1C2', '2', NULL, '2', NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 009', 'BSNS Batch 9', NULL, 'SHS.307', 'Food Processing & Preservation', 2, 'A', 9, 7, 'Mr.Yahya', 'F1C2', '3', NULL, NULL, NULL, '1', NULL, NULL),
  ('Program BSNS Batch 009', 'BSNS Batch 9', NULL, 'SHS.307', 'Food Processing & Preservation (Lab)', 1, 'A', 9, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 009', 'BSNS Batch 9', NULL, 'SHS.350', 'Supervised Clinical Practice I', 3, 'A', 9, 7, 'Mr.Messam Shamsi', 'Bethania Hospital Practice', NULL, '8:30-11:30', NULL, NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 009', 'BSNS Batch 9', NULL, 'SHS.327', 'Meal Management', 2, 'A', 9, 7, 'Ms.Wajeeha', 'F1C2', NULL, NULL, NULL, '5', '10:00-11:00', NULL, NULL),
  ('Program BSNS Batch 009', 'BSNS Batch 9', NULL, 'SHS.327', 'Meal Management (Lab)', 1, 'A', 9, 7, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 10', 'BSNS Batch 10', NULL, 'SD 210', 'Civics & Community Engagement', 2, 'A', '3,7,10', 30, 'Mr.Usman Mahmood VF', 'Conf Hall', NULL, NULL, NULL, NULL, '11:30-1:30', NULL, NULL),
  ('Program BSNS Batch 10', 'BSNS Batch 10', 'DPT,BSMIU,BSNS', 'HND104', 'Biostatistics', 3, 'A', '14,6,10', '22+12+11+7', 'Mr.Anwar Maqsood', 'BC3', NULL, NULL, NULL, '11:30-1:00', '8:30-10:00', NULL, NULL),
  ('Program BSNS Batch 10', 'BSNS Batch 10', 'DPT,BSMIU,BSNS', 'MG224', 'Innovation and Entrepreneurship', 3, 'A', '15,16,17,10', '22+5+5+7', 'Dr.Inam', 'F1C3', NULL, NULL, NULL, NULL, '4,5', NULL, NULL),
  ('Program BSNS Batch 10', 'BSNS Batch 10', NULL, 'SHS.207', 'Principles of human nutrition', 2, 'A', 10, 22, 'Ms.Wajeeha', 'BC5', NULL, NULL, '2:30-4:30', NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 10', 'BSNS Batch 10', NULL, 'SHS.207', 'Principles of human nutrition (Lab)', 1, 'A', 10, 22, 'Ms.Wajeeha', 'Nutrition Lab', NULL, '2:30-4:30', NULL, NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 10', 'BSNS Batch 10', NULL, 'SHS.214', 'Introducation to food science', 2, 'A', 10, 22, 'Mr.Usman Habib', 'Nutrition Lab', NULL, '10:00-11:00', NULL, '1:00-2:00', NULL, NULL, NULL),
  ('Program BSNS Batch 10', 'BSNS Batch 10', NULL, 'SHS.214', 'Introducation to food science (Lab)', 1, 'A', 10, 22, 'Mr.Usman Habib', 'Nutrition Lab', NULL, NULL, NULL, '2', NULL, NULL, NULL),
  ('Program BSNS Batch 10', 'BSNS Batch 10', NULL, 'SHS.215', 'Developmental Nutrition', 2, 'A', 10, 22, 'Mr.Usman Habib', 'Nutrition Lab', NULL, '12:00-1:00', '1:00-2:00', NULL, NULL, NULL, NULL),
  ('Program BSNS Batch 10', 'BSNS Batch 10', NULL, 'SHS.215', 'Developmental Nutrition (Lab)', 1, 'A', 10, 22, 'Mr.Usman Habib', 'Nutrition Lab', NULL, NULL, NULL, NULL, '2', NULL, NULL),
  ('Program BSHND Batch 010 (3rd Semester)', 'BSHND Batch 1', 'DPT,MLS,BSNS', 'SOC-102', 'Understanding Society & Socio-Cultural Dynamics', 3, 'A', '14,3,10', '12+10+35', 'Mr.Usman Mahmood VF', 'BC6', NULL, NULL, NULL, '1', '3', NULL, NULL),
  ('Program BSHND Batch 010 (3rd Semester)', 'BSHND Batch 1', 'BSNS,MLS', 'SHS.202', 'Physiology III', 2, 'A', '10,3', '33+10', 'Mr.Usman Habib', 'BC4 & GC1', '10:00-11:00', '1:00-2:00', NULL, NULL, NULL, NULL, NULL),
  ('Program BSHND Batch 010 (3rd Semester)', 'BSHND Batch 1', 'BSNS,MLS', 'SHS.202', 'Physiology III (Lab)', 1, 'A', '10,3', '33+10', 'Mr.Usman Habib', 'BC4', '3', NULL, NULL, NULL, NULL, NULL, NULL),
  ('Program BSHND Batch 010 (3rd Semester)', 'BSHND Batch 1', NULL, 'SHS.203', 'Biochemistary and Genetics III', 2, 'A', 10, 35, 'Ms.Ruba Shahid', 'BC5 & BC3', NULL, NULL, '11:30-12:30', NULL, '1:00-2:00', NULL, NULL),
  ('Program BSHND Batch 010 (3rd Semester)', 'BSHND Batch 1', 'DPT,BSNS', 'SD.222', 'Foreign Language', 3, 'A', '15,10', '33+33', 'Dr.Naeem Qaiser', 'Conf Hall', NULL, '2:30-4:00', NULL, '1:00-2:30', NULL, NULL, NULL),
  ('Program BSHND Batch 010 (3rd Semester)', 'BSHND Batch 1', 'BSCPSY,MLS,BSNS', 'QM.111', 'Quantitative Skills & Reasoning', 3, 'A', '6,3,10', '35+10+33', 'Dr.Kashif', 'Conf Hall', NULL, NULL, NULL, '2', '2', NULL, NULL),
  ('Program BSHND Batch 010 (3rd Semester)', 'BSHND Batch 1', NULL, 'SHS.113', 'Intro to Nutrition Sciences', 2, 'A', 10, 35, 'Mr.Fahid Nazir', 'BC1', NULL, NULL, '12:30-2:00', NULL, NULL, NULL, NULL),
  ('Program BSHND Batch 010 (3rd Semester)', 'BSHND Batch 1', NULL, 'SHS.113', 'Intro to Nutrition Sciences (Lab)', 1, 'A', 10, 35, 'Mr.Fahid Nazir', 'Nutrition Lab', NULL, NULL, NULL, NULL, '1', NULL, NULL),
  ('Program BS-HND Batch 02', 'BS-HND Batch 2', NULL, NULL, 'Quantitative Reasoning-II', '3 (3-0)', NULL, '8,11', '13+10', 'Dr.Faiza', 'F2C4 & GC2', NULL, NULL, '1', NULL, '3', NULL, NULL),
  ('Program BS-HND Batch 02', 'BS-HND Batch 2', NULL, 'SOC102', 'Social Science', '2 (2-0)', NULL, '8,11', '13+10', 'Dr.Faiza', 'Anatomy LAB', NULL, NULL, NULL, '4', NULL, NULL, NULL),
  ('Program BS-HND Batch 02', 'BS-HND Batch 2', NULL, 'EN 123', 'Expository Writing', '3 (3-0)', NULL, 11, 10, 'TBA', 'BC1 & F1C5', NULL, '2:15-3:15', NULL, NULL, '2', NULL, NULL),
  ('Program BS-HND Batch 02', 'BS-HND Batch 2', NULL, 'CH 211', 'Natural Science', 2, NULL, 11, 10, 'TBA', 'Physio Lab', NULL, NULL, '11:00-1:00 (LAB)', NULL, NULL, NULL, NULL),
  ('Program BS-HND Batch 02', 'BS-HND Batch 2', NULL, 'CH 211', 'Natural Science (Lab)', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Program BS-HND Batch 02', 'BS-HND Batch 2', NULL, 'ND.101', 'Fundamentals of Human Nutrition and Dietetics', 3, NULL, 11, 10, 'Mr.Fahid Nazir', 'GC2', '11:00-1:00', NULL, NULL, NULL, NULL, NULL, NULL),
  ('Program BS-HND Batch 02', 'BS-HND Batch 2', NULL, 'ND.102', 'Macro and micro nutrients', 3, NULL, 11, 10, 'Mr.Fahid Nazir', 'Biochem Lab', NULL, NULL, NULL, NULL, '34', NULL, NULL),
  ('Program BS-HND Batch 02', 'BS-HND Batch 2', NULL, 'ND.103', 'food microbiology and biotechnology', 3, NULL, '16,5,8,11', '5+13+13+10', 'Ms.Seemab', 'F1C2', NULL, '4', '4', NULL, NULL, NULL, NULL),
  ('Program BS-HND Batch 003 (1st Semester)', 'BS-HND Batch003', NULL, 'HND.103', 'Human Anatomy', 2, 'A', 2, 26, 'Dr.Sana Tariq', 'BC2', NULL, NULL, '2:30-3:30', NULL, '1:00-2:00', NULL, NULL),
  ('Program BS-HND Batch 003 (1st Semester)', 'BS-HND Batch003', NULL, 'HND.103', 'Human Anatomy (Lab)', 1, NULL, NULL, 26, 'Dr.Sana Tariq', 'Anatomy Lab', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Program BS-HND Batch 003 (1st Semester)', 'BS-HND Batch003', 'BSHEL,BSHND', 'QM 111', 'Quantitative & Reasoning', 3, 'A', '15,16,17,2', '22++6+5+26', 'Dr.Kashif', 'Conf Hall', NULL, NULL, NULL, '1', '1', NULL, NULL),
  ('Program BS-HND Batch 003 (1st Semester)', 'BS-HND Batch003', NULL, 'FST 1102', 'Introduction to food Science & Technology', 2, 'A', 12, 26, 'Mr.Usman Habib', 'BC6 & Nutrition Lab', NULL, '10:00-11:00', NULL, '1:00-2:00', NULL, NULL, NULL),
  ('Program BS-HND Batch 003 (1st Semester)', 'BS-HND Batch003', NULL, 'FST 1102', 'Introduction to food Science & Technology (Lab)', 1, 'A', 12, 26, 'Mr.Usman Habib', 'Nutrition Lab', NULL, NULL, NULL, '2', NULL, NULL, NULL),
  ('Program BS-HND Batch 003 (1st Semester)', 'BS-HND Batch003', 'DPT,BSHNS', 'EN110', 'English I (Functional English )', 3, 'A', '16,2', '22+26', 'Ms.Mishal', 'BC2', NULL, NULL, '11:30-1:00', NULL, '10:00-11:30', NULL, NULL),
  ('Program BS-HND Batch 003 (1st Semester)', 'BS-HND Batch003', 'DPT,MLS,MIU,BSNS', 'ND.101', 'Fundamentals of Human Nutrition and Dietetics', 1, 'A', '16,4,9,12', 26, 'Dr.Naeem Qaiser', 'BC2', '11:30-12:00', NULL, NULL, '11:30-12:00', NULL, NULL, NULL),
  ('Program BS-HND Batch 003 (1st Semester)', 'BS-HND Batch003', 'BSCPSY,MLS,HND', 'ISL-135', 'Application of ITC /Computer Applications', 3, 'A', '4,4,2', '22+15+26', 'Engr.Saad', 'BC2', NULL, '11:30-2:30', NULL, NULL, NULL, NULL, NULL);