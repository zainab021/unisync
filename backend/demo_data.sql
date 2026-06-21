-- =====================================================================
-- UniSync Full University Demo Data
-- Run in pgAdmin: Ctrl+A -> F5
-- =====================================================================

-- Missing Tables
CREATE TABLE IF NOT EXISTS library_books (id SERIAL PRIMARY KEY, title VARCHAR(200) NOT NULL, author VARCHAR(150) NOT NULL, category VARCHAR(50) NOT NULL DEFAULT 'General', isbn VARCHAR(20), total_copies INT NOT NULL DEFAULT 1, available_copies INT NOT NULL DEFAULT 1, location VARCHAR(50), added_at TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, title VARCHAR(200) NOT NULL, message TEXT, type VARCHAR(50) DEFAULT 'info', read BOOLEAN DEFAULT FALSE, link VARCHAR(200), created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS drop_requests (id SERIAL PRIMARY KEY, student_id VARCHAR(30) REFERENCES students(id) ON DELETE CASCADE, course_code VARCHAR(20) REFERENCES courses(code) ON DELETE CASCADE, reason TEXT, status VARCHAR(20) DEFAULT 'Pending', requested_at TIMESTAMP DEFAULT NOW(), reviewed_at TIMESTAMP, reviewed_by INT REFERENCES users(id));
CREATE TABLE IF NOT EXISTS deleted_backups (id SERIAL PRIMARY KEY, table_name VARCHAR(50) NOT NULL, record_id TEXT NOT NULL, record_data JSONB NOT NULL, deleted_by INT REFERENCES users(id), deleted_at TIMESTAMP DEFAULT NOW());

-- Departments
INSERT INTO departments (id, name, hod, programs, teachers_count, students_count) VALUES
('CS','Computer Science',        'Dr. Khalid Mahmood',4,5,120),
('SE','Software Engineering',    'Dr. Nadia Hassan',  2,3, 80),
('AI','Artificial Intelligence', 'Dr. Umair Muneer',  2,2, 60)
ON CONFLICT (id) DO UPDATE SET hod=EXCLUDED.hod;

-- Room Types + Rooms + Slots
INSERT INTO roomtypes (type_name) VALUES ('Classroom'),('Lab'),('Hall') ON CONFLICT DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity) SELECT 'CS-201',id,40 FROM roomtypes WHERE type_name='Classroom' ON CONFLICT (room_name) DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity) SELECT 'CS-305',id,35 FROM roomtypes WHERE type_name='Classroom' ON CONFLICT (room_name) DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity) SELECT 'CS-410',id,40 FROM roomtypes WHERE type_name='Classroom' ON CONFLICT (room_name) DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity) SELECT 'Lab-1', id,30 FROM roomtypes WHERE type_name='Lab'       ON CONFLICT (room_name) DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity) SELECT 'Lab-3', id,30 FROM roomtypes WHERE type_name='Lab'       ON CONFLICT (room_name) DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity) SELECT 'H-101', id,120 FROM roomtypes WHERE type_name='Hall'     ON CONFLICT (room_name) DO NOTHING;
INSERT INTO rooms (room_name, room_type_id, capacity) SELECT 'M-105', id,45 FROM roomtypes WHERE type_name='Classroom' ON CONFLICT (room_name) DO NOTHING;
INSERT INTO slots (slot_name,start_time,end_time) VALUES ('Slot 1','08:00','09:30'),('Slot 2','09:30','11:00'),('Slot 3','11:00','12:30'),('Slot 4','13:00','14:30'),('Slot 5','14:30','16:00'),('Slot 6','16:00','17:30') ON CONFLICT DO NOTHING;
DELETE FROM slots WHERE id NOT IN (SELECT MIN(id) FROM slots GROUP BY slot_name);

-- Admin
INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Admin','admin@university.edu','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin','AD') ON CONFLICT (email) DO NOTHING;

