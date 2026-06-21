// Hardcoded dummy data for the University Management Portal

export const currentUser = {
  id: "STU-2024-0142",
  name: "Ayesha Khan",
  email: "ayesha.khan@university.edu",
  role: "Student" as const,
  program: "BS Computer Science",
  semester: 5,
  avatar: "AK",
};

export const stats = {
  gpa: 3.72,
  cgpa: 3.65,
  attendance: 87,
  feeStatus: "Paid" as "Paid" | "Pending" | "Overdue",
  upcomingExam: {
    subject: "Database Systems",
    date: "2026-06-28T09:00:00",
  },
};

export const courses = [
  { id: "CS301", name: "Database Systems", teacher: "Dr. Imran Siddiqui", credits: 3, progress: 72, color: "amber" },
  { id: "CS305", name: "Operating Systems", teacher: "Dr. Sara Ahmed", credits: 4, progress: 65, color: "blue" },
  { id: "CS310", name: "Software Engineering", teacher: "Prof. Bilal Raza", credits: 3, progress: 80, color: "emerald" },
  { id: "CS315", name: "Computer Networks", teacher: "Dr. Nida Iqbal", credits: 3, progress: 55, color: "rose" },
  { id: "MTH201", name: "Linear Algebra", teacher: "Dr. Faisal Mehmood", credits: 3, progress: 90, color: "violet" },
  { id: "ENG101", name: "Technical Writing", teacher: "Ms. Hira Tariq", credits: 2, progress: 78, color: "cyan" },
];

export const teachers = courses.map((c) => ({ id: c.id, name: c.teacher, course: c.name }));

export const attendanceBySubject = [
  { course: "Database Systems", attended: 22, total: 25, percent: 88 },
  { course: "Operating Systems", attended: 18, total: 24, percent: 75 },
  { course: "Software Engineering", attended: 23, total: 25, percent: 92 },
  { course: "Computer Networks", attended: 16, total: 24, percent: 66 },
  { course: "Linear Algebra", attended: 24, total: 25, percent: 96 },
  { course: "Technical Writing", attended: 20, total: 23, percent: 87 },
];

export const attendanceLog = [
  { date: "2026-06-19", course: "Database Systems", status: "Present" },
  { date: "2026-06-19", course: "Linear Algebra", status: "Present" },
  { date: "2026-06-18", course: "Computer Networks", status: "Absent" },
  { date: "2026-06-18", course: "Software Engineering", status: "Present" },
  { date: "2026-06-17", course: "Operating Systems", status: "Late" },
  { date: "2026-06-17", course: "Technical Writing", status: "Present" },
  { date: "2026-06-16", course: "Database Systems", status: "Present" },
  { date: "2026-06-16", course: "Linear Algebra", status: "Present" },
  { date: "2026-06-15", course: "Computer Networks", status: "Present" },
  { date: "2026-06-15", course: "Software Engineering", status: "Absent" },
];

export const semesters = [
  {
    name: "Semester 1",
    gpa: 3.55,
    grades: [
      { course: "Programming Fundamentals", credits: 4, grade: "A", points: 4.0 },
      { course: "Calculus I", credits: 3, grade: "B+", points: 3.3 },
      { course: "English Composition", credits: 2, grade: "A-", points: 3.7 },
      { course: "Physics", credits: 3, grade: "B", points: 3.0 },
    ],
  },
  {
    name: "Semester 2",
    gpa: 3.6,
    grades: [
      { course: "Object Oriented Programming", credits: 4, grade: "A", points: 4.0 },
      { course: "Calculus II", credits: 3, grade: "B+", points: 3.3 },
      { course: "Discrete Math", credits: 3, grade: "A-", points: 3.7 },
      { course: "Pakistan Studies", credits: 2, grade: "A", points: 4.0 },
    ],
  },
  {
    name: "Semester 3",
    gpa: 3.68,
    grades: [
      { course: "Data Structures", credits: 4, grade: "A", points: 4.0 },
      { course: "Digital Logic", credits: 3, grade: "A-", points: 3.7 },
      { course: "Linear Algebra", credits: 3, grade: "B+", points: 3.3 },
      { course: "Islamic Studies", credits: 2, grade: "A", points: 4.0 },
    ],
  },
  {
    name: "Semester 4",
    gpa: 3.72,
    grades: [
      { course: "Algorithms", credits: 4, grade: "A", points: 4.0 },
      { course: "Database Concepts", credits: 3, grade: "A-", points: 3.7 },
      { course: "Probability & Stats", credits: 3, grade: "B+", points: 3.3 },
      { course: "Communication Skills", credits: 2, grade: "A", points: 4.0 },
    ],
  },
];

