import { createFileRoute } from "@tanstack/react-router";
import { NoticesViewer } from "@/components/NoticesViewer";

export const Route = createFileRoute("/student/notices")({
  head: () => ({ meta: [{ title: "Notices — Student Portal" }] }),
  component: NoticesViewer,
});
