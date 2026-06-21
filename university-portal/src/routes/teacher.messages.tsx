import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Inbox } from "lucide-react";
import { teacherInbox } from "@/data/data";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/messages")({
  head: () => ({ meta: [{ title: "Messages — Teacher Portal" }] }),
  component: TeacherMessages,
});

type Reply = { from: "me" | "them"; text: string; at: string };

function TeacherMessages() {
  const [items, setItems] = useState(
    teacherInbox.map((m) => ({ ...m, replies: [] as Reply[] })),
  );
  const [activeId, setActiveId] = useState(items[0].id);
  const [draft, setDraft] = useState("");

  const active = items.find((i) => i.id === activeId)!;

  const openMessage = (id: number) => {
    setActiveId(id);
    setItems(items.map((m) => (m.id === id ? { ...m, unread: false } : m)));
  };

  const reply = () => {
    if (!draft.trim()) return;
    const now = new Date().toISOString().slice(11, 16);
    setItems(items.map((m) =>
      m.id === activeId ? { ...m, replies: [...m.replies, { from: "me", text: draft, at: now }] } : m,
    ));
    setDraft("");
    toast.success("Reply sent");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Inbox className="h-6 w-6 text-amber-400" /> Inbox
        </h1>
        <p className="mt-1 text-sm text-slate-400">{items.filter((i) => i.unread).length} unread messages</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] h-[calc(100vh-15rem)] min-h-[500px]">
        {/* Inbox list */}
        <div className="overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <ul>
            {items.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => openMessage(m.id)}
                  className={`w-full text-left p-4 border-b border-white/5 transition ${
                    activeId === m.id ? "bg-amber-500/10" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${m.unread ? "font-bold text-white" : "font-medium text-slate-300"}`}>
                      {m.from}
                    </p>
                    <span className="text-[11px] text-slate-500 shrink-0">{m.at}</span>
                  </div>
                  <p className={`mt-0.5 text-sm truncate ${m.unread ? "text-white" : "text-slate-400"}`}>{m.subject}</p>
                  <p className="mt-1 text-xs text-slate-500 truncate">{m.preview}</p>
                  {m.unread && <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Thread */}
        <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/5 px-5 py-4">
            <p className="font-semibold text-white">{active.subject}</p>
            <p className="text-xs text-slate-500">From {active.from} · {active.at}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <p>{active.body}</p>
                <p className="mt-1.5 text-[10px] text-slate-500">{active.from} · {active.at}</p>
              </div>
            </div>
            {active.replies.map((r, i) => (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-amber-500 px-4 py-3 text-sm text-slate-900">
                  <p>{r.text}</p>
                  <p className="mt-1 text-[10px] text-slate-800/70">You · {r.at}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 p-3 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && reply()}
              placeholder="Type your reply..."
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 placeholder:text-slate-600"
            />
            <button
              onClick={reply}
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