-- Teachers (password: teacher123)
WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Dr. Sara Ahmed','sara.ahmed@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','teacher','SA') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO teachers (id,user_id,name,department,designation,phone,office) SELECT 'FAC-2026-0001',id,'Dr. Sara Ahmed','Computer Science','Assistant Professor','+92-300-1234567','CS Block, Room 205' FROM u ON CONFLICT (id) DO UPDATE SET designation=EXCLUDED.designation;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Dr. Muhammad Talha','talha@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','teacher','MT') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO teachers (id,user_id,name,department,designation) SELECT 'FAC-2026-0002',id,'Dr. Muhammad Talha','Computer Science','Associate Professor' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Ms. Fatima Khalil','fatima@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','teacher','FK') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO teachers (id,user_id,name,department,designation) SELECT 'FAC-2026-0003',id,'Ms. Fatima Khalil','Software Engineering','Lecturer' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Mr. Ahsan Ali','ahsan@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','teacher','AA') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO teachers (id,user_id,name,department,designation) SELECT 'FAC-2026-0004',id,'Mr. Ahsan Ali','Computer Science','Lecturer' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Dr. Wasim Khan','wasim@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','teacher','WK') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO teachers (id,user_id,name,department,designation) SELECT 'FAC-2026-0005',id,'Dr. Wasim Khan','Artificial Intelligence','Associate Professor' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Ms. Maryam Faqir','maryam@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','teacher','MF') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO teachers (id,user_id,name,department,designation) SELECT 'FAC-2026-0006',id,'Ms. Maryam Faqir','Software Engineering','Lecturer' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Dr. Shahzad Ahmad','shahzad@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','teacher','SZ') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO teachers (id,user_id,name,department,designation) SELECT 'FAC-2026-0007',id,'Dr. Shahzad Ahmad','Computer Science','Professor' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Ms. Hina Tufail','hina@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','teacher','HT') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO teachers (id,user_id,name,department,designation) SELECT 'FAC-2026-0008',id,'Ms. Hina Tufail','Artificial Intelligence','Lecturer' FROM u ON CONFLICT (id) DO NOTHING;

-- Students (password: teacher123)
WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Ayesha Khan','ayesha.khan@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','student','AK') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO students (id,user_id,name,program,semester,cgpa,status) SELECT 'BSCS-2024-0142',id,'Ayesha Khan','BS Computer Science',5,3.72,'Active' FROM u ON CONFLICT (id) DO UPDATE SET cgpa=EXCLUDED.cgpa;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Bilal Raza','bilal@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','student','BR') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO students (id,user_id,name,program,semester,cgpa,status) SELECT 'BSCS-2024-0238',id,'Bilal Raza','BS Computer Science',5,3.45,'Active' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Zara Ahmed','zara@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','student','ZA') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO students (id,user_id,name,program,semester,cgpa,status) SELECT 'BSCS-2024-0315',id,'Zara Ahmed','BS Computer Science',5,3.88,'Active' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Omar Farooq','omar@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','student','OF') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO students (id,user_id,name,program,semester,cgpa,status) SELECT 'BSSE-2024-0112',id,'Omar Farooq','BS Software Engineering',5,3.20,'Active' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Sara Malik','sara.m@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','student','SM') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO students (id,user_id,name,program,semester,cgpa,status) SELECT 'BSSE-2024-0198',id,'Sara Malik','BS Software Engineering',5,3.65,'Active' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Hamza Sheikh','hamza@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','student','HS') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO students (id,user_id,name,program,semester,cgpa,status) SELECT 'BSAI-2024-0056',id,'Hamza Sheikh','BS Artificial Intelligence',5,3.55,'Active' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Nida Iqbal','nida@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','student','NI') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO students (id,user_id,name,program,semester,cgpa,status) SELECT 'BSAI-2024-0089',id,'Nida Iqbal','BS Artificial Intelligence',5,3.90,'Active' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Usman Tariq','usman@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','student','UT') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO students (id,user_id,name,program,semester,cgpa,status) SELECT 'BSCS-2024-0401',id,'Usman Tariq','BS Computer Science',3,2.95,'Warning' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Hira Baig','hira@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','student','HB') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO students (id,user_id,name,program,semester,cgpa,status) SELECT 'BSCS-2024-0445',id,'Hira Baig','BS Computer Science',3,3.30,'Active' FROM u ON CONFLICT (id) DO NOTHING;

