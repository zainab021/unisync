import { createFileRoute } from "@tanstack/react-router";
import { MessagesPage } from "@/components/MessagesPage";

export const Route = createFileRoute("/student/messages")({
  head: () => ({ meta: [{ title: "Messages — Student Portal" }] }),
  component: MessagesPage,
});