export const timetable = {
  slots: ["08:30 - 10:00", "10:15 - 11:45", "12:00 - 13:30", "14:00 - 15:30", "15:45 - 17:15"],
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  // grid[day][slot] => class info or null
  grid: [
    // Mon
    [
      { course: "Database Systems", room: "CS-201", teacher: "Dr. Imran" },
      { course: "Linear Algebra", room: "M-105", teacher: "Dr. Faisal" },
      null,
      { course: "Software Engineering", room: "CS-301", teacher: "Prof. Bilal" },
      null,
    ],
    // Tue
    [
      { course: "Operating Systems", room: "CS-205", teacher: "Dr. Sara" },
      null,
      { course: "Computer Networks", room: "CS-210", teacher: "Dr. Nida", cancelled: true },
      { course: "Technical Writing", room: "H-101", teacher: "Ms. Hira" },
      null,
    ],
    // Wed
    [
      { course: "Database Systems", room: "CS-201", teacher: "Dr. Imran" },
      { course: "Software Engineering", room: "CS-301", teacher: "Prof. Bilal" },
      null,
      { course: "Linear Algebra", room: "M-105", teacher: "Dr. Faisal" },
      null,
    ],
    // Thu
    [
      { course: "Operating Systems", room: "CS-205", teacher: "Dr. Sara" },
      { course: "Computer Networks", room: "CS-210", teacher: "Dr. Nida" },
      null,
      null,
      { course: "DB Lab", room: "Lab-3", teacher: "Dr. Imran" },
    ],
    // Fri
    [
      { course: "Software Engineering", room: "CS-301", teacher: "Prof. Bilal" },
      { course: "Technical Writing", room: "H-101", teacher: "Ms. Hira" },
      null,
      { course: "OS Lab", room: "Lab-2", teacher: "Dr. Sara" },
      null,
    ],
    // Sat
    [
      null,
      { course: "Networks Lab", room: "Lab-1", teacher: "Dr. Nida" },
      null,
      null,
      null,
    ],
  ] as Array<Array<{ course: string; room: string; teacher: string; cancelled?: boolean } | null>>,
};

export const exams = [
  { id: 1, subject: "Database Systems", date: "2026-06-28", time: "09:00 AM", venue: "Hall A", duration: "3 hrs", type: "Mid-Term" },
  { id: 2, subject: "Operating Systems", date: "2026-06-30", time: "12:00 PM", venue: "Hall B", duration: "3 hrs", type: "Mid-Term" },
  { id: 3, subject: "Software Engineering", date: "2026-07-02", time: "09:00 AM", venue: "Hall A", duration: "2 hrs", type: "Mid-Term" },
  { id: 4, subject: "Computer Networks", date: "2026-07-04", time: "02:00 PM", venue: "Hall C", duration: "3 hrs", type: "Mid-Term" },
  { id: 5, subject: "Linear Algebra", date: "2026-07-06", time: "09:00 AM", venue: "Hall B", duration: "2 hrs", type: "Mid-Term" },
  { id: 6, subject: "Technical Writing", date: "2026-07-08", time: "12:00 PM", venue: "Hall A", duration: "2 hrs", type: "Mid-Term" },
];

export const fees = {
  totalDue: 0,
  history: [
    { id: "CH-2026-S5", semester: "Semester 5", amount: 145000, dueDate: "2026-02-15", status: "Paid" as const, paidOn: "2026-02-10" },
    { id: "CH-2025-S4", semester: "Semester 4", amount: 142000, dueDate: "2025-08-15", status: "Paid" as const, paidOn: "2025-08-12" },
    { id: "CH-2025-S3", semester: "Semester 3", amount: 140000, dueDate: "2025-02-15", status: "Paid" as const, paidOn: "2025-02-14" },
    { id: "CH-2024-S2", semester: "Semester 2", amount: 138000, dueDate: "2024-08-15", status: "Paid" as const, paidOn: "2024-08-09" },
    { id: "CH-2024-S1", semester: "Semester 1", amount: 135000, dueDate: "2024-02-15", status: "Paid" as const, paidOn: "2024-02-13" },
    { id: "CH-2026-LAB", semester: "Lab Charges", amount: 8500, dueDate: "2026-07-30", status: "Pending" as const, paidOn: null },
  ],
};

export const library = {
  borrowed: [
    { id: 1, title: "Database System Concepts", author: "Silberschatz", borrowed: "2026-06-01", due: "2026-06-22", fine: 0 },
    { id: 2, title: "Modern Operating Systems", author: "Tanenbaum", borrowed: "2026-05-20", due: "2026-06-10", fine: 90 },
    { id: 3, title: "Clean Code", author: "Robert C. Martin", borrowed: "2026-06-10", due: "2026-07-01", fine: 0 },
    { id: 4, title: "Computer Networking: A Top-Down Approach", author: "Kurose & Ross", borrowed: "2026-06-12", due: "2026-07-03", fine: 0 },
  ],
};

