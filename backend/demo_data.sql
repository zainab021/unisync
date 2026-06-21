-- =====================================================================
-- UniSync Demo Data
-- Run in pgAdmin: Open file -> F5
-- =====================================================================

-- Departments
INSERT INTO departments (id, name, hod, programs, teachers_count, students_count) VALUES
('CS', 'Computer Science',        'Dr. Khalid Mahmood', 4, 5, 120),
('SE', 'Software Engineering',    'Dr. Nadia Hassan',   2, 3,  80),
('AI', 'Artificial Intelligence', 'Dr. Umair Muneer',   2, 2,  60)
ON CONFLICT (id) DO UPDATE SET hod=EXCLUDED.hod;

-- Room Types
INSERT INTO roomtypes (type_name) VALUES ('Classroom'), ('Lab'), ('Hall')
ON CONFLICT DO NOTHING;

-- Rooms
INSERT INTO rooms (room_name, room_type_id, capacity)
SELECT 'CS-201', id, 40  FROM roomtypes WHERE type_name='Classroom' ON CONFLICT (room_name) DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity)
SELECT 'CS-305', id, 35  FROM roomtypes WHERE type_name='Classroom' ON CONFLICT (room_name) DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity)
SELECT 'CS-410', id, 40  FROM roomtypes WHERE type_name='Classroom' ON CONFLICT (room_name) DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity)
SELECT 'Lab-1',  id, 30  FROM roomtypes WHERE type_name='Lab'       ON CONFLICT (room_name) DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity)
SELECT 'Lab-3',  id, 30  FROM roomtypes WHERE type_name='Lab'       ON CONFLICT (room_name) DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity)
SELECT 'H-101',  id, 120 FROM roomtypes WHERE type_name='Hall'      ON CONFLICT (room_name) DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity)
SELECT 'M-105',  id, 45  FROM roomtypes WHERE type_name='Classroom' ON CONFLICT (room_name) DO NOTHING;

-- Time Slots
INSERT INTO slots (slot_name, start_time, end_time) VALUES
('Slot 1', '08:00', '09:30'), ('Slot 2', '09:30', '11:00'),
('Slot 3', '11:00', '12:30'), ('Slot 4', '13:00', '14:30'),
('Slot 5', '14:30', '16:00'), ('Slot 6', '16:00', '17:30')
ON CONFLICT DO NOTHING;

-- Remove duplicate slots
DELETE FROM slots WHERE id NOT IN (
  SELECT MIN(id) FROM slots GROUP BY slot_name
);

-- Admin User (password: password)
INSERT INTO users (name, email, password_hash, role, avatar) VALUES
('Admin', 'admin@university.edu',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'AD')
ON CONFLICT (email) DO NOTHING;

-- Teacher: Sara Ahmed (password: teacher123)
WITH u AS (
  INSERT INTO users (name, email, password_hash, role, avatar)
  VALUES ('Dr. Sara Ahmed', 'sara.ahmed@university.edu',
    '$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC', 'teacher', 'SA')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id
)
INSERT INTO teachers (id, user_id, name, department, designation, phone, office)
SELECT 'FAC-2026-0001', id, 'Dr. Sara Ahmed', 'Computer Science', 'Assistant Professor',
       '+92-300-1234567', 'CS Block, Room 205' FROM u
ON CONFLICT (id) DO UPDATE SET department=EXCLUDED.department, designation=EXCLUDED.designation;

-- Student: Ayesha Khan (password: teacher123)
WITH u AS (
  INSERT INTO users (name, email, password_hash, role, avatar)
  VALUES ('Ayesha Khan', 'ayesha.khan@university.edu',
    '$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC', 'student', 'AK')
  ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id
)
INSERT INTO students (id, user_id, name, program, semester, cgpa, status)
SELECT 'BSCS-2024-0142', id, 'Ayesha Khan', 'BS Computer Science', 5, 3.72, 'Active' FROM u
ON CONFLICT (id) DO UPDATE SET cgpa=EXCLUDED.cgpa, semester=EXCLUDED.semester;

-- Courses
INSERT INTO courses (code, name, department, teacher_id, credits, status) VALUES
('CS301', 'Database Systems',            'CS', 'FAC-2026-0001', 3, 'Active'),
('CS302', 'Data Structures',             'CS', 'FAC-2026-0001', 3, 'Active'),
('CS303', 'Computer Networks',           'CS', 'FAC-2026-0001', 2, 'Active'),
('CS304', 'Object Oriented Programming', 'CS', 'FAC-2026-0001', 3, 'Active'),
('MT201', 'Linear Algebra',              'CS', 'FAC-2026-0001', 3, 'Active')
ON CONFLICT (code) DO UPDATE SET teacher_id=EXCLUDED.teacher_id, name=EXCLUDED.name;

