# UniSync — University Management System

> A complete digital solution for modern universities — One Platform, Zero Conflicts, Infinite Efficiency.

![UniSync](https://img.shields.io/badge/UniSync-University%20Portal-amber)
![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Overview

UniSync is a full-stack university management system that digitizes all university operations. It provides three dedicated portals for Admins, Teachers, and Students with real-time notifications, smart timetable management, and complete data security.

---

## Features

### Admin Portal
- Dashboard with live analytics (charts for fees, attendance, enrollments)
- Manage Students, Teachers, Courses, Departments
- Smart Timetable Management with **automatic clash detection** (room & teacher)
- Room-based scheduling with 82+ room support and utilization tracking
- Fee management with payment tracking
- Enrollment management with secure course drop approval workflow
- Exam scheduling and management
- Notice board and event calendar
- Reports with CSV export
- PIN-protected Secure Backup with restore capability
- Activity Log tracking all system actions
- Document request processing

### Teacher Portal
- Weekly teaching schedule view
- Mark attendance for enrolled students
- Gradebook — enter quiz, mid, assignment, final marks
- Submit results with grade calculation
- Leave request management
- Room booking with capacity check and conflict detection
- Post notices
- Messaging system

### Student Portal
- Personal timetable (Grid + List view)
- Attendance tracking with percentage per subject
- Results and grade history
- Fee challan history
- Course enrollment with secure drop request workflow
- Library catalog with availability status
- Notice board and events calendar
- Document request submission
- Feedback on teachers (anonymous option)
- Personal activity history (read-only)
- Messaging

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TanStack Router, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 17 |
| **Authentication** | JWT (JSON Web Token) |
| **Real-time** | Socket.io |
| **Email** | Nodemailer (Gmail) |
| **WhatsApp** | CallMeBot API |
| **Security** | Helmet.js, express-rate-limit, bcrypt |

---

## Security Features

- JWT role-based authentication (Admin / Teacher / Student)
- bcrypt password hashing (10 rounds)
- Rate limiting — login: 10 attempts / 15 min
- Security headers via Helmet.js
- Register route protected (admin only)
- Auto-backup on delete — PIN-protected restore
- Course drop requires admin approval
- Activity log tracking all actions

---

## Database

**25 Tables** including:

```
users, students, teachers, departments
courses, enrollments, grades, exams, attendance
fees, notices, messages, feedback
room_requests, leave_requests, document_requests, drop_requests
timetables, slots, rooms, roomtypes
calendar_events, audit_logs, notifications, deleted_backups
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 17
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/zainab021/-unisync.git
cd -unisync
```

**Backend Setup:**
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=university_portal
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_strong_jwt_secret
BACKUP_PIN=your_pin
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend Setup:**
```bash
cd university-portal
npm install
```

### Database Setup

1. Create PostgreSQL database: `university_portal`
2. Run schema: `psql -d university_portal -f backend/database.sql`
3. Load demo data: `psql -d university_portal -f backend/demo_data.sql`

### Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd university-portal && npm run dev
```

Open: `http://localhost:5173`

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@university.edu | password |
| Teacher | sara.ahmed@university.edu | teacher123 |
| Student | ayesha.khan@university.edu | teacher123 |

---

## Project Structure

```
unisync/
├── backend/
│   ├── routes/          # 20 API route files
│   ├── middleware/       # JWT auth middleware
│   ├── utils/           # Email, WhatsApp, backup, activity utilities
│   ├── database.sql     # Schema (25 tables)
│   ├── demo_data.sql    # Sample university data
│   └── server.js        # Express + Socket.io server
│
└── university-portal/
    └── src/
        ├── components/  # Shared UI components
        ├── routes/      # 44 page components (3 portals)
        ├── lib/         # Auth, socket utilities
        └── styles.css   # Global styles
```

---

## API Endpoints

| Route | Description |
|---|---|
| `POST /api/auth/login` | User login |
| `GET /api/students` | Get all students |
| `GET /api/teachers` | Get all teachers |
| `GET /api/courses` | Get all courses |
| `GET /api/timetable` | Get timetable |
| `GET /api/timetable/rooms` | Get all rooms |
| `POST /api/timetable` | Assign slot (with clash check) |
| `GET /api/attendance/my` | Student attendance |
| `POST /api/attendance` | Mark attendance |
| `GET /api/grades/my` | Student grades |
| `POST /api/grades/bulk` | Save bulk grades |
| `GET /api/fees/my` | Student fees |
| `POST /api/drop-requests` | Request course drop |
| `GET /api/notifications` | Get notifications |
| `GET /api/audit-logs` | Activity log (admin) |

---

## Testing

```bash
cd backend
npm test
```

Tests cover: Authentication, Security (rate limiting, token validation), Enrollment API.

---

## Deployment

See `DEPLOYMENT.md` for deployment guides on:
- Railway.app (recommended — free, auto HTTPS)
- Render.com

---

## License

MIT License — Free to use and modify.

---

*Built with React + Node.js + PostgreSQL*