WITH u AS (INSERT INTO users (name,email,password_hash,role,avatar) VALUES ('Faisal Nawaz','faisal@university.edu','$2b$10$5tD77tKEpmK.qreVA2jta.eT.cGqOLo0KhRBMlGuFuutd.OcYpxhC','student','FN') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id)
INSERT INTO students (id,user_id,name,program,semester,cgpa,status) SELECT 'BSSE-2024-0267',id,'Faisal Nawaz','BS Software Engineering',3,3.10,'Active' FROM u ON CONFLICT (id) DO NOTHING;

-- Courses (15)
INSERT INTO courses (code,name,department,teacher_id,credits,status) VALUES
('CS301','Database Systems',            'CS','FAC-2026-0001',3,'Active'),
('CS302','Data Structures & Algorithms','CS','FAC-2026-0002',3,'Active'),
('CS303','Computer Networks',           'CS','FAC-2026-0001',2,'Active'),
('CS304','Object Oriented Programming', 'CS','FAC-2026-0004',3,'Active'),
('CS305','Operating Systems',           'CS','FAC-2026-0002',3,'Active'),
('CS306','Computer Organization',       'CS','FAC-2026-0007',3,'Active'),
('SE301','Software Requirements Engg',  'SE','FAC-2026-0003',2,'Active'),
('SE302','Software Quality Engineering','SE','FAC-2026-0006',2,'Active'),
('SE303','Software Construction & Dev', 'SE','FAC-2026-0003',2,'Active'),
('SE304','Mobile App Development',      'SE','FAC-2026-0006',3,'Active'),
('AI301','Artificial Intelligence',     'AI','FAC-2026-0005',3,'Active'),
('AI302','Machine Learning',            'AI','FAC-2026-0008',3,'Active'),
('AI303','Neural Networks & Deep Lrng', 'AI','FAC-2026-0008',2,'Active'),
('MT201','Linear Algebra',              'CS','FAC-2026-0007',3,'Active'),
('MT202','Probability & Statistics',    'CS','FAC-2026-0007',3,'Active')
ON CONFLICT (code) DO UPDATE SET teacher_id=EXCLUDED.teacher_id, name=EXCLUDED.name;

-- Enrollments
INSERT INTO enrollments (student_id,course_code,semester,status) VALUES
('BSCS-2024-0142','CS301','Spring 2026','Enrolled'),('BSCS-2024-0142','CS302','Spring 2026','Enrolled'),
('BSCS-2024-0142','CS303','Spring 2026','Enrolled'),('BSCS-2024-0142','CS304','Spring 2026','Enrolled'),
('BSCS-2024-0142','MT202','Spring 2026','Enrolled'),('BSCS-2024-0238','CS301','Spring 2026','Enrolled'),
('BSCS-2024-0238','CS302','Spring 2026','Enrolled'),('BSCS-2024-0238','CS305','Spring 2026','Enrolled'),
('BSCS-2024-0315','CS301','Spring 2026','Enrolled'),('BSCS-2024-0315','CS302','Spring 2026','Enrolled'),
('BSCS-2024-0315','CS303','Spring 2026','Enrolled'),('BSSE-2024-0112','SE301','Spring 2026','Enrolled'),
('BSSE-2024-0112','SE302','Spring 2026','Enrolled'),('BSSE-2024-0112','SE304','Spring 2026','Enrolled'),
('BSSE-2024-0198','SE301','Spring 2026','Enrolled'),('BSSE-2024-0198','SE304','Spring 2026','Enrolled'),
('BSAI-2024-0056','AI301','Spring 2026','Enrolled'),('BSAI-2024-0056','AI302','Spring 2026','Enrolled'),
('BSAI-2024-0089','AI301','Spring 2026','Enrolled'),('BSAI-2024-0089','AI302','Spring 2026','Enrolled'),
('BSCS-2024-0401','CS306','Spring 2026','Enrolled'),('BSCS-2024-0401','MT201','Spring 2026','Enrolled'),
('BSCS-2024-0445','CS306','Spring 2026','Enrolled'),('BSSE-2024-0267','SE301','Spring 2026','Enrolled')
ON CONFLICT DO NOTHING;

-- Timetable
DO $$
DECLARE r1 INT; r2 INT; r3 INT; r4 INT; r5 INT; r6 INT; r7 INT;
        s1 INT; s2 INT; s3 INT; s4 INT; s5 INT; s6 INT;
