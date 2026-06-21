import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/student/timetable")({
  head: () => ({ meta: [{ title: "Timetable — Student Portal" }] }),
  component: TimetablePage,
});

const API = "http://localhost:5000/api/timetable";
const getToken    = () => localStorage.getItem("token") ?? "";
const getStudentId = () => localStorage.getItem("profileId") ?? "";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type Entry = {
  id: number; day: string; slot_id: number; course_code: string;
  course_name: string; credits: number; teacher_name: string;
  room_name: string; slot_name: string; start_time: string; end_time: string;
};
type Slot = { id: number; slot_name: string; start_time: string; end_time: string };

function TimetablePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [slots, setSlots]     = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState<"grid" | "list">("grid");

  useEffect(() => {
    const sid = getStudentId();
    const headers = { Authorization: `Bearer ${getToken()}` };
    fetch(`${API}/slots`).then(r => r.json()).then(setSlots).catch(() => {});
    fetch(`${API}/student/${sid}`, { headers })
      .then(r => r.json())
      .then(d => setEntries(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function getCell(day: string, slot_id: number) {
    return entries.find(e => e.day === day && e.slot_id === slot_id) ?? null;
  }

  // Unique courses for list view
  const uniqueCourses = Array.from(
    entries.reduce((map, e) => {
      if (!map.has(e.course_code)) map.set(e.course_code, { ...e, schedule: [] as string[] });
      map.get(e.course_code)!.schedule.push(`${e.day} ${e.start_time}`);
      return map;
    }, new Map<string, Entry & { schedule: string[] }>()).values()
  );
  const totalCredits = uniqueCourses.reduce((s, c) => s + (c.credits || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Timetable</h1>
          <p className="mt-1 text-sm text-slate-400">Weekly class schedule — Spring 2026</p>
        </div>
        <div className="flex gap-2">
          {["grid", "list"].map(v => (
            <button key={v} onClick={() => setView(v as any)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition ${view === v ? "border-amber-500/50 bg-amber-500/15 text-amber-300" : "border-white/10 bg-white/5 text-slate-400"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading timetable...</p>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
          <p className="text-slate-400">No timetable assigned yet.</p>
          <p className="mt-1 text-xs text-slate-600">Admin will assign your schedule.</p>
        </div>
      ) : view === "grid" ? (
        // ── GRID VIEW ──────────────────────────────────────────
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
                          <div className="min-h-[64px] rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent px-3 py-2 hover:border-amber-500/40 transition">
                            <p className="text-xs font-bold text-white truncate">{cell.course_name}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">🏫 {cell.room_name}</p>
                            <p className="text-[10px] text-slate-500 truncate">👤 {cell.teacher_name}</p>
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
      ) : (
        // ── LIST VIEW ──────────────────────────────────────────
        <>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-3 flex items-center justify-between">
            <p className="text-sm text-slate-300">{uniqueCourses.length} Courses Enrolled</p>
            <p className="text-sm font-bold text-amber-400">{totalCredits} Total Credit Hours</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  {["#", "Code", "Course Name", "Credits", "Teacher", "Room", "Schedule"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {uniqueCourses.map((c, i) => (
                  <tr key={c.course_code} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 text-slate-500">{i + 1}</td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-amber-400">{c.course_code}</td>
                    <td className="px-5 py-4 font-medium text-white">{c.course_name}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">{c.credits}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-300 text-xs">{c.teacher_name}</td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{c.room_name}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {c.schedule.map((s, si) => (
                          <span key={si} className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10 bg-white/[0.02]">
                  <td colSpan={3} className="px-5 py-3 text-xs text-slate-500">Total: {uniqueCourses.length} courses</td>
                  <td className="px-5 py-3 text-center">
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-300">{totalCredits}</span>
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