export const notices = [
  { id: 1, title: "Mid-Term Exam Schedule Released", category: "Academic", date: "2026-06-15", body: "The mid-term exam schedule for Spring 2026 has been published. Please check the Exams tab for details." },
  { id: 2, title: "Library Closed on June 25", category: "Library", date: "2026-06-14", body: "The central library will remain closed on 25th June for inventory. Plan your borrowings accordingly." },
  { id: 3, title: "Annual Sports Gala Registration", category: "Event", date: "2026-06-12", body: "Registrations for the Annual Sports Gala are now open. Visit the Events tab to register your team." },
  { id: 4, title: "Fee Submission Deadline Extended", category: "Finance", date: "2026-06-10", body: "The lab charges submission deadline has been extended to 30th July, 2026." },
  { id: 5, title: "Guest Lecture: AI in Healthcare", category: "Academic", date: "2026-06-08", body: "Dr. Asma Riaz will deliver a guest lecture on AI in Healthcare on June 22 at Hall A." },
  { id: 6, title: "Hostel Maintenance Notice", category: "General", date: "2026-06-06", body: "Boys hostel block C will undergo electrical maintenance on June 24 from 10AM to 4PM." },
];

export const noticeCategories = ["All", "Academic", "Library", "Event", "Finance", "General"];

export const events = [
  { id: 1, title: "AI Guest Lecture", date: "2026-06-22", time: "11:00 AM", venue: "Hall A", description: "Dr. Asma Riaz on AI in Healthcare." },
  { id: 2, title: "Annual Sports Gala", date: "2026-06-25", time: "09:00 AM", venue: "Main Ground", description: "Inter-department sports competition." },
  { id: 3, title: "Hackathon 2026", date: "2026-06-28", time: "08:00 AM", venue: "CS Block", description: "24-hour coding marathon. Prizes worth PKR 200,000." },
  { id: 4, title: "Career Fair", date: "2026-07-05", time: "10:00 AM", venue: "Auditorium", description: "Top 30 companies recruiting on campus." },
  { id: 5, title: "Cultural Night", date: "2026-07-12", time: "06:00 PM", venue: "Open Air Theatre", description: "Annual cultural performances by students." },
  { id: 6, title: "Convocation 2026", date: "2026-07-20", time: "10:00 AM", venue: "Main Auditorium", description: "Graduation ceremony for the Class of 2026." },
];

export const messageThreads = [
  {
    teacherId: "CS301",
    teacher: "Dr. Imran Siddiqui",
    course: "Database Systems",
    messages: [
      { from: "teacher", text: "Reminder: Assignment 3 is due on Friday.", at: "2026-06-18 10:12" },
      { from: "me", text: "Sir, can we get a 2-day extension? Many of us have OS quiz on the same day.", at: "2026-06-18 10:34" },
      { from: "teacher", text: "Okay, extended to Monday. Submit on the portal.", at: "2026-06-18 11:02" },
    ],
  },
  {
    teacherId: "CS305",
    teacher: "Dr. Sara Ahmed",
    course: "Operating Systems",
    messages: [
      { from: "me", text: "Ma'am, are the lecture slides for chapter 4 uploaded?", at: "2026-06-17 09:20" },
      { from: "teacher", text: "Just uploaded. Check the LMS.", at: "2026-06-17 09:45" },
    ],
  },
  {
    teacherId: "CS310",
    teacher: "Prof. Bilal Raza",
    course: "Software Engineering",
    messages: [
      { from: "teacher", text: "Project proposals due next Wednesday.", at: "2026-06-16 14:00" },
    ],
  },
];

export const notifications = [
  { id: 1, title: "Assignment graded: DB Systems A2", time: "2h ago", read: false },
  { id: 2, title: "New notice: Mid-Term Exam Schedule", time: "1d ago", read: false },
  { id: 3, title: "Library book due in 2 days", time: "1d ago", read: true },
  { id: 4, title: "Fee challan available: Lab Charges", time: "3d ago", read: true },
];

// ============================================================
// TEACHER PORTAL DATA
// ============================================================

export const teacherUser = {
  id: "FAC-2018-0034",
  name: "Dr. Imran Siddiqui",
  email: "imran.siddiqui@university.edu",
  role: "Teacher" as const,
  department: "Computer Science",
  designation: "Associate Professor",
  joinedYear: 2018,
  office: "CS Block, Room 312",
  phone: "+92 300 1234567",
  avatar: "IS",
  qualifications: ["PhD Computer Science — LUMS, 2017", "MS Software Engineering — NUST, 2012", "BS Computer Science — FAST, 2009"],
  expertise: ["Database Systems", "Distributed Systems", "Data Mining"],
  subjectsAssigned: [
    { code: "CS301", name: "Database Systems", section: "BSCS-5A", students: 42 },
    { code: "CS401", name: "Advanced Databases", section: "BSCS-7A", students: 28 },
    { code: "CS601", name: "Distributed Systems", section: "MSCS-1", students: 18 },
  ],
};