BEGIN
  SELECT id INTO r1 FROM rooms WHERE room_name='CS-201' LIMIT 1;
  SELECT id INTO r2 FROM rooms WHERE room_name='CS-305' LIMIT 1;
  SELECT id INTO r3 FROM rooms WHERE room_name='CS-410' LIMIT 1;
  SELECT id INTO r4 FROM rooms WHERE room_name='H-101'  LIMIT 1;
  SELECT id INTO r5 FROM rooms WHERE room_name='M-105'  LIMIT 1;
  SELECT id INTO r6 FROM rooms WHERE room_name='Lab-1'  LIMIT 1;
  SELECT id INTO r7 FROM rooms WHERE room_name='Lab-3'  LIMIT 1;
  SELECT id INTO s1 FROM slots WHERE slot_name='Slot 1' LIMIT 1;
  SELECT id INTO s2 FROM slots WHERE slot_name='Slot 2' LIMIT 1;
  SELECT id INTO s3 FROM slots WHERE slot_name='Slot 3' LIMIT 1;
  SELECT id INTO s4 FROM slots WHERE slot_name='Slot 4' LIMIT 1;
  SELECT id INTO s5 FROM slots WHERE slot_name='Slot 5' LIMIT 1;
  SELECT id INTO s6 FROM slots WHERE slot_name='Slot 6' LIMIT 1;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS301','FAC-2026-0001',r1,'Monday',s1)    ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS301','FAC-2026-0001',r1,'Wednesday',s1) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS302','FAC-2026-0002',r2,'Tuesday',s2)   ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS302','FAC-2026-0002',r2,'Thursday',s2)  ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS303','FAC-2026-0001',r3,'Monday',s3)    ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS303','FAC-2026-0001',r3,'Friday',s3)    ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS304','FAC-2026-0004',r1,'Tuesday',s4)   ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS304','FAC-2026-0004',r1,'Thursday',s4)  ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS305','FAC-2026-0002',r2,'Wednesday',s3) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS305','FAC-2026-0002',r2,'Friday',s2)    ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS306','FAC-2026-0007',r4,'Monday',s4)    ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('CS306','FAC-2026-0007',r4,'Wednesday',s4) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('SE301','FAC-2026-0003',r3,'Tuesday',s1)   ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('SE301','FAC-2026-0003',r3,'Thursday',s1)  ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('SE302','FAC-2026-0006',r3,'Monday',s2)    ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('SE304','FAC-2026-0006',r7,'Wednesday',s5) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('SE304','FAC-2026-0006',r7,'Friday',s4)    ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('AI301','FAC-2026-0005',r4,'Tuesday',s5)   ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('AI301','FAC-2026-0005',r4,'Thursday',s5)  ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('AI302','FAC-2026-0008',r4,'Monday',s5)    ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('AI302','FAC-2026-0008',r4,'Wednesday',s6) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('MT201','FAC-2026-0007',r5,'Monday',s6)    ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('MT201','FAC-2026-0007',r5,'Wednesday',s2) ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('MT202','FAC-2026-0007',r5,'Tuesday',s3)   ON CONFLICT DO NOTHING;
  INSERT INTO timetables(course_code,teacher_id,room_id,day,slot_id) VALUES('MT202','FAC-2026-0007',r5,'Thursday',s3)  ON CONFLICT DO NOTHING;
END $$;

-- Attendance (Ayesha)
INSERT INTO attendance (student_id,course_code,date,status,marked_by) VALUES
('BSCS-2024-0142','CS301','2026-03-02','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-04','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-09','Absent', 'FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-11','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS301','2026-03-16','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS302','2026-03-03','Present','FAC-2026-0002'),
('BSCS-2024-0142','CS302','2026-03-05','Present','FAC-2026-0002'),
('BSCS-2024-0142','CS302','2026-03-10','Present','FAC-2026-0002'),
('BSCS-2024-0142','CS302','2026-03-12','Absent', 'FAC-2026-0002'),
('BSCS-2024-0142','CS303','2026-03-02','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS303','2026-03-06','Absent', 'FAC-2026-0001'),
('BSCS-2024-0142','CS303','2026-03-09','Present','FAC-2026-0001'),
('BSCS-2024-0142','CS304','2026-03-04','Present','FAC-2026-0004'),
('BSCS-2024-0142','CS304','2026-03-06','Present','FAC-2026-0004'),
('BSCS-2024-0142','MT202','2026-03-03','Present','FAC-2026-0007'),
('BSCS-2024-0142','MT202','2026-03-10','Absent', 'FAC-2026-0007'),
('BSSE-2024-0112','SE301','2026-03-04','Present','FAC-2026-0003'),
('BSSE-2024-0112','SE301','2026-03-06','Present','FAC-2026-0003'),
('BSSE-2024-0112','SE301','2026-03-11','Absent', 'FAC-2026-0003'),
('BSAI-2024-0056','AI301','2026-03-03','Present','FAC-2026-0005'),
('BSAI-2024-0056','AI301','2026-03-05','Present','FAC-2026-0005'),
('BSAI-2024-0089','AI301','2026-03-03','Present','FAC-2026-0005'),
('BSAI-2024-0089','AI301','2026-03-05','Present','FAC-2026-0005')
ON CONFLICT DO NOTHING;

