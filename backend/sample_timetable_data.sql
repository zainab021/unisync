-- ============================================================
-- Sample Timetable Data for UniSync
-- Run this in pgAdmin after main database.sql
-- ============================================================

-- Add more rooms if needed
INSERT INTO rooms (room_name, room_type_id, capacity) VALUES
('A-101', 1, 45), ('A-102', 1, 45), ('B-201', 1, 50),
('B-202', 1, 50), ('C-101', 2, 35), ('C-102', 2, 35)
ON CONFLICT (room_name) DO NOTHING;

-- Sample courses (if not already added)
INSERT INTO courses (code, name, department, credits, status) VALUES
('CS301', 'Database Systems',       'CS', 3, 'Active'),
('CS302', 'Operating Systems',      'CS', 4, 'Active'),
('CS303', 'Software Engineering',   'CS', 3, 'Active'),
('CS304', 'Computer Networks',      'CS', 3, 'Active'),
('CS305', 'Artificial Intelligence','CS', 3, 'Active'),
('MT201', 'Linear Algebra',         'MATH', 3, 'Active'),
('MT202', 'Probability & Stats',    'MATH', 3, 'Active')
ON CONFLICT (code) DO NOTHING;

-- Note: After adding teachers via Admin panel, run this query:
-- SELECT id, name FROM teachers;
-- Then use those IDs in the timetable INSERT below.

-- ============================================================
-- Example timetable assignment (adjust teacher_id after adding teachers):
-- ============================================================
-- First get slot IDs:
-- SELECT id, slot_name, start_time FROM slots ORDER BY id;
-- Then get room IDs:
-- SELECT id, room_name FROM rooms ORDER BY room_name;
-- Then assign:

-- INSERT INTO timetables (course_code, teacher_id, room_id, day, slot_id)
-- VALUES
--   ('CS301', 'FAC-2026-XXXX', 1, 'Monday',    1),
--   ('CS301', 'FAC-2026-XXXX', 1, 'Wednesday', 1),
--   ('CS302', 'FAC-2026-XXXX', 2, 'Tuesday',   2),
--   ('CS302', 'FAC-2026-XXXX', 2, 'Thursday',  2);
-- ON CONFLICT DO NOTHING;
