import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

function StudentGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (!token) { navigate({ to: "/" }); return; }
    if (role !== "student") {
      if (role === "admin")   navigate({ to: "/admin/dashboard" });
      else                    navigate({ to: "/teacher/dashboard" });
    }
  }, []);
  return <DashboardLayout><Outlet /></DashboardLayout>;
}

export const Route = createFileRoute("/student")({ component: StudentGuard });
