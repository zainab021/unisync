-- =====================================================================
-- UniSync Demo Data — Complete Setup
-- Run this in pgAdmin after all tables are created
-- Sets up: Teacher Sara Ahmed + Student Ayesha Khan with full data
-- =====================================================================

-- ── STEP 1: Fix duplicate slots (if any) ────────────────────────────
DELETE FROM slots WHERE id NOT IN (
  SELECT MIN(id) FROM slots GROUP BY slot_name
);

-- ── STEP 2: Update Teacher Profile ──────────────────────────────────
UPDATE teachers
SET department  = 'Computer Science',
    designation = 'Assistant Professor',
    phone       = '+92-300-1234567',
    office      = 'CS Building, Room 205'
WHERE id = 'FAC-2026-0001';

-- ── STEP 3: Update Student Profile ──────────────────────────────────
UPDATE students
SET program  = 'BS Computer Science',
    semester = 5,
    cgpa     = 3.72,
    status   = 'Active'
WHERE id = 'BSCS-2024-0142';

-- ── STEP 4: Add Courses (assigned to Sara Ahmed) ────────────────────
INSERT INTO courses (code, name, department, teacher_id, credits, status) VALUES
('CS301', 'Database Systems',           'CS', 'FAC-2026-0001', 3, 'Active'),
('CS302', 'Data Structures',            'CS', 'FAC-2026-0001', 3, 'Active'),
('CS303', 'Computer Networks',          'CS', 'FAC-2026-0001', 2, 'Active'),
('CS304', 'Object Oriented Programming','CS', 'FAC-2026-0001', 3, 'Active'),
('MT201', 'Linear Algebra',             'CS', 'FAC-2026-0001', 3, 'Active')
ON CONFLICT (code) DO UPDATE
  SET teacher_id = EXCLUDED.teacher_id,
      name       = EXCLUDED.name,
      credits    = EXCLUDED.credits;

-- ── STEP 5: Enroll Ayesha in All 5 Courses ──────────────────────────
INSERT INTO enrollments (student_id, course_code, semester, status)
VALUES
('BSCS-2024-0142', 'CS301', 'Spring 2026', 'Enrolled'),
('BSCS-2024-0142', 'CS302', 'Spring 2026', 'Enrolled'),
('BSCS-2024-0142', 'CS303', 'Spring 2026', 'Enrolled'),
('BSCS-2024-0142', 'CS304', 'Spring 2026', 'Enrolled'),
('BSCS-2024-0142', 'MT201', 'Spring 2026', 'Enrolled')
ON CONFLICT (student_id, course_code, semester) DO NOTHING;

-- ── STEP 6: Assign Timetable ─────────────────────────────────────────
-- First get room IDs and slot IDs dynamically
DO $$
DECLARE
  r_cs201  INT; r_cs305 INT; r_cs410 INT; r_h101 INT; r_m105 INT;
  s1 INT; s2 INT; s3 INT; s4 INT; s5 INT;
  t_id     VARCHAR := 'FAC-2026-0001';
