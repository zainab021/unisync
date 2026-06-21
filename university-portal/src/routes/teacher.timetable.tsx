import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/teacher/timetable")({
  head: () => ({ meta: [{ title: "Timetable — Teacher Portal" }] }),
  component: TeacherTimetable,
});

const API = "http://localhost:5000/api/timetable";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type Entry = { id: number; day: string; slot_id: number; course_name: string; room_name: string; start_time: string; end_time: string };
type Slot  = { id: number; start_time: string; end_time: string };

function getToken()    { return localStorage.getItem("token") ?? ""; }
function getTeacherId() { return localStorage.getItem("profileId") ?? ""; }

function TeacherTimetable() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [slots, setSlots]     = useState<Slot[]>([]);

  useEffect(() => {
    const teacherId = getTeacherId();
    const headers   = { Authorization: `Bearer ${getToken()}` };
    fetch(`${API}/slots`).then(r => r.json()).then(setSlots).catch(() => {});
    fetch(`${API}/teacher/${teacherId}`, { headers }).then(r => r.json()).then(data => setEntries(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  function getCell(day: string, slot_id: number) {
    return entries.find(e => e.day === day && e.slot_id === slot_id) ?? null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Teaching Schedule</h1>
        <p className="mt-1 text-sm text-slate-400">Your weekly class schedule.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="w-32 px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-400">Time</th>
              {DAYS.map(d => (
                <th key={d} className="px-3 py-3 text-left text-xs uppercase tracking-wider text-slate-400">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map(slot => (
              <tr key={slot.id} className="border-b border-white/5">
                <td className="px-4 py-3 text-xs font-medium text-slate-500 tabular-nums">
                  {slot.start_time} – {slot.end_time}
                </td>
                {DAYS.map(day => {
                  const cell = getCell(day, slot.id);
                  return (
                    <td key={day} className="px-2 py-3">
                      {cell ? (
                        <div className="h-16 rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent px-3 py-2 hover:border-amber-500/40 transition">
                          <p className="text-xs font-semibold truncate text-white">{cell.course_name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{cell.room_name}</p>
                        </div>
                      ) : (
                        <div className="h-16 rounded-lg border border-dashed border-white/5" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