export const teacherStats = {
  classesToday: [
    { time: "08:30 - 10:00", course: "Database Systems", section: "BSCS-5A", room: "CS-201", status: "Completed" },
    { time: "10:15 - 11:45", course: "Advanced Databases", section: "BSCS-7A", room: "CS-305", status: "Ongoing" },
    { time: "14:00 - 15:30", course: "Distributed Systems", section: "MSCS-1", room: "CS-410", status: "Upcoming" },
  ],
  totalStudents: 88,
  pendingTasks: [
    { id: 1, title: "Grade Mid-Term papers — CS301", due: "2026-06-22" },
    { id: 2, title: "Approve project proposals — CS401", due: "2026-06-23" },
    { id: 3, title: "Submit course feedback report", due: "2026-06-25" },
    { id: 4, title: "Review thesis chapter 3 — Ali Raza", due: "2026-06-21" },
  ],
};

export const teacherStudents: Record<string, Array<{ id: string; name: string; reg: string }>> = {
  CS301: [
    { id: "s1", name: "Ayesha Khan", reg: "BSCS-2024-0142" },
    { id: "s2", name: "Bilal Hassan", reg: "BSCS-2024-0148" },
    { id: "s3", name: "Sana Tariq", reg: "BSCS-2024-0151" },
    { id: "s4", name: "Hamza Ali", reg: "BSCS-2024-0156" },
    { id: "s5", name: "Mariam Iqbal", reg: "BSCS-2024-0159" },
    { id: "s6", name: "Usman Sheikh", reg: "BSCS-2024-0162" },
    { id: "s7", name: "Zara Mehmood", reg: "BSCS-2024-0167" },
    { id: "s8", name: "Faisal Rauf", reg: "BSCS-2024-0170" },
  ],
  CS401: [
    { id: "a1", name: "Tooba Anwar", reg: "BSCS-2022-0011" },
    { id: "a2", name: "Daniyal Yousaf", reg: "BSCS-2022-0019" },
    { id: "a3", name: "Hira Saleem", reg: "BSCS-2022-0024" },
    { id: "a4", name: "Ahmed Raza", reg: "BSCS-2022-0029" },
    { id: "a5", name: "Nimra Khalid", reg: "BSCS-2022-0033" },
  ],
  CS601: [
    { id: "m1", name: "Saad Ali", reg: "MSCS-2026-0003" },
    { id: "m2", name: "Hafsa Noor", reg: "MSCS-2026-0007" },
    { id: "m3", name: "Imran Bashir", reg: "MSCS-2026-0011" },
  ],
};

export const teacherCourseOptions = [
  { code: "CS301", label: "CS301 — Database Systems (BSCS-5A)" },
  { code: "CS401", label: "CS401 — Advanced Databases (BSCS-7A)" },
  { code: "CS601", label: "CS601 — Distributed Systems (MSCS-1)" },
];

export const gradebookSeed: Record<string, Record<string, { quiz: number; mid: number; assignment: number; final: number }>> = {
  CS301: {
    s1: { quiz: 18, mid: 28, assignment: 9, final: 38 },
    s2: { quiz: 15, mid: 25, assignment: 8, final: 35 },
    s3: { quiz: 19, mid: 29, assignment: 10, final: 40 },
    s4: { quiz: 12, mid: 22, assignment: 7, final: 30 },
    s5: { quiz: 17, mid: 27, assignment: 9, final: 36 },
    s6: { quiz: 14, mid: 24, assignment: 8, final: 33 },
    s7: { quiz: 20, mid: 30, assignment: 10, final: 42 },
    s8: { quiz: 13, mid: 23, assignment: 7, final: 31 },
  },
  CS401: {
    a1: { quiz: 18, mid: 27, assignment: 9, final: 37 },
    a2: { quiz: 16, mid: 25, assignment: 8, final: 34 },
    a3: { quiz: 19, mid: 28, assignment: 9, final: 39 },
    a4: { quiz: 14, mid: 23, assignment: 7, final: 31 },
    a5: { quiz: 17, mid: 26, assignment: 8, final: 35 },
  },
  CS601: {
    m1: { quiz: 19, mid: 29, assignment: 10, final: 41 },
    m2: { quiz: 18, mid: 28, assignment: 9, final: 38 },
    m3: { quiz: 17, mid: 27, assignment: 9, final: 36 },
  },
};

export const teacherTimetable = {
  slots: ["08:30 - 10:00", "10:15 - 11:45", "12:00 - 13:30", "14:00 - 15:30", "15:45 - 17:15"],
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  grid: [
    [
      { course: "Database Systems", room: "CS-201", section: "BSCS-5A" },
      { course: "Advanced DB", room: "CS-305", section: "BSCS-7A" },
      null,
      { course: "Distributed Sys", room: "CS-410", section: "MSCS-1" },
      null,
    ],
    [
      null,
      { course: "Office Hours", room: "Office 312", section: "Open" },
      { course: "Database Systems", room: "CS-201", section: "BSCS-5A", cancelled: true },
      null,
      null,
    ],
    [
      { course: "Database Systems", room: "CS-201", section: "BSCS-5A" },
      null,
      { course: "Advanced DB", room: "CS-305", section: "BSCS-7A" },
      { course: "Faculty Meeting", room: "Conference Hall", section: "Dept" },
      null,
    ],
    [
      null,
      { course: "Distributed Sys", room: "CS-410", section: "MSCS-1" },
      null,
      { course: "DB Lab", room: "Lab-3", section: "BSCS-5A" },
      null,
    ],
    [
      { course: "Advanced DB", room: "CS-305", section: "BSCS-7A" },
      null,
      { course: "Research Hours", room: "Office 312", section: "—" },
      null,
      null,
    ],
    [null, null, null, null, null],
  ] as Array<Array<{ course: string; room: string; section: string; cancelled?: boolean } | null>>,
};

