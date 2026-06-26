import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/teacher/timetable")({
  head: () => ({ meta: [{ title: "Timetable — Teacher Portal" }] }),
  component: TeacherTimetable,
});

const API = "http://localhost:5000/api/timetable";
const getToken = () => localStorage.getItem("token") ?? "";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type Entry = { id: number; day: string; slot_id: number; course_name: string; room_name: string; start_time: string; end_time: string; slot_name: string };
type Slot  = { id: number; slot_name: string; start_time: string; end_time: string };

function TeacherTimetable() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [slots, setSlots]     = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    fetch(`${API}/slots`).then(r => r.json()).then(setSlots).catch(() => {});
    fetch(`${API}/my`, { headers })
      .then(r => r.json())
      .then(d => setEntries(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function getCell(day: string, slot_id: number) {
    return entries.find(e => e.day === day && e.slot_id === slot_id) ?? null;
  }

  const totalClasses = entries.length;
  const days = [...new Set(entries.map(e => e.day))].length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Teaching Schedule</h1>
          <p className="mt-1 text-sm text-slate-400">Your assigned classes — Spring 2026</p>
        </div>
        {totalClasses > 0 && (
          <div className="flex gap-3">
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-center">
              <p className="text-xs text-slate-500">Classes/Week</p>
              <p className="text-xl font-bold text-amber-400">{totalClasses}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-center">
              <p className="text-xs text-slate-500">Teaching Days</p>
              <p className="text-xl font-bold text-emerald-400">{days}</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading schedule...</p>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
          <p className="text-slate-400">No classes assigned yet.</p>
          <p className="mt-1 text-xs text-slate-600">Admin will assign your teaching schedule.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="w-28 px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-400">Time</th>
                {DAYS.map(d => (
                  <th key={d} className="px-3 py-3 text-left text-xs uppercase tracking-wider text-slate-400">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map(slot => (
                <tr key={slot.id} className="border-b border-white/5">
                  <td className="px-4 py-3">
                    <p className="text-[11px] font-semibold text-slate-400">{slot.slot_name}</p>
                    <p className="text-[10px] text-slate-600 tabular-nums">{slot.start_time}–{slot.end_time}</p>
                  </td>
                  {DAYS.map(day => {
                    const cell = getCell(day, slot.id);
                    return (
                      <td key={day} className="px-2 py-2">
                        {cell ? (
                          <div className="min-h-[64px] rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent px-3 py-2 hover:border-emerald-500/40 transition">
                            <p className="text-xs font-bold text-white truncate">{cell.course_name}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">🏫 {cell.room_name}</p>
                          </div>
                        ) : (
                          <div className="min-h-[64px] rounded-lg border border-dashed border-white/5" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
