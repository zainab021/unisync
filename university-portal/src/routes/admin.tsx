import { createFileRoute, Outlet } from "@tanstack/react-router";
import DashboardLayout from "@/components/DashboardLayout";

export const Route = createFileRoute("/admin")({
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
});