BEGIN
  SELECT id INTO r_cs201 FROM rooms WHERE room_name='CS-201' LIMIT 1;
  SELECT id INTO r_cs305 FROM rooms WHERE room_name='CS-305' LIMIT 1;
  SELECT id INTO r_cs410 FROM rooms WHERE room_name='CS-410' LIMIT 1;
  SELECT id INTO r_h101  FROM rooms WHERE room_name='H-101'  LIMIT 1;
  SELECT id INTO r_m105  FROM rooms WHERE room_name='M-105'  LIMIT 1;
  SELECT id INTO s1 FROM slots WHERE slot_name='Slot 1' LIMIT 1;
  SELECT id INTO s2 FROM slots WHERE slot_name='Slot 2' LIMIT 1;
  SELECT id INTO s3 FROM slots WHERE slot_name='Slot 3' LIMIT 1;
  SELECT id INTO s4 FROM slots WHERE slot_name='Slot 4' LIMIT 1;
  SELECT id INTO s5 FROM slots WHERE slot_name='Slot 5' LIMIT 1;

  -- CS301 Database Systems — Mon Slot1 + Wed Slot1
  INSERT INTO timetables (course_code, teacher_id, room_id, day, slot_id)
  VALUES ('CS301', t_id, r_cs201, 'Monday',    s1) ON CONFLICT DO NOTHING;
  INSERT INTO timetables (course_code, teacher_id, room_id, day, slot_id)
  VALUES ('CS301', t_id, r_cs201, 'Wednesday', s1) ON CONFLICT DO NOTHING;

  -- CS302 Data Structures — Tue Slot2 + Thu Slot2
  INSERT INTO timetables (course_code, teacher_id, room_id, day, slot_id)
  VALUES ('CS302', t_id, r_cs305, 'Tuesday',  s2) ON CONFLICT DO NOTHING;
  INSERT INTO timetables (course_code, teacher_id, room_id, day, slot_id)
  VALUES ('CS302', t_id, r_cs305, 'Thursday', s2) ON CONFLICT DO NOTHING;

  -- CS303 Computer Networks — Mon Slot3 + Fri Slot3
  INSERT INTO timetables (course_code, teacher_id, room_id, day, slot_id)
  VALUES ('CS303', t_id, r_cs410, 'Monday', s3) ON CONFLICT DO NOTHING;
  INSERT INTO timetables (course_code, teacher_id, room_id, day, slot_id)
  VALUES ('CS303', t_id, r_cs410, 'Friday', s3) ON CONFLICT DO NOTHING;

  -- CS304 OOP — Wed Slot4 + Fri Slot4
  INSERT INTO timetables (course_code, teacher_id, room_id, day, slot_id)
  VALUES ('CS304', t_id, r_h101, 'Wednesday', s4) ON CONFLICT DO NOTHING;
  INSERT INTO timetables (course_code, teacher_id, room_id, day, slot_id)
  VALUES ('CS304', t_id, r_h101, 'Friday',    s4) ON CONFLICT DO NOTHING;

  -- MT201 Linear Algebra — Tue Slot5 + Thu Slot5
  INSERT INTO timetables (course_code, teacher_id, room_id, day, slot_id)
  VALUES ('MT201', t_id, r_m105, 'Tuesday',  s5) ON CONFLICT DO NOTHING;
  INSERT INTO timetables (course_code, teacher_id, room_id, day, slot_id)
  VALUES ('MT201', t_id, r_m105, 'Thursday', s5) ON CONFLICT DO NOTHING;
END $$;

-- ── STEP 7: Attendance Records (Ayesha — 20 days) ───────────────────
INSERT INTO attendance (student_id, course_code, date, status, marked_by)
VALUES
-- CS301 Database Systems
('BSCS-2024-0142','CS301','2026-03-02','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-04','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-09','Absent', 'FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-11','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-16','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-18','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-23','Leave',  'FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-25','Present','FAC-2026-0001'),
-- CS302 Data Structures
('BSCS-2024-0142','CS302','2026-03-03','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS302','2026-03-05','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS302','2026-03-10','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS302','2026-03-12','Absent', 'FAC-2026-0001'),
('BSCS-2024-0142','CS302','2026-03-17','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS302','2026-03-19','Present','FAC-2026-0001'),
-- CS303 Computer Networks
('BSCS-2024-0142','CS303','2026-03-02','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS303','2026-03-06','Absent', 'FAC-2026-0001'),
('BSCS-2024-0142','CS303','2026-03-09','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS303','2026-03-13','Present','FAC-2026-0001'),
-- CS304 OOP
('BSCS-2024-0142','CS304','2026-03-04','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS304','2026-03-06','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS304','2026-03-11','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS304','2026-03-13','Leave',  'FAC-2026-0001'),
-- MT201 Linear Algebra
('BSCS-2024-0142','MT201','2026-03-03','Present','FAC-2026-0001'),
('BSCS-2024-0142','MT201','2026-03-05','Present','FAC-2026-0001'),
('BSCS-2024-0142','MT201','2026-03-10','Absent', 'FAC-2026-0001'),
('BSCS-2024-0142','MT201','2026-03-12','Present','FAC-2026-0001')
ON CONFLICT (student_id, course_code, date) DO NOTHING;