-- Grades
INSERT INTO grades (student_id,course_code,semester,quiz,mid,assignment,final,submitted) VALUES
('BSCS-2024-0142','CS301','Spring 2026',17,26,9,36,true),
('BSCS-2024-0142','CS302','Spring 2026',18,24,8,32,true),
('BSCS-2024-0142','CS303','Spring 2026',15,22,7,30,true),
('BSCS-2024-0142','CS304','Spring 2026',19,27,10,38,true),
('BSCS-2024-0142','MT202','Spring 2026',16,25,9,34,true),
('BSCS-2024-0238','CS301','Spring 2026',14,21,7,28,true),
('BSCS-2024-0315','CS301','Spring 2026',19,28,10,39,true),
('BSSE-2024-0112','SE301','Spring 2026',15,23,8,31,true),
('BSAI-2024-0056','AI301','Spring 2026',16,24,8,33,true),
('BSAI-2024-0089','AI301','Spring 2026',18,27,10,37,true)
ON CONFLICT (student_id,course_code,semester) DO UPDATE SET quiz=EXCLUDED.quiz,mid=EXCLUDED.mid,assignment=EXCLUDED.assignment,final=EXCLUDED.final,submitted=true;

-- Fees
INSERT INTO fees (id,student_id,semester,amount,due_date,status,paid_on) VALUES
('FEE-001','BSCS-2024-0142','Spring 2026',45000,'2026-02-15','Paid',   '2026-02-10'),
('FEE-002','BSCS-2024-0142','Fall 2025',  45000,'2025-09-15','Paid',   '2025-09-12'),
('FEE-003','BSCS-2024-0238','Spring 2026',45000,'2026-02-15','Paid',   '2026-02-08'),
('FEE-004','BSCS-2024-0315','Spring 2026',45000,'2026-02-15','Paid',   '2026-02-01'),
('FEE-005','BSSE-2024-0112','Spring 2026',42000,'2026-02-15','Pending',NULL),
('FEE-006','BSSE-2024-0198','Spring 2026',42000,'2026-02-15','Paid',   '2026-02-14'),
('FEE-007','BSAI-2024-0056','Spring 2026',48000,'2026-02-15','Overdue',NULL),
('FEE-008','BSAI-2024-0089','Spring 2026',48000,'2026-02-15','Paid',   '2026-02-05'),
('FEE-009','BSCS-2024-0401','Spring 2026',45000,'2026-02-15','Overdue',NULL),
('FEE-010','BSCS-2024-0445','Spring 2026',45000,'2026-02-15','Paid',   '2026-02-12')
ON CONFLICT (id) DO NOTHING;

