import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DoorOpen, BellRing, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/teacher/room-request")({
  head: () => ({ meta: [{ title: "Room Request — Teacher Portal" }] }),
  component: RoomRequestPage,
});

const BASE         = "http://localhost:5000/api";
const getToken     = () => localStorage.getItem("token") ?? "";
const authHeaders  = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Room    = { id: number; room_name: string; type_name: string; capacity: number };
type Slot    = { id: number; slot_name: string; start_time: string; end_time: string };
type Course  = { code: string; name: string };
type Request = { id: string; room: string; date: string; slot: string; reason: string; status: string };

function RoomRequestPage() {
  const [rooms, setRooms]       = useState<Room[]>([]);
  const [slots, setSlots]       = useState<Slot[]>([]);
  const [courses, setCourses]   = useState<Course[]>([]);
  const [history, setHistory]   = useState<Request[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrollment, setEnrollment]         = useState<number | null>(null);
  const [room, setRoom]                     = useState("");
  const [date, setDate]                     = useState("");
  const [slot, setSlot]                     = useState("");
  const [reason, setReason]                 = useState("");
  const [loading, setLoading]               = useState(false);

  useEffect(() => {
    fetch(`${BASE}/timetable/rooms`, { headers: authHeaders() })
      .then(r => r.json()).then(d => { if (Array.isArray(d) && d.length) { setRooms(d); setRoom(String(d[0].room_name)); } }).catch(() => {});

    fetch(`${BASE}/timetable/slots`)
      .then(r => r.json()).then(d => {
        if (Array.isArray(d) && d.length) {
          // Deduplicate slots by slot_name
          const seen = new Set();
          const unique = d.filter((s: Slot) => {
            if (seen.has(s.slot_name)) return false;
            seen.add(s.slot_name); return true;
          });
          setSlots(unique);
          setSlot(`${unique[0].start_time}–${unique[0].end_time}`);
        }
      }).catch(() => {});

    fetch(`${BASE}/courses`, { headers: authHeaders() })
      .then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});

    fetchHistory();
  }, []);

  // Fetch enrollment count when course changes
  useEffect(() => {
    if (!selectedCourse) { setEnrollment(null); return; }
    fetch(`${BASE}/enrollment?course=${selectedCourse}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => {
        const enrolled = Array.isArray(d) ? d.filter((e: any) => e.status === "Enrolled").length : 0;
        setEnrollment(enrolled);
      }).catch(() => setEnrollment(null));
  }, [selectedCourse]);

  async function fetchHistory() {
    try {
      const res  = await fetch(`${BASE}/room-requests/my`, { headers: authHeaders() });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !reason.trim()) return toast.error("Please fill in all fields.");
    if (!room) return toast.error("Please select a room.");

    // Capacity warning
    const selectedRoom = rooms.find(r => r.room_name === room);
    if (selectedRoom && enrollment !== null && enrollment > selectedRoom.capacity) {
      const proceed = confirm(`Warning: ${selectedRoom.room_name} has capacity for ${selectedRoom.capacity} students but your class has ${enrollment} enrolled. Submit anyway?`);
      if (!proceed) return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/room-requests`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ room, date, slot, reason })
      });
      if (!res.ok) throw new Error();
      toast.success("Room request submitted.", {
        icon: <BellRing className="h-4 w-4" />,
        description: "Admin has been notified and will review your request."
      });
      setDate(""); setReason(""); setSelectedCourse(""); setEnrollment(null);
      fetchHistory();
    } catch { toast.error("Failed to submit request."); }
    setLoading(false);
  }

  const selectedRoom   = rooms.find(r => r.room_name === room);
  const capacityOk     = selectedRoom && enrollment !== null ? enrollment <= selectedRoom.capacity : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <DoorOpen className="h-6 w-6 text-amber-400" /> Room Request
        </h1>
        <p className="mt-1 text-sm text-slate-400">Reserve a room for extra classes, talks, or meetings.</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">

        {/* Course selection */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Course <span className="text-slate-600 normal-case font-normal">(optional — for capacity check)</span>
          </label>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40">
            <option value="" className="bg-slate-900">— Select your course —</option>
            {courses.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.code} — {c.name}</option>)}
          </select>
          {selectedCourse && enrollment !== null && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Enrolled students:</span>
              <span className="font-bold text-white">{enrollment}</span>
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Room selection with capacity indicator */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Room</label>
            <select value={room} onChange={e => setRoom(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40">
              {rooms.map(r => {
                const fits = enrollment !== null ? enrollment <= r.capacity : true;
                return (
                  <option key={r.id} value={r.room_name} className="bg-slate-900">
                    {r.room_name} ({r.type_name}) — Cap: {r.capacity}{enrollment !== null ? (fits ? " ✓" : " ✗ too small") : ""}
                  </option>
                );
              })}
            </select>

            {/* Capacity status badge */}
            {selectedRoom && enrollment !== null && (
              <div className={`mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                capacityOk
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-300"
              }`}>
                {capacityOk
                  ? <><CheckCircle2 className="h-3.5 w-3.5" /> Room fits your class — {enrollment} students, capacity {selectedRoom.capacity}</>
                  : <><AlertTriangle className="h-3.5 w-3.5" /> Room too small — {enrollment} students but only {selectedRoom.capacity} seats</>
                }
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark]" />
          </div>
        </div>

        {/* Time slots */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Time Slot</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {slots.map(s => {
              const val = `${s.start_time}–${s.end_time}`;
              return (
                <button type="button" key={s.id} onClick={() => setSlot(val)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition tabular-nums ${
                    slot === val
                      ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}>
                  {s.slot_name}: {val}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reason</label>
          <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Why do you need this room? (e.g. makeup class for CS301, extra lecture)"
            className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 placeholder:text-slate-600" />
        </div>

        <button type="submit" disabled={loading}
          className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900 hover:from-amber-300 disabled:opacity-50 shadow-lg shadow-amber-500/20">
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {/* History */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="font-semibold text-white">Request History</h2>
        </div>
        {history.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No requests submitted yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                {["ID", "Room", "Date", "Time", "Reason", "Status"].map(h => (
                  <th key={h} className="px-6 py-3">{h}</th>
                ))}
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
                  <td className="px-6 py-3">
                    <StatusBadge label={r.status} tone={r.status === "Approved" ? "success" : r.status === "Rejected" ? "danger" : "warning"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