-- ── STEP 8: Grades ───────────────────────────────────────────────────
INSERT INTO grades (student_id, course_code, semester, quiz, mid, assignment, final, submitted)
VALUES
('BSCS-2024-0142','CS301','Spring 2026', 17, 26, 9,  36, true),
('BSCS-2024-0142','CS302','Spring 2026', 18, 24, 8,  32, true),
('BSCS-2024-0142','CS303','Spring 2026', 15, 22, 7,  30, true),
('BSCS-2024-0142','CS304','Spring 2026', 19, 27, 10, 38, true),
('BSCS-2024-0142','MT201','Spring 2026', 16, 25, 9,  34, true)
ON CONFLICT (student_id, course_code, semester) DO UPDATE
  SET quiz=EXCLUDED.quiz, mid=EXCLUDED.mid,
      assignment=EXCLUDED.assignment, final=EXCLUDED.final, submitted=true;

-- ── STEP 9: Fee Record ───────────────────────────────────────────────
INSERT INTO fees (id, student_id, semester, amount, due_date, status, paid_on)
VALUES
('FEE-2026-001','BSCS-2024-0142','Spring 2026', 45000, '2026-02-15', 'Paid',    '2026-02-10'),
('FEE-2026-002','BSCS-2024-0142','Fall 2025',   45000, '2025-09-15', 'Paid',    '2025-09-12'),
('FEE-2026-003','BSCS-2024-0142','Summer 2026', 20000, '2026-07-01', 'Pending', NULL)
ON CONFLICT (id) DO NOTHING;

-- ── STEP 10: Notices ─────────────────────────────────────────────────
INSERT INTO notices (title, body, category, priority, posted_by)
SELECT 'Mid-Term Exam Schedule Released', 'Mid-term exams will be held from April 1-7, 2026. Check your timetable for details.', 'Academic', 'High', id FROM users WHERE role='admin' LIMIT 1;

INSERT INTO notices (title, body, category, priority, posted_by)
SELECT 'Spring 2026 Fee Submission Deadline', 'Last date to submit semester fee is February 15, 2026. Late fee will be charged after the deadline.', 'Finance', 'High', id FROM users WHERE role='admin' LIMIT 1;

INSERT INTO notices (title, body, category, priority, posted_by)
SELECT 'Library Timing Update', 'Library will now remain open until 9:00 PM on weekdays. Weekend timings remain unchanged.', 'Library', 'Medium', id FROM users WHERE role='admin' LIMIT 1;

INSERT INTO notices (title, body, category, priority, posted_by)
SELECT 'Annual Sports Week 2026', 'Annual Sports Week will be held from March 20-24, 2026. Register your teams by March 15.', 'Event', 'Medium', id FROM users WHERE role='admin' LIMIT 1;

INSERT INTO notices (title, body, category, priority, posted_by)
SELECT 'Result Announcement — Fall 2025', 'Fall 2025 semester results have been announced. Visit the student portal to view your grades.', 'Academic', 'High', id FROM users WHERE role='admin' LIMIT 1;