export const leaveHistory = [
  { id: "LV-2026-014", type: "Casual Leave", from: "2026-05-12", to: "2026-05-13", days: 2, reason: "Family wedding", status: "Approved" as const },
  { id: "LV-2026-009", type: "Medical Leave", from: "2026-03-04", to: "2026-03-06", days: 3, reason: "Flu recovery", status: "Approved" as const },
  { id: "LV-2026-021", type: "Conference Leave", from: "2026-07-10", to: "2026-07-14", days: 5, reason: "ACM SIGMOD attendance", status: "Pending" as const },
  { id: "LV-2025-040", type: "Casual Leave", from: "2025-11-01", to: "2025-11-01", days: 1, reason: "Personal work", status: "Rejected" as const },
];

export const leaveTypes = ["Casual Leave", "Medical Leave", "Annual Leave", "Conference Leave", "Emergency Leave"];

export const teacherInbox = [
  { id: 1, from: "Dr. Sara Ahmed", subject: "Co-supervision request", preview: "Could you co-supervise Hamza's FYP on...", at: "10:42", unread: true, body: "Could you co-supervise Hamza's FYP on distributed caching? He has strong systems background and your expertise would be valuable." },
  { id: 2, from: "Admin Office", subject: "Faculty meeting agenda", preview: "Please review the attached agenda...", at: "Yesterday", unread: true, body: "Please review the attached agenda for Thursday's faculty meeting. Items include curriculum review and accreditation updates." },
  { id: 3, from: "Ayesha Khan (BSCS-5A)", subject: "Assignment 3 extension", preview: "Sir, we have an OS quiz on the same day...", at: "Tue", unread: false, body: "Sir, we have an OS quiz on the same day. Could the deadline be extended by two days?" },
  { id: 4, from: "HoD CS", subject: "Course allocation Fall 2026", preview: "Please confirm your preferred courses...", at: "Mon", unread: false, body: "Please confirm your preferred courses for Fall 2026 by end of this week." },
];

export const rooms = [
  { id: "CS-201", name: "CS-201 (Lecture Hall, 60 seats)" },
  { id: "CS-305", name: "CS-305 (Lecture Hall, 45 seats)" },
  { id: "CS-410", name: "CS-410 (Seminar Room, 25 seats)" },
  { id: "Lab-1", name: "Lab-1 (Networks Lab, 30 PCs)" },
  { id: "Lab-3", name: "Lab-3 (Database Lab, 30 PCs)" },
  { id: "Conf-A", name: "Conference Hall A (80 seats)" },
];

export const roomTimeSlots = [
  "08:30 - 10:00", "10:15 - 11:45", "12:00 - 13:30", "14:00 - 15:30", "15:45 - 17:15", "17:30 - 19:00",
];

export const roomRequestHistory = [
  { id: "RR-2026-007", room: "Lab-3", date: "2026-06-25", slot: "14:00 - 15:30", reason: "Extra DB lab session", status: "Approved" as const },
  { id: "RR-2026-009", room: "Conf-A", date: "2026-06-30", slot: "10:15 - 11:45", reason: "Research talk", status: "Pending" as const },
  { id: "RR-2026-005", room: "CS-410", date: "2026-06-12", slot: "12:00 - 13:30", reason: "Thesis defense", status: "Rejected" as const },
];

// ============================================================
// ADMIN PORTAL DATA
// ============================================================

export const adminStats = {
  totalStudents: 3842,
  totalTeachers: 186,
  totalCourses: 94,
  totalDepartments: 8,
};

export const adminStudents = [
  { id: "BSCS-2024-0142", name: "Ayesha Khan", program: "BS Computer Science", semester: 5, cgpa: 3.72, status: "Active" as const, email: "ayesha.khan@university.edu" },
  { id: "BSCS-2024-0148", name: "Bilal Hassan", program: "BS Computer Science", semester: 5, cgpa: 3.45, status: "Active" as const, email: "bilal.hassan@university.edu" },
  { id: "BSCS-2024-0151", name: "Sana Tariq", program: "BS Computer Science", semester: 5, cgpa: 3.88, status: "Active" as const, email: "sana.tariq@university.edu" },
  { id: "BSSE-2023-0021", name: "Hamza Ali", program: "BS Software Engineering", semester: 7, cgpa: 3.21, status: "Active" as const, email: "hamza.ali@university.edu" },
  { id: "BSIT-2025-0009", name: "Mariam Iqbal", program: "BS Information Technology", semester: 3, cgpa: 3.55, status: "Active" as const, email: "mariam.iqbal@university.edu" },
  { id: "MSCS-2026-0003", name: "Saad Ali", program: "MS Computer Science", semester: 1, cgpa: 3.91, status: "Active" as const, email: "saad.ali@university.edu" },
  { id: "BSCS-2022-0011", name: "Tooba Anwar", program: "BS Computer Science", semester: 7, cgpa: 3.67, status: "Active" as const, email: "tooba.anwar@university.edu" },
  { id: "BSCS-2023-0099", name: "Usman Sheikh", program: "BS Computer Science", semester: 5, cgpa: 2.98, status: "Warning" as const, email: "usman.sheikh@university.edu" },
];

