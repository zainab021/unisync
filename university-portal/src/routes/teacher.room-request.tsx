import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DoorOpen, BellRing } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/room-request")({
  head: () => ({ meta: [{ title: "Room Request — Teacher Portal" }] }),
  component: RoomRequestPage,
});

const API       = "http://localhost:5000/api/room-requests";
const ROOMS_API = "http://localhost:5000/api/timetable/rooms";
const SLOTS_API = "http://localhost:5000/api/timetable/slots";
const getToken  = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Request = { id: string; room: string; date: string; slot: string; reason: string; status: string };
type Room    = { id: number; room_name: string; type_name: string };
type Slot    = { id: number; slot_name: string; start_time: string; end_time: string };

function RoomRequestPage() {
  const [rooms, setRooms]     = useState<Room[]>([]);
  const [slots, setSlots]     = useState<Slot[]>([]);
  const [history, setHistory] = useState<Request[]>([]);
  const [room, setRoom]       = useState("");
  const [date, setDate]       = useState("");
  const [slot, setSlot]       = useState("");
  const [reason, setReason]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(ROOMS_API, { headers: authHeaders() }).then(r => r.json()).then(d => { if (Array.isArray(d) && d.length) { setRooms(d); setRoom(d[0].room_name); } }).catch(() => {});
    fetch(SLOTS_API, { headers: authHeaders() }).then(r => r.json()).then(d => { if (Array.isArray(d) && d.length) { setSlots(d); setSlot(`${d[0].start_time}–${d[0].end_time}`); } }).catch(() => {});
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch(`${API}/my`, { headers: authHeaders() });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !reason.trim()) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      const res = await fetch(API, { method: "POST", headers: authHeaders(), body: JSON.stringify({ room, date, slot, reason }) });
      if (!res.ok) throw new Error();
      toast.success("Room request submitted", { icon: <BellRing className="h-4 w-4" />, description: "Admin ko notification bhej di gayi" });
      setDate(""); setReason("");
      fetchHistory();
    } catch { toast.error("Failed to submit"); }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <DoorOpen className="h-6 w-6 text-amber-400" /> Room Request
        </h1>
        <p className="mt-1 text-sm text-slate-400">Reserve a room for extra classes, talks, or meetings.</p>
      </div>
      <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Room</label>
            <select value={room} onChange={e => setRoom(e.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40">
              {rooms.map(r => <option key={r.id} value={r.room_name} className="bg-slate-900">{r.room_name} ({r.type_name})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark]" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Time Slot</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {slots.map(s => {
                const val = `${s.start_time}–${s.end_time}`;
                return (
                  <button type="button" key={s.id} onClick={() => setSlot(val)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${slot === val ? "border-amber-500/50 bg-amber-500/15 text-amber-300" : "border-white/10 bg-white/5 text-slate-400 hover:text-white"}`}>
                    {s.slot_name}: {val}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reason</label>
          <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Why do you need this room?"
            className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 placeholder:text-slate-600" />
        </div>
        <button type="submit" disabled={loading} className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900 hover:from-amber-300 disabled:opacity-50">
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="border-b border-white/5 px-6 py-4"><h2 className="font-semibold text-white">Request History</h2></div>
        {history.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No requests yet.</p> : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                {["ID", "Room", "Date", "Time", "Reason", "Status"].map(h => <th key={h} className="px-6 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map(r => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">{r.id}</td>
                  <td className="px-6 py-3 text-white">{r.room}</td>
                  <td className="px-6 py-3 text-slate-300">{r.date?.slice(0,10)}</td>
                  <td className="px-6 py-3 text-slate-400">{r.slot}</td>
                  <td className="px-6 py-3 text-slate-400 max-w-xs truncate">{r.reason}</td>
                  <td className="px-6 py-3"><StatusBadge label={r.status} tone={r.status === "Approved" ? "success" : r.status === "Rejected" ? "danger" : "warning"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