-- ── STEP 11: Events ──────────────────────────────────────────────────
INSERT INTO calendar_events (title, date, end_date, category, color, created_by)
SELECT 'Mid-Term Exams',       '2026-04-01', '2026-04-07', 'Exam',     'rose',    id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title, date, end_date, category, color, created_by)
SELECT 'Annual Sports Week',   '2026-03-20', '2026-03-24', 'Sports',   'emerald', id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title, date, end_date, category, color, created_by)
SELECT 'Eid ul Adha Holiday',  '2026-06-16', '2026-06-19', 'Holiday',  'amber',   id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title, date, end_date, category, color, created_by)
SELECT 'Final Exams',          '2026-05-20', '2026-05-30', 'Exam',     'rose',    id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title, date, end_date, category, color, created_by)
SELECT 'University Convocation','2026-07-15','2026-07-15', 'Academic', 'violet',  id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title, date, end_date, category, color, created_by)
SELECT 'Independence Day',     '2026-08-14', '2026-08-14', 'Holiday',  'emerald', id FROM users WHERE role='admin' LIMIT 1;

-- ── STEP 12: Upcoming Exam ───────────────────────────────────────────
INSERT INTO exams (subject, course_code, date, time, venue, duration, invigilator, type)
VALUES
('Database Systems Mid-Term', 'CS301', '2026-04-02', '09:00 AM', 'Exam Hall A', '2 Hours', 'FAC-2026-0001', 'Mid Term'),
('Data Structures Mid-Term',  'CS302', '2026-04-03', '11:00 AM', 'Exam Hall B', '2 Hours', 'FAC-2026-0001', 'Mid Term'),
('Computer Networks Quiz',    'CS303', '2026-04-04', '02:00 PM', 'CS-201',      '1 Hour',  'FAC-2026-0001', 'Quiz'),
('OOP Final Exam',            'CS304', '2026-05-22', '09:00 AM', 'Main Hall',   '3 Hours', 'FAC-2026-0001', 'Final'),
('Linear Algebra Final',      'MT201', '2026-05-25', '02:00 PM', 'H-101',       '3 Hours', 'FAC-2026-0001', 'Final')
ON CONFLICT DO NOTHING;

-- ── STEP 13: Library Books ───────────────────────────────────────────
INSERT INTO library_books (title, author, category, isbn, total_copies, available_copies, location)
VALUES
('Database System Concepts',         'Silberschatz, Korth',     'Computer Science', '978-0-07-802215-9', 5, 3, 'Section A, Shelf 2'),
('Introduction to Algorithms',       'Cormen, Leiserson',       'Computer Science', '978-0-26-204630-5', 4, 2, 'Section A, Shelf 3'),
('Computer Networks',                'Andrew Tanenbaum',        'Computer Science', '978-0-13-212695-3', 6, 4, 'Section A, Shelf 4'),
('Object Oriented Design',           'Grady Booch',             'Computer Science', '978-0-20-189551-5', 3, 3, 'Section B, Shelf 1'),
('Linear Algebra Done Right',        'Sheldon Axler',           'Mathematics',      '978-3-31-907941-0', 4, 1, 'Section C, Shelf 2'),
('Discrete Mathematics',             'Kenneth Rosen',           'Mathematics',      '978-0-07-338309-5', 5, 5, 'Section C, Shelf 3'),
('Clean Code',                       'Robert C. Martin',        'Computer Science', '978-0-13-235088-4', 3, 2, 'Section B, Shelf 2'),
('The Pragmatic Programmer',         'Andrew Hunt, David Thomas','Computer Science', '978-0-13-595705-9', 2, 2, 'Section B, Shelf 3'),
('Artificial Intelligence: A Guide', 'Nils Nilsson',            'Computer Science', '978-0-12-520711-3', 3, 0, 'Section A, Shelf 5'),
('Engineering Mathematics',          'K.A. Stroud',             'Mathematics',      '978-1-13-726562-1', 6, 4, 'Section C, Shelf 1')
ON CONFLICT DO NOTHING;

-- ── DONE ─────────────────────────────────────────────────────────────
SELECT 'Demo data loaded successfully!' AS status;
SELECT 'Teacher: sara.ahmed@university.edu / password: teacher123' AS teacher_login;
SELECT 'Student: ayesha.khan@university.edu / password: teacher123' AS student_login;