export const adminTeachers = [
  { id: "FAC-2018-0034", name: "Dr. Imran Siddiqui", department: "Computer Science", designation: "Associate Professor", courses: ["CS301", "CS401", "CS601"], status: "Active" as const, email: "imran.siddiqui@university.edu" },
  { id: "FAC-2016-0018", name: "Dr. Sara Ahmed", department: "Computer Science", designation: "Assistant Professor", courses: ["CS305"], status: "Active" as const, email: "sara.ahmed@university.edu" },
  { id: "FAC-2020-0051", name: "Prof. Bilal Raza", department: "Computer Science", designation: "Lecturer", courses: ["CS310"], status: "Active" as const, email: "bilal.raza@university.edu" },
  { id: "FAC-2019-0042", name: "Dr. Nida Iqbal", department: "Computer Science", designation: "Assistant Professor", courses: ["CS315"], status: "Active" as const, email: "nida.iqbal@university.edu" },
  { id: "FAC-2015-0007", name: "Dr. Faisal Mehmood", department: "Mathematics", designation: "Professor", courses: ["MTH201"], status: "Active" as const, email: "faisal.mehmood@university.edu" },
  { id: "FAC-2022-0071", name: "Ms. Hira Tariq", department: "English", designation: "Lecturer", courses: ["ENG101"], status: "Active" as const, email: "hira.tariq@university.edu" },
];

export const adminCourses = [
  { code: "CS301", name: "Database Systems", department: "Computer Science", teacher: "Dr. Imran Siddiqui", credits: 3, students: 42, status: "Active" as const },
  { code: "CS305", name: "Operating Systems", department: "Computer Science", teacher: "Dr. Sara Ahmed", credits: 4, students: 38, status: "Active" as const },
  { code: "CS310", name: "Software Engineering", department: "Computer Science", teacher: "Prof. Bilal Raza", credits: 3, students: 45, status: "Active" as const },
  { code: "CS315", name: "Computer Networks", department: "Computer Science", teacher: "Dr. Nida Iqbal", credits: 3, students: 40, status: "Active" as const },
  { code: "MTH201", name: "Linear Algebra", department: "Mathematics", teacher: "Dr. Faisal Mehmood", credits: 3, students: 55, status: "Active" as const },
  { code: "ENG101", name: "Technical Writing", department: "English", teacher: "Ms. Hira Tariq", credits: 2, students: 62, status: "Active" as const },
  { code: "CS401", name: "Advanced Databases", department: "Computer Science", teacher: "Dr. Imran Siddiqui", credits: 3, students: 28, status: "Active" as const },
  { code: "CS601", name: "Distributed Systems", department: "Computer Science", teacher: "Dr. Imran Siddiqui", credits: 3, students: 18, status: "Active" as const },
];

export const adminDepartments = [
  { id: "CS", name: "Computer Science", hod: "Dr. Khalid Mahmood", programs: 4, teachers: 24, students: 1200 },
  { id: "MATH", name: "Mathematics", hod: "Dr. Faisal Mehmood", programs: 2, teachers: 12, students: 340 },
  { id: "ENG", name: "English", hod: "Dr. Amna Bashir", programs: 2, teachers: 8, students: 280 },
  { id: "PHY", name: "Physics", hod: "Dr. Tariq Habib", programs: 2, teachers: 10, students: 220 },
  { id: "MGMT", name: "Management Sciences", hod: "Prof. Rabia Noor", programs: 3, teachers: 18, students: 650 },
  { id: "EE", name: "Electrical Engineering", hod: "Dr. Adnan Rauf", programs: 3, teachers: 22, students: 580 },
  { id: "ME", name: "Mechanical Engineering", hod: "Dr. Salman Khan", programs: 2, teachers: 16, students: 420 },
  { id: "ARCH", name: "Architecture", hod: "Prof. Zainab Mirza", programs: 1, teachers: 10, students: 152 },
];