-- Enroll Ayesha
INSERT INTO enrollments (student_id, course_code, semester, status) VALUES
('BSCS-2024-0142', 'CS301', 'Spring 2026', 'Enrolled'),
('BSCS-2024-0142', 'CS302', 'Spring 2026', 'Enrolled'),
('BSCS-2024-0142', 'CS303', 'Spring 2026', 'Enrolled'),
('BSCS-2024-0142', 'CS304', 'Spring 2026', 'Enrolled'),
('BSCS-2024-0142', 'MT201', 'Spring 2026', 'Enrolled')
ON CONFLICT DO NOTHING;

-- Timetable
DO $$
DECLARE
  r1 INT; r2 INT; r3 INT; r4 INT; r5 INT;
  s1 INT; s2 INT; s3 INT; s4 INT; s5 INT;
BEGIN
  SELECT id INTO r1 FROM rooms WHERE room_name='CS-201' LIMIT 1;
  SELECT id INTO r2 FROM rooms WHERE room_name='CS-305' LIMIT 1;
  SELECT id INTO r3 FROM rooms WHERE room_name='CS-410' LIMIT 1;
  SELECT id INTO r4 FROM rooms WHERE room_name='H-101'  LIMIT 1;
  SELECT id INTO r5 FROM rooms WHERE room_name='M-105'  LIMIT 1;
  SELECT id INTO s1 FROM slots WHERE slot_name='Slot 1' LIMIT 1;
  SELECT id INTO s2 FROM slots WHERE slot_name='Slot 2' LIMIT 1;
  SELECT id INTO s3 FROM slots WHERE slot_name='Slot 3' LIMIT 1;
  SELECT id INTO s4 FROM slots WHERE slot_name='Slot 4' LIMIT 1;
  SELECT id INTO s5 FROM slots WHERE slot_name='Slot 5' LIMIT 1;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS301','FAC-2026-0001',r1,'Monday',s1) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS301','FAC-2026-0001',r1,'Wednesday',s1) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS302','FAC-2026-0001',r2,'Tuesday',s2) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS302','FAC-2026-0001',r2,'Thursday',s2) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS303','FAC-2026-0001',r3,'Monday',s3) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS303','FAC-2026-0001',r3,'Friday',s3) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS304','FAC-2026-0001',r4,'Wednesday',s4) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS304','FAC-2026-0001',r4,'Friday',s4) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('MT201','FAC-2026-0001',r5,'Tuesday',s5) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('MT201','FAC-2026-0001',r5,'Thursday',s5) ON CONFLICT DO NOTHING;
END $$;

-- Attendance
INSERT INTO attendance (student_id, course_code, date, status, marked_by) VALUES
('BSCS-2024-0142','CS301','2026-03-02','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-04','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-09','Absent', 'FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-11','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-16','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS302','2026-03-03','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS302','2026-03-05','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS302','2026-03-10','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS302','2026-03-12','Absent', 'FAC-2026-0001'),
('BSCS-2024-0142','CS303','2026-03-02','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS303','2026-03-06','Absent', 'FAC-2026-0001'),
('BSCS-2024-0142','CS303','2026-03-09','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS304','2026-03-04','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS304','2026-03-06','Present','FAC-2026-0001'),
('BSCS-2024-0142','MT201','2026-03-03','Present','FAC-2026-0001'),
('BSCS-2024-0142','MT201','2026-03-10','Absent', 'FAC-2026-0001')
ON CONFLICT DO NOTHING;

-- Grades
INSERT INTO grades (student_id, course_code, semester, quiz, mid, assignment, final, submitted) VALUES
('BSCS-2024-0142','CS301','Spring 2026',17,26,9,36,true),
('BSCS-2024-0142','CS302','Spring 2026',18,24,8,32,true),
('BSCS-2024-0142','CS303','Spring 2026',15,22,7,30,true),
('BSCS-2024-0142','CS304','Spring 2026',19,27,10,38,true),
('BSCS-2024-0142','MT201','Spring 2026',16,25,9,34,true)
ON CONFLICT (student_id, course_code, semester) DO UPDATE
SET quiz=EXCLUDED.quiz, mid=EXCLUDED.mid, assignment=EXCLUDED.assignment, final=EXCLUDED.final, submitted=true;

