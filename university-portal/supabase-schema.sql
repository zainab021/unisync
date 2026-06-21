-- ============================================================
-- NORTHFIELD UNIVERSITY PORTAL — SUPABASE SCHEMA
-- Run this in Supabase > SQL Editor > New Query
-- ============================================================

-- USERS (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  role text not null check (role in ('student', 'teacher', 'admin')),
  avatar text,
  created_at timestamptz default now()
);

-- STUDENTS
create table public.students (
  id text primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  program text not null,
  semester int not null default 1,
  cgpa numeric(3,2) default 0,
  status text default 'Active' check (status in ('Active', 'Warning', 'Suspended')),
  email text unique not null
);

-- TEACHERS
create table public.teachers (
  id text primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  department text not null,
  designation text not null,
  email text unique not null,
  phone text,
  office text,
  joined_year int
);

-- DEPARTMENTS
create table public.departments (
  id text primary key,
  name text not null,
  hod text,
  programs int default 0,
  teachers_count int default 0,
  students_count int default 0
);

-- COURSES
create table public.courses (
  code text primary key,
  name text not null,
  department text references public.departments(id),
  teacher_id text references public.teachers(id),
  credits int not null default 3,
  status text default 'Active' check (status in ('Active', 'Inactive'))
);

-- ENROLLMENTS
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  student_id text references public.students(id) on delete cascade,
  course_code text references public.courses(code) on delete cascade,
  semester text not null,
  status text default 'Enrolled' check (status in ('Enrolled', 'Dropped', 'Completed')),
  created_at timestamptz default now(),
  unique(student_id, course_code, semester)
);

-- ATTENDANCE
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  student_id text references public.students(id) on delete cascade,
  course_code text references public.courses(code) on delete cascade,
  date date not null,
  status text not null check (status in ('Present', 'Absent', 'Late', 'Leave')),
  marked_by text references public.teachers(id),
  created_at timestamptz default now(),
  unique(student_id, course_code, date)
);

-- GRADES
create table public.grades (
  id uuid default gen_random_uuid() primary key,
  student_id text references public.students(id) on delete cascade,
  course_code text references public.courses(code) on delete cascade,
  semester text not null,
  quiz numeric(5,2) default 0,
  mid numeric(5,2) default 0,
  assignment numeric(5,2) default 0,
  final numeric(5,2) default 0,
  total numeric(5,2) generated always as (quiz + mid + assignment + final) stored,
  submitted boolean default false,
  unique(student_id, course_code, semester)
);

-- FEES
create table public.fees (
  id text primary key,
  student_id text references public.students(id) on delete cascade,
  semester text not null,
  amount numeric(10,2) not null,
  due_date date not null,
  status text default 'Pending' check (status in ('Paid', 'Pending', 'Overdue')),
  paid_on date,
  created_at timestamptz default now()
);

-- NOTICES
create table public.notices (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  category text not null,
  priority text default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  posted_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- EXAMS
create table public.exams (
  id uuid default gen_random_uuid() primary key,
  subject text not null,
  course_code text references public.courses(code),
  date date not null,
  time text not null,
  venue text not null,
  duration text not null,
  invigilator text references public.teachers(id),
  type text not null check (type in ('Mid-Term', 'Final', 'Quiz', 'Lab Exam')),
  created_at timestamptz default now()
);

-- ROOM REQUESTS
create table public.room_requests (
  id text primary key,
  teacher_id text references public.teachers(id) on delete cascade,
  room text not null,
  date date not null,
  slot text not null,
  reason text not null,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz default now()
);

-- LEAVE REQUESTS
create table public.leave_requests (
  id text primary key,
  teacher_id text references public.teachers(id) on delete cascade,
  type text not null,
  from_date date not null,
  to_date date not null,
  days int not null,
  reason text not null,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz default now()
);

-- MESSAGES
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  from_id uuid references public.profiles(id) on delete cascade,
  to_id uuid references public.profiles(id) on delete cascade,
  body text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- DOCUMENT REQUESTS
create table public.document_requests (
  id text primary key,
  student_id text references public.students(id) on delete cascade,
  type text not null,
  status text default 'Pending' check (status in ('Pending', 'Processing', 'Ready to Collect')),
  note text default '',
  requested_on date default current_date,
  created_at timestamptz default now()
);

-- FEEDBACK
create table public.feedback (
  id uuid default gen_random_uuid() primary key,
  student_id text references public.students(id) on delete cascade,
  teacher_id text references public.teachers(id) on delete cascade,
  course_code text references public.courses(code),
  rating int not null check (rating between 1 and 5),
  comment text,
  anonymous boolean default true,
  created_at timestamptz default now()
);

-- LIBRARY
create table public.library_books (
  id uuid default gen_random_uuid() primary key,
  student_id text references public.students(id) on delete cascade,
  title text not null,
  author text not null,
  borrowed_date date not null,
  due_date date not null,
  fine numeric(8,2) default 0,
  returned boolean default false,
  created_at timestamptz default now()
);

-- ACADEMIC CALENDAR EVENTS
create table public.calendar_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date date not null,
  end_date date,
  category text not null,
  color text default 'amber',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- AUDIT LOGS
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  user_name text not null,
  role text not null,
  action text not null,
  type text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance enable row level security;
alter table public.grades enable row level security;
alter table public.fees enable row level security;
alter table public.notices enable row level security;
alter table public.exams enable row level security;
alter table public.room_requests enable row level security;
alter table public.leave_requests enable row level security;
alter table public.messages enable row level security;
alter table public.document_requests enable row level security;
alter table public.feedback enable row level security;
alter table public.library_books enable row level security;
alter table public.calendar_events enable row level security;
alter table public.audit_logs enable row level security;

-- Allow authenticated users to read their own profile
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Allow all authenticated users to read courses, notices, exams, calendar
create policy "Anyone authenticated can read courses" on public.courses
  for select using (auth.role() = 'authenticated');

create policy "Anyone authenticated can read notices" on public.notices
  for select using (auth.role() = 'authenticated');

create policy "Anyone authenticated can read exams" on public.exams
  for select using (auth.role() = 'authenticated');

create policy "Anyone authenticated can read calendar" on public.calendar_events
  for select using (auth.role() = 'authenticated');

-- Students can read own data
create policy "Students read own data" on public.students
  for select using (
    profile_id = auth.uid()
  );

create policy "Students read own attendance" on public.attendance
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

create policy "Students read own grades" on public.grades
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

create policy "Students read own fees" on public.fees
  for select using (
    student_id in (select id from public.students where profile_id = auth.uid())
  );

-- Admin can do everything (service role)
-- These are handled server-side with service role key

-- ============================================================
-- SEED DATA — Demo Users
-- ============================================================
-- NOTE: Run these after creating users in Supabase Auth
-- Or use the seed script provided separately

-- Insert demo departments
insert into public.departments (id, name, hod, programs, teachers_count, students_count) values
('CS', 'Computer Science', 'Dr. Khalid Mahmood', 4, 24, 1200),
('MATH', 'Mathematics', 'Dr. Faisal Mehmood', 2, 12, 340),
('ENG', 'English', 'Dr. Amna Bashir', 2, 8, 280),
('PHY', 'Physics', 'Dr. Tariq Habib', 2, 10, 220);