export const adminEnrollments = [
  { id: "ENR-001", student: "Ayesha Khan", studentId: "BSCS-2024-0142", course: "CS301 — Database Systems", semester: "Spring 2026", status: "Enrolled" as const },
  { id: "ENR-002", student: "Bilal Hassan", studentId: "BSCS-2024-0148", course: "CS301 — Database Systems", semester: "Spring 2026", status: "Enrolled" as const },
  { id: "ENR-003", student: "Sana Tariq", studentId: "BSCS-2024-0151", course: "CS401 — Advanced Databases", semester: "Spring 2026", status: "Enrolled" as const },
  { id: "ENR-004", student: "Hamza Ali", studentId: "BSSE-2023-0021", course: "CS305 — Operating Systems", semester: "Spring 2026", status: "Enrolled" as const },
  { id: "ENR-005", student: "Mariam Iqbal", studentId: "BSIT-2025-0009", course: "MTH201 — Linear Algebra", semester: "Spring 2026", status: "Dropped" as const },
];

export const adminFees = [
  { id: "FEE-001", student: "Ayesha Khan", studentId: "BSCS-2024-0142", semester: "Semester 5", amount: 145000, dueDate: "2026-02-15", status: "Paid" as const, paidOn: null as string | null },
  { id: "FEE-002", student: "Bilal Hassan", studentId: "BSCS-2024-0148", semester: "Semester 5", amount: 145000, dueDate: "2026-02-15", status: "Paid" as const, paidOn: null as string | null },
  { id: "FEE-003", student: "Usman Sheikh", studentId: "BSCS-2023-0099", semester: "Semester 5", amount: 145000, dueDate: "2026-02-15", status: "Overdue" as const, paidOn: null as string | null },
  { id: "FEE-004", student: "Mariam Iqbal", studentId: "BSIT-2025-0009", semester: "Lab Charges", amount: 8500, dueDate: "2026-07-30", status: "Pending" as const, paidOn: null as string | null },
  { id: "FEE-005", student: "Hamza Ali", studentId: "BSSE-2023-0021", semester: "Semester 7", amount: 148000, dueDate: "2026-02-15", status: "Paid" as const, paidOn: null as string | null },
  { id: "FEE-006", student: "Saad Ali", studentId: "MSCS-2026-0003", semester: "Semester 1", amount: 185000, dueDate: "2026-02-15", status: "Paid" as const, paidOn: null as string | null },
];

export const adminExams = [
  { id: "EX-001", subject: "Database Systems", course: "CS301", date: "2026-06-28", time: "09:00 AM", venue: "Hall A", duration: "3 hrs", invigilator: "Dr. Sara Ahmed", type: "Mid-Term" },
  { id: "EX-002", subject: "Operating Systems", course: "CS305", date: "2026-06-30", time: "12:00 PM", venue: "Hall B", duration: "3 hrs", invigilator: "Prof. Bilal Raza", type: "Mid-Term" },
  { id: "EX-003", subject: "Software Engineering", course: "CS310", date: "2026-07-02", time: "09:00 AM", venue: "Hall A", duration: "2 hrs", invigilator: "Dr. Nida Iqbal", type: "Mid-Term" },
  { id: "EX-004", subject: "Computer Networks", course: "CS315", date: "2026-07-04", time: "02:00 PM", venue: "Hall C", duration: "3 hrs", invigilator: "Dr. Imran Siddiqui", type: "Mid-Term" },
];

export const adminRoomRequests = [
  { id: "RR-2026-009", teacher: "Dr. Imran Siddiqui", teacherId: "FAC-2018-0034", room: "Conf-A", date: "2026-06-30", slot: "10:15 - 11:45", reason: "Research talk — Distributed Caching", status: "Pending" as const },
  { id: "RR-2026-010", teacher: "Dr. Sara Ahmed", teacherId: "FAC-2016-0018", room: "Lab-1", date: "2026-07-01", slot: "14:00 - 15:30", reason: "Extra networks lab session", status: "Pending" as const },
  { id: "RR-2026-007", teacher: "Dr. Imran Siddiqui", teacherId: "FAC-2018-0034", room: "Lab-3", date: "2026-06-25", slot: "14:00 - 15:30", reason: "Extra DB lab session", status: "Approved" as const },
  { id: "RR-2026-005", teacher: "Prof. Bilal Raza", teacherId: "FAC-2020-0051", room: "CS-410", date: "2026-06-12", slot: "12:00 - 13:30", reason: "Thesis defense", status: "Rejected" as const },
];

export const adminFeedback = [
  { id: 1, teacher: "Dr. Imran Siddiqui", course: "CS301 — Database Systems", rating: 4, comment: "Very knowledgeable and explains concepts clearly. Assignments are well-structured.", anonymous: true, date: "2026-06-15" },
  { id: 2, teacher: "Dr. Imran Siddiqui", course: "CS301 — Database Systems", rating: 5, comment: "Best teacher in the department. Always available during office hours.", anonymous: true, date: "2026-06-14" },
  { id: 3, teacher: "Dr. Sara Ahmed", course: "CS305 — Operating Systems", rating: 3, comment: "Content is good but pace is too fast. Slides could be more detailed.", anonymous: true, date: "2026-06-13" },
  { id: 4, teacher: "Prof. Bilal Raza", course: "CS310 — Software Engineering", rating: 4, comment: "Practical approach to teaching. Project-based learning is very effective.", anonymous: false, date: "2026-06-12" },
  { id: 5, teacher: "Dr. Sara Ahmed", course: "CS305 — Operating Systems", rating: 5, comment: "Extremely helpful and patient. Lab sessions are very informative.", anonymous: true, date: "2026-06-11" },
];