-- Fees
INSERT INTO fees (id, student_id, semester, amount, due_date, status, paid_on) VALUES
('FEE-001','BSCS-2024-0142','Spring 2026',45000,'2026-02-15','Paid',   '2026-02-10'),
('FEE-002','BSCS-2024-0142','Fall 2025',  45000,'2025-09-15','Paid',   '2025-09-12'),
('FEE-003','BSCS-2024-0142','Summer 2026',20000,'2026-07-01','Pending', NULL)
ON CONFLICT (id) DO NOTHING;

-- Exams
INSERT INTO exams (subject, course_code, date, time, venue, duration, invigilator, type) VALUES
('Database Systems Mid-Term','CS301','2026-04-02','09:00 AM','Exam Hall A','2 Hours','FAC-2026-0001','Mid Term'),
('Data Structures Mid-Term', 'CS302','2026-04-03','11:00 AM','Exam Hall B','2 Hours','FAC-2026-0001','Mid Term'),
('Computer Networks Quiz',   'CS303','2026-04-04','02:00 PM','CS-201',     '1 Hour', 'FAC-2026-0001','Quiz'),
('OOP Final Exam',           'CS304','2026-05-22','09:00 AM','Main Hall',  '3 Hours','FAC-2026-0001','Final'),
('Linear Algebra Final',     'MT201','2026-05-25','02:00 PM','H-101',      '3 Hours','FAC-2026-0001','Final')
ON CONFLICT DO NOTHING;

-- Notices
INSERT INTO notices (title, body, category, priority, posted_by)
SELECT 'Mid-Term Exam Schedule', 'Mid-terms from April 2-8, 2026.', 'Academic', 'High', id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO notices (title, body, category, priority, posted_by)
SELECT 'Fee Deadline Feb 15', 'Last date to submit fee is Feb 15, 2026.', 'Finance', 'High', id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO notices (title, body, category, priority, posted_by)
SELECT 'Sports Gala 2026', 'Annual Sports Week March 20-24. Register by March 15.', 'Event', 'Medium', id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO notices (title, body, category, priority, posted_by)
SELECT 'Library Timing Update', 'Library open till 9 PM on weekdays.', 'Library', 'Low', id FROM users WHERE role='admin' LIMIT 1;

-- Events
INSERT INTO calendar_events (title, date, end_date, category, color, created_by)
SELECT 'Mid-Term Exams',    '2026-04-02','2026-04-08','Exam',   'rose',   id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title, date, end_date, category, color, created_by)
SELECT 'Sports Gala 2026',  '2026-03-20','2026-03-24','Sports', 'emerald',id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title, date, end_date, category, color, created_by)
SELECT 'Final Exams',       '2026-05-20','2026-05-30','Exam',   'rose',   id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title, date, end_date, category, color, created_by)
SELECT 'Eid ul Adha',       '2026-06-16','2026-06-19','Holiday','amber',  id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title, date, end_date, category, color, created_by)
SELECT 'Independence Day',  '2026-08-14','2026-08-14','Holiday','emerald',id FROM users WHERE role='admin' LIMIT 1;

-- Library Books
INSERT INTO library_books (title, author, category, isbn, total_copies, available_copies, location) VALUES
('Database System Concepts',   'Silberschatz, Korth', 'Computer Science','978-0-07-802215-9',5,3,'Section A, Shelf 2'),
('Introduction to Algorithms', 'Cormen, Leiserson',   'Computer Science','978-0-26-204630-5',4,2,'Section A, Shelf 3'),
('Computer Networks',          'Andrew Tanenbaum',    'Computer Science','978-0-13-212695-3',6,4,'Section A, Shelf 4'),
('Clean Code',                 'Robert C. Martin',    'Computer Science','978-0-13-235088-4',3,2,'Section B, Shelf 2'),
('Linear Algebra Done Right',  'Sheldon Axler',       'Mathematics',     '978-3-31-907941-0',4,1,'Section C, Shelf 2'),
('Discrete Mathematics',       'Kenneth Rosen',       'Mathematics',     '978-0-07-338309-5',5,5,'Section C, Shelf 3')
ON CONFLICT DO NOTHING;

-- Done
SELECT 'Demo data loaded!' AS status;
SELECT count(*) AS students  FROM students;
SELECT count(*) AS teachers  FROM teachers;
SELECT count(*) AS courses   FROM courses;
SELECT count(*) AS timetable FROM timetables;
