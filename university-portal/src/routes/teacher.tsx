import { createFileRoute, Outlet } from "@tanstack/react-router";
import DashboardLayout from "@/components/DashboardLayout";

export const Route = createFileRoute("/teacher")({
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
});
