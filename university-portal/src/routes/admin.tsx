import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

function AdminGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (!token) { navigate({ to: "/" }); return; }
    if (role !== "admin") {
      if (role === "teacher") navigate({ to: "/teacher/dashboard" });
      else                    navigate({ to: "/student/dashboard" });
    }
  }, []);
  return <DashboardLayout><Outlet /></DashboardLayout>;
}

export const Route = createFileRoute("/admin")({ component: AdminGuard });
