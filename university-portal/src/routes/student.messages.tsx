import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send } from "lucide-react";
import { messageThreads } from "@/data/data";
import { toast } from "sonner";

export const Route = createFileRoute("/student/messages")({
  head: () => ({ meta: [{ title: "Messages — Student Portal" }] }),
  component: MessagesPage,
});

type Msg = { from: "me" | "teacher"; text: string; at: string };

function MessagesPage() {
  const [active, setActive] = useState(messageThreads[0].teacherId);
  const [draft, setDraft] = useState("");
  const [threads, setThreads] = useState(
    messageThreads.map((t) => ({ ...t, messages: [...t.messages] as Msg[] })),
  );

  const current = threads.find((t) => t.teacherId === active)!;

  const send = () => {
    if (!draft.trim()) return;
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    setThreads(threads.map((t) =>
      t.teacherId === active ? { ...t, messages: [...t.messages, { from: "me", text: draft, at: now }] } : t,
    ));
    setDraft("");
    toast.success("Message sent");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Messages</h1>
        <p className="mt-1 text-sm text-slate-400">Direct conversations with your teachers.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr] h-[calc(100vh-15rem)] min-h-[500px]">
        {/* Threads list */}
        <div className="overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/5 p-3">
            <select
              value={active}
              onChange={(e) => setActive(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-amber-500/40"
            >
              {threads.map((t) => (
                <option key={t.teacherId} value={t.teacherId} className="bg-slate-900">
                  {t.teacher}
                </option>
              ))}
            </select>
          </div>
          <ul>
            {threads.map((t) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <li key={t.teacherId}>
                  <button
                    onClick={() => setActive(t.teacherId)}
                    className={`w-full text-left p-3 border-b border-white/5 transition ${
                      active === t.teacherId ? "bg-amber-500/10" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-300">
                        {t.teacher.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{t.teacher}</p>
                        <p className="text-[11px] text-slate-500 truncate">{t.course}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-400 truncate">{last?.text}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Conversation */}
        <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-300">
              {current.teacher.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <p className="font-semibold text-white">{current.teacher}</p>
              <p className="text-xs text-slate-500">{current.course}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {current.messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.from === "me"
                    ? "bg-amber-500 text-slate-900 rounded-br-sm"
                    : "bg-white/5 text-slate-200 rounded-bl-sm border border-white/5"
                }`}>
                  <p>{m.text}</p>
                  <p className={`mt-1 text-[10px] ${m.from === "me" ? "text-slate-800/70" : "text-slate-500"}`}>{m.at}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 p-3 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 placeholder:text-slate-600"
            />
            <button
              onClick={send}
              className="grid place-items-center rounded-lg bg-amber-500 px-4 text-slate-900 hover:bg-amber-400"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

