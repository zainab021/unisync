import { useState, useEffect } from "react";
import { Send, Inbox, ArrowUpRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

const API = "https://unisync-4ovf.onrender.com/api/messages";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Message = { id: number; body: string; read: boolean; created_at: string; sender_name?: string; receiver_name?: string; sender_role?: string; receiver_role?: string };
type User    = { id: number; name: string; role: string };

export function MessagesPage() {
  const [tab, setTab]         = useState<"inbox" | "sent" | "compose">("inbox");
  const [inbox, setInbox]     = useState<Message[]>([]);
  const [sent, setSent]       = useState<Message[]>([]);
  const [users, setUsers]     = useState<User[]>([]);
  const [toId, setToId]       = useState("");
  const [body, setBody]       = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`${API}/inbox`, { headers: h() }).then(r => r.json()).then(d => setInbox(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/sent`,  { headers: h() }).then(r => r.json()).then(d => setSent(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/users`, { headers: h() }).then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  async function markRead(id: number) {
    await fetch(`${API}/${id}/read`, { method: "PATCH", headers: h() }).catch(() => {});
    setInbox(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  }

  async function deleteMsg(id: number) {
    await fetch(`${API}/${id}`, { method: "DELETE", headers: h() }).catch(() => {});
    setInbox(prev => prev.filter(m => m.id !== id));
    setSent(prev => prev.filter(m => m.id !== id));
    toast.success("Message deleted.");
  }

  async function handleSend() {
    if (!toId || !body.trim()) { toast.error("Select recipient and write a message."); return; }
    setSending(true);
    try {
      const res = await fetch(API, { method: "POST", headers: h(), body: JSON.stringify({ to_id: Number(toId), body }) });
      if (!res.ok) throw new Error();
      toast.success("Message sent.");
      setBody(""); setToId(""); setTab("sent");
      fetch(`${API}/sent`, { headers: h() }).then(r => r.json()).then(d => setSent(Array.isArray(d) ? d : []));
    } catch { toast.error("Failed to send."); }
    setSending(false);
  }

  const unread = inbox.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Messages</h1>
        <p className="mt-1 text-sm text-slate-400">Communicate with university members.</p>
      </div>

      <div className="flex gap-1 border-b border-white/10">
        {[
          { key: "inbox",   label: `Inbox${unread > 0 ? ` (${unread})` : ""}`, icon: Inbox },
          { key: "sent",    label: "Sent",    icon: ArrowUpRight },
          { key: "compose", label: "Compose", icon: Send },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition ${tab === t.key ? "border-b-2 border-amber-500 text-amber-300" : "text-slate-400 hover:text-white"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "inbox" && (
        <div className="space-y-2">
          {inbox.length === 0
            ? <p className="py-8 text-center text-sm text-slate-500">No messages in inbox.</p>
            : inbox.map(m => (
              <div key={m.id} onClick={() => markRead(m.id)}
                className={`flex items-start gap-4 rounded-2xl border p-4 cursor-pointer transition ${!m.read ? "border-amber-500/30 bg-amber-500/5" : "border-white/10 bg-white/[0.02] hover:bg-white/5"}`}>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-400">
                  {m.sender_name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{m.sender_name} <span className="text-xs text-slate-500">({m.sender_role})</span></p>
                    <p className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{m.body}</p>
                  {!m.read && <span className="mt-1 inline-block rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-900">New</span>}
                </div>
                <button onClick={e => { e.stopPropagation(); deleteMsg(m.id); }} className="rounded p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
        </div>
      )}

      {tab === "sent" && (
        <div className="space-y-2">
          {sent.length === 0
            ? <p className="py-8 text-center text-sm text-slate-500">No sent messages.</p>
            : sent.map(m => (
              <div key={m.id} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">To: <span className="font-semibold text-white">{m.receiver_name}</span></p>
                    <p className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{m.body}</p>
                </div>
                <button onClick={() => deleteMsg(m.id)} className="rounded p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
        </div>
      )}

      {tab === "compose" && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">To</label>
            <select value={toId} onChange={e => setToId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40">
              <option value="">— Select recipient —</option>
              {users.map(u => <option key={u.id} value={u.id} className="bg-slate-900">{u.name} ({u.role})</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">Message</label>
            <textarea rows={5} value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message here..."
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 placeholder:text-slate-600" />
          </div>
          <button onClick={handleSend} disabled={sending}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-400 disabled:opacity-50">
            <Send className="h-4 w-4" /> {sending ? "Sending..." : "Send Message"}
          </button>
        </div>
      )}
    </div>
  );
}
