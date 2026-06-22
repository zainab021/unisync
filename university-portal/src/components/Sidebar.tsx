import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Calendar,
  FileText,
  Wallet,
  Library,
  Megaphone,
  CalendarDays,
  Star,
  MessageSquare,
  ChevronLeft,
  GraduationCap as Logo,
  User,
  ClipboardList,
  PlaneTakeoff,
  DoorOpen,
  Award,
  Users,
  UserCheck,
  Building2,
  BarChart2,
  FolderOpen,
  Bell,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const studentLinks = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/courses", label: "Courses", icon: BookOpen },
  { to: "/student/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/student/results", label: "Results", icon: GraduationCap },
  { to: "/student/timetable", label: "Timetable", icon: Calendar },
  { to: "/student/exams", label: "Exams", icon: FileText },
  { to: "/student/fees", label: "Fees", icon: Wallet },
  { to: "/student/library", label: "Library", icon: Library },
  { to: "/student/notices", label: "Notices", icon: Megaphone },
  { to: "/student/events", label: "Events", icon: CalendarDays },
  { to: "/student/feedback",  label: "Feedback",  icon: Star },
  { to: "/student/messages",  label: "Messages",  icon: MessageSquare },
  { to: "/student/documents", label: "Documents", icon: FolderOpen },
  { to: "/student/activity",  label: "My Activity", icon: Bell },
];

const teacherLinks = [
  { to: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/teacher/profile", label: "Profile", icon: User },
  { to: "/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/teacher/gradebook", label: "Gradebook", icon: ClipboardList },
  { to: "/teacher/results", label: "Results", icon: Award },
  { to: "/teacher/timetable", label: "Timetable", icon: Calendar },
  { to: "/teacher/leave", label: "Leave", icon: PlaneTakeoff },
  { to: "/teacher/notices", label: "Notices", icon: Megaphone },
  { to: "/teacher/messages", label: "Messages", icon: MessageSquare },
  { to: "/teacher/room-request", label: "Room Request", icon: DoorOpen },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/teachers", label: "Teachers", icon: UserCheck },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/departments", label: "Departments", icon: Building2 },
  { to: "/admin/enrollment", label: "Enrollment", icon: ClipboardList },
  { to: "/admin/fees", label: "Fees", icon: Wallet },
  { to: "/admin/exams", label: "Exams", icon: FileText },
  { to: "/admin/timetable", label: "Timetable", icon: Calendar },
  { to: "/admin/notices", label: "Notices", icon: Megaphone },
  { to: "/admin/reports", label: "Reports", icon: BarChart2 },
  { to: "/admin/room-approvals", label: "Room Approvals", icon: DoorOpen },
  { to: "/admin/feedback", label: "Feedback", icon: Star },
  { to: "/admin/document-requests", label: "Documents", icon: FolderOpen },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/audit-logs", label: "Secure Backup", icon: Shield },
  { to: "/admin/academic-calendar", label: "Calendar", icon: CalendarDays },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  const isTeacher = pathname.startsWith("/teacher");
  const links = isAdmin ? adminLinks : isTeacher ? teacherLinks : studentLinks;
  const portalLabel = isAdmin ? "Admin Portal" : isTeacher ? "Teacher Portal" : "Student Portal";

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-white/5 bg-[#0F172A] text-slate-300 transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/20">
          <Logo className="h-5 w-5" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="truncate text-sm font-bold text-white">Northfield</p>
            <p className="truncate text-[11px] tracking-wider text-amber-400/80 uppercase">University</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
        <p
          className={cn(
            "mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500",
            collapsed && "opacity-0",
          )}
        >
          {portalLabel}
        </p>
        <ul className="space-y-0.5">
          {links.map((l) => {
            const active = pathname === l.to;
            const Icon = l.icon;
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-gradient-to-r from-amber-500/15 to-transparent text-amber-300 shadow-[inset_2px_0_0_0_#F59E0B]"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  )}
                  title={collapsed ? l.label : undefined}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active && "text-amber-400")} />
                  {!collapsed && <span className="truncate text-[13px]">{l.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse */}
      <button
        onClick={onToggle}
        className="m-3 flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/5 py-2 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition"
      >
        <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}

export default Sidebar;
