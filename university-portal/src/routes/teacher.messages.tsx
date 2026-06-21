import { createFileRoute } from "@tanstack/react-router";
import { MessagesPage } from "@/components/MessagesPage";

export const Route = createFileRoute("/teacher/messages")({
  head: () => ({ meta: [{ title: "Messages — Teacher Portal" }] }),
  component: MessagesPage,
});
