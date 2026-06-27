import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calendar,
  Megaphone,
  Bell,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── per-role quick links ─── */
const studentQuickLinks = [
  { to: "/student/dashboard",  label: "Home",     icon: LayoutDashboard },
  { to: "/student/timetable",  label: "Timetable", icon: Calendar },
  { to: "/student/notices",    label: "Notices",   icon: Megaphone },
  { to: "/student/activity",   label: "Alerts",    icon: Bell },
  { to: "/student/events",     label: "Calendar",  icon: CalendarDays },
];

const teacherQuickLinks = [
  { to: "/teacher/dashboard",  label: "Home",     icon: LayoutDashboard },
  { to: "/teacher/timetable",  label: "Timetable", icon: Calendar },
  { to: "/teacher/notices",    label: "Notices",   icon: Megaphone },
  { to: "/teacher/messages",   label: "Alerts",    icon: Bell },
];

const adminQuickLinks = [
  { to: "/admin/dashboard",          label: "Home",     icon: LayoutDashboard },
  { to: "/admin/timetable",          label: "Timetable", icon: Calendar },
  { to: "/admin/notices",            label: "Notices",   icon: Megaphone },
  { to: "/admin/notifications",      label: "Alerts",    icon: Bell },
  { to: "/admin/academic-calendar",  label: "Calendar",  icon: CalendarDays },
];

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isAdmin   = pathname.startsWith("/admin");
  const isTeacher = pathname.startsWith("/teacher");
  const links     = isAdmin ? adminQuickLinks : isTeacher ? teacherQuickLinks : studentQuickLinks;

  return (
    <nav
      className={cn(
        "lg:hidden",                           // only visible on mobile/tablet
        "fixed bottom-0 inset-x-0 z-50",
        "flex items-stretch",
        "border-t border-white/10",
        "bg-slate-950/90 backdrop-blur-xl",
        "safe-area-pb",                        // honours iOS home-bar
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {links.map((l) => {
        const active = pathname === l.to || pathname.startsWith(l.to + "/");
        const Icon   = l.icon;
        return (
          <Link
            key={l.to}
            to={l.to}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 px-1",
              "text-[10px] font-medium transition-all duration-200",
              "active:scale-90",
              active
                ? "text-amber-400"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {/* icon wrapper – glows when active */}
            <span
              className={cn(
                "grid h-8 w-8 place-items-center rounded-xl transition-all duration-200",
                active
                  ? "bg-amber-500/15 shadow-[0_0_10px_2px_rgba(245,158,11,0.15)]"
                  : "bg-transparent",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  active ? "text-amber-400" : "text-slate-500",
                )}
                strokeWidth={active ? 2.5 : 2}
              />
            </span>
            <span>{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default MobileBottomNav;