-- Exams
INSERT INTO exams (subject,course_code,date,time,venue,duration,invigilator,type) VALUES
('Database Systems Mid-Term','CS301','2026-04-02','09:00 AM','Exam Hall A','2 Hours','FAC-2026-0001','Mid Term'),
('Data Structures Mid-Term', 'CS302','2026-04-03','11:00 AM','Exam Hall B','2 Hours','FAC-2026-0002','Mid Term'),
('Computer Networks Quiz',   'CS303','2026-04-04','02:00 PM','CS-201',     '1 Hour', 'FAC-2026-0001','Quiz'),
('OOP Mid-Term',             'CS304','2026-04-05','09:00 AM','Exam Hall A','2 Hours','FAC-2026-0004','Mid Term'),
('SE Requirements Mid-Term', 'SE301','2026-04-06','11:00 AM','Exam Hall C','2 Hours','FAC-2026-0003','Mid Term'),
('AI Mid-Term',              'AI301','2026-04-07','09:00 AM','Exam Hall B','2 Hours','FAC-2026-0005','Mid Term'),
('Database Systems Final',   'CS301','2026-05-20','09:00 AM','Main Hall',  '3 Hours','FAC-2026-0001','Final'),
('Data Structures Final',    'CS302','2026-05-22','11:00 AM','Main Hall',  '3 Hours','FAC-2026-0002','Final'),
('Linear Algebra Final',     'MT201','2026-05-24','02:00 PM','H-101',      '3 Hours','FAC-2026-0007','Final'),
('AI Final',                 'AI301','2026-05-26','09:00 AM','Main Hall',  '3 Hours','FAC-2026-0005','Final')
ON CONFLICT DO NOTHING;

-- Notices
INSERT INTO notices (title,body,category,priority,posted_by) SELECT 'Mid-Term Exam Schedule','Mid-terms April 2-8, 2026. Check timetable.','Academic','High',id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO notices (title,body,category,priority,posted_by) SELECT 'Fee Deadline Feb 15','Last date to submit Spring 2026 fee is February 15.','Finance','High',id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO notices (title,body,category,priority,posted_by) SELECT 'Attendance Policy','Minimum 75% attendance required in all courses.','Academic','High',id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO notices (title,body,category,priority,posted_by) SELECT 'Sports Gala 2026','Annual Sports Week March 20-24. Register by March 15.','Event','Medium',id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO notices (title,body,category,priority,posted_by) SELECT 'Library New Arrivals','50+ new books in CS, AI, SE. Browse on student portal.','Library','Low',id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO notices (title,body,category,priority,posted_by) SELECT 'Fall 2025 Results','Fall 2025 results announced. View on student portal.','Academic','Medium',id FROM users WHERE role='admin' LIMIT 1;

-- Events
INSERT INTO calendar_events (title,date,end_date,category,color,created_by) SELECT 'Spring Semester Begins','2026-02-01','2026-02-01','Academic','sky',    id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title,date,end_date,category,color,created_by) SELECT 'Sports Gala 2026',     '2026-03-20','2026-03-24','Sports', 'emerald',id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title,date,end_date,category,color,created_by) SELECT 'Mid-Term Exams',       '2026-04-02','2026-04-08','Exam',   'rose',   id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title,date,end_date,category,color,created_by) SELECT 'Spring Break',         '2026-04-20','2026-04-24','Holiday','violet', id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title,date,end_date,category,color,created_by) SELECT 'Final Exams',          '2026-05-20','2026-05-30','Exam',   'rose',   id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title,date,end_date,category,color,created_by) SELECT 'Eid ul Adha Holiday',  '2026-06-16','2026-06-19','Holiday','amber',  id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title,date,end_date,category,color,created_by) SELECT 'University Convocation','2026-07-15','2026-07-15','Academic','violet',id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title,date,end_date,category,color,created_by) SELECT 'Independence Day',      '2026-08-14','2026-08-14','Holiday','emerald',id FROM users WHERE role='admin' LIMIT 1;
INSERT INTO calendar_events (title,date,end_date,category,color,created_by) SELECT 'Fall Semester Begins',  '2026-09-01','2026-09-01','Academic','sky',   id FROM users WHERE role='admin' LIMIT 1;