export const adminDocumentRequests = [
  { id: "DOC-2026-011", student: "Ayesha Khan", studentId: "BSCS-2024-0142", type: "Transcript", requestedOn: "2026-06-18", status: "Processing" as const, note: "" },
  { id: "DOC-2026-012", student: "Bilal Hassan", studentId: "BSCS-2024-0148", type: "Enrollment Certificate", requestedOn: "2026-06-17", status: "Pending" as const, note: "" },
  { id: "DOC-2026-008", student: "Hamza Ali", studentId: "BSSE-2023-0021", type: "Character Certificate", requestedOn: "2026-06-10", status: "Ready to Collect" as const, note: "Available at admin office" },
  { id: "DOC-2026-007", student: "Mariam Iqbal", studentId: "BSIT-2025-0009", type: "Transcript", requestedOn: "2026-06-08", status: "Ready to Collect" as const, note: "Collected on 2026-06-15" },
  { id: "DOC-2026-005", student: "Saad Ali", studentId: "MSCS-2026-0003", type: "Degree Certificate", requestedOn: "2026-05-20", status: "Processing" as const, note: "Awaiting registrar approval" },
];

export const adminNotifications = [
  { id: 1, type: "room", title: "Room request: Conf-A by Dr. Imran Siddiqui", message: "New room request for 30 June — Research Talk", time: "2h ago", read: false },
  { id: 2, type: "fee", title: "Overdue fee alert: Usman Sheikh", message: "Semester 5 fee overdue since Feb 15", time: "1d ago", read: false },
  { id: 3, type: "doc", title: "Document request: Transcript — Ayesha Khan", message: "New transcript request submitted", time: "1d ago", read: true },
  { id: 4, type: "results", title: "Results submitted: CS601 by Dr. Imran", message: "Distributed Systems results pending approval", time: "2d ago", read: true },
  { id: 5, type: "enrollment", title: "Late enrollment: Mariam Iqbal dropped MTH201", message: "Enrollment change requires approval", time: "3d ago", read: true },
];

export const adminAuditLogs = [
  { id: 1, user: "Dr. Imran Siddiqui", role: "Teacher", action: "Submitted results for CS601", timestamp: "2026-06-19 14:32", type: "Results" },
  { id: 2, user: "Admin", role: "Admin", action: "Approved room request RR-2026-007", timestamp: "2026-06-18 11:05", type: "Room" },
  { id: 3, user: "Ayesha Khan", role: "Student", action: "Submitted feedback for CS301", timestamp: "2026-06-18 09:44", type: "Feedback" },
  { id: 4, user: "Admin", role: "Admin", action: "Posted notice: Mid-Term Exam Schedule", timestamp: "2026-06-15 10:00", type: "Notice" },
  { id: 5, user: "Dr. Sara Ahmed", role: "Teacher", action: "Saved attendance for CS305 — 2026-06-17", timestamp: "2026-06-17 10:20", type: "Attendance" },
  { id: 6, user: "Admin", role: "Admin", action: "Marked FEE-001 as Paid", timestamp: "2026-06-10 14:00", type: "Fee" },
  { id: 7, user: "Bilal Hassan", role: "Student", action: "Requested enrollment certificate", timestamp: "2026-06-17 16:33", type: "Document" },
  { id: 8, user: "Admin", role: "Admin", action: "Added new course: CS601 Distributed Systems", timestamp: "2026-06-01 09:00", type: "Course" },
];

export const adminCalendarEvents = [
  { id: 1, title: "Mid-Term Exams Begin", date: "2026-06-28", endDate: "2026-07-08", category: "Academic", color: "amber" },
  { id: 2, title: "Annual Sports Gala", date: "2026-06-25", endDate: "2026-06-25", category: "Event", color: "emerald" },
  { id: 3, title: "Hackathon 2026", date: "2026-06-28", endDate: "2026-06-29", category: "Event", color: "sky" },
  { id: 4, title: "Library Closed — Inventory", date: "2026-06-25", endDate: "2026-06-25", category: "General", color: "rose" },
  { id: 5, title: "Career Fair", date: "2026-07-05", endDate: "2026-07-05", category: "Event", color: "violet" },
  { id: 6, title: "Semester Result Declaration", date: "2026-07-15", endDate: "2026-07-15", category: "Academic", color: "amber" },
  { id: 7, title: "Convocation 2026", date: "2026-07-20", endDate: "2026-07-20", category: "Academic", color: "amber" },
  { id: 8, title: "Fall 2026 Enrollment Begins", date: "2026-07-22", endDate: "2026-08-05", category: "Academic", color: "emerald" },
];

export const calendarCategories = ["Academic", "Event", "General", "Exam", "Holiday"];