-- Library Books
INSERT INTO library_books (title,author,category,isbn,total_copies,available_copies,location) VALUES
('Database System Concepts',   'Silberschatz, Korth, Sudarshan','Computer Science','978-0-07-802215-9',6,4,'Section A, Shelf 2'),
('Introduction to Algorithms', 'Cormen, Leiserson, Rivest',     'Computer Science','978-0-26-204630-5',5,3,'Section A, Shelf 3'),
('Computer Networks',          'Andrew Tanenbaum',              'Computer Science','978-0-13-212695-3',4,2,'Section A, Shelf 4'),
('Artificial Intelligence',    'Stuart Russell, Peter Norvig',  'Computer Science','978-0-13-604259-4',5,2,'Section A, Shelf 6'),
('Machine Learning',           'Tom Mitchell',                  'Computer Science','978-0-07-042807-2',4,4,'Section A, Shelf 7'),
('Deep Learning',              'Goodfellow, Bengio, Courville', 'Computer Science','978-0-26-203561-3',3,1,'Section B, Shelf 4'),
('Clean Code',                 'Robert C. Martin',              'Computer Science','978-0-13-235088-4',4,2,'Section B, Shelf 2'),
('Software Engineering',       'Ian Sommerville',               'Computer Science','978-0-13-703515-1',6,5,'Section B, Shelf 3'),
('Linear Algebra Done Right',  'Sheldon Axler',                 'Mathematics',     '978-3-31-907941-0',4,2,'Section C, Shelf 2'),
('Probability & Statistics',   'Jay DeVore',                    'Mathematics',     '978-0-53-873352-6',5,3,'Section C, Shelf 1'),
('Discrete Mathematics',       'Kenneth Rosen',                 'Mathematics',     '978-0-07-338309-5',6,6,'Section C, Shelf 3'),
('The Pragmatic Programmer',   'Andrew Hunt, David Thomas',     'Computer Science','978-0-13-595705-9',3,3,'Section B, Shelf 5'),
('Design Patterns',            'Gang of Four',                  'Computer Science','978-0-20-163361-5',3,1,'Section B, Shelf 6'),
('Calculus',                   'James Stewart',                 'Mathematics',     '978-1-28-557095-3',5,4,'Section C, Shelf 4'),
('Object Oriented Analysis',   'Grady Booch',                   'Computer Science','978-0-20-189551-5',3,3,'Section B, Shelf 1')
ON CONFLICT DO NOTHING;

-- Room Requests (demo)
INSERT INTO room_requests (id,teacher_id,room,date,slot,reason,status) VALUES
('RR-2026-0101','FAC-2026-0001','CS-201','2026-04-10','08:00-09:30','Makeup class for CS301','Approved'),
('RR-2026-0102','FAC-2026-0002','CS-305','2026-04-11','09:30-11:00','Extra lecture for revision','Pending')
ON CONFLICT DO NOTHING;

-- Leave Requests (demo)
INSERT INTO leave_requests (id,teacher_id,type,from_date,to_date,days,reason,status) VALUES
('LR-2026-0001','FAC-2026-0001','Casual Leave','2026-04-15','2026-04-15',1,'Personal emergency','Approved'),
('LR-2026-0002','FAC-2026-0002','Sick Leave',  '2026-03-20','2026-03-21',2,'Medical checkup',  'Approved')
ON CONFLICT DO NOTHING;

-- Feedback (demo)
INSERT INTO feedback (student_id,teacher_id,course_code,rating,comment,anonymous) VALUES
('BSCS-2024-0142','FAC-2026-0001','CS301',5,'Excellent teaching. Very clear explanations.',true),
('BSCS-2024-0142','FAC-2026-0002','CS302',4,'Good lectures. More practice problems needed.',true),
('BSCS-2024-0315','FAC-2026-0001','CS301',5,'Best teacher. Always available for help.',false)
ON CONFLICT DO NOTHING;

-- Messages (demo)
INSERT INTO messages (from_id,to_id,body)
SELECT s.id, t.id, 'Respected Dr. Sara, I had a query about database normalization. Could you share resources?'
FROM users s, users t WHERE s.email='ayesha.khan@university.edu' AND t.email='sara.ahmed@university.edu';

INSERT INTO messages (from_id,to_id,body)
SELECT t.id, s.id, 'Dear Ayesha, refer to Chapter 7 of Silberschatz. Let me know if you have questions.'
FROM users s, users t WHERE s.email='ayesha.khan@university.edu' AND t.email='sara.ahmed@university.edu';

-- Summary
SELECT 'Full university demo data loaded!' AS status;
SELECT count(*) AS departments FROM departments;
SELECT count(*) AS teachers    FROM teachers;
SELECT count(*) AS students    FROM students;
SELECT count(*) AS courses     FROM courses;
SELECT count(*) AS enrollments FROM enrollments;
SELECT count(*) AS timetable   FROM timetables;
SELECT count(*) AS library     FROM library_books;
