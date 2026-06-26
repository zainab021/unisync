import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export const Route = createFileRoute("/student/attendance")({
  head: () => ({ meta: [{ title: "Attendance — Student Portal" }] }),
  component: AttendancePage,
});

const API = "https://unisync-4ovf.onrender.com/api/attendance/my";
const getToken = () => localStorage.getItem("token") ?? "";

type AttendanceRecord = { id: number; course_code: string; course_name: string; date: string; status: string };
type CourseSummary = { course: string; attended: number; total: number; percent: number };

function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [tab, setTab]         = useState<"summary" | "log">("summary");

  useEffect(() => {
    fetch(API, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Build summary per course
  const summaryMap = records.reduce((map, r) => {
    const key = r.course_name || r.course_code;
    if (!map[key]) map[key] = { course: key, attended: 0, total: 0, percent: 0 };
    map[key].total++;
    if (r.status === "Present") map[key].attended++;
    return map;
  }, {} as Record<string, CourseSummary>);

  const summary: CourseSummary[] = Object.values(summaryMap).map(s => ({
    ...s,
    percent: s.total > 0 ? Math.round((s.attended / s.total) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Attendance</h1>
        <p className="mt-1 text-sm text-slate-400">Maintain at least 75% in every subject.</p>
      </div>
      <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
        {(["summary", "log"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition ${tab === t ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:text-white"}`}>
            {t === "summary" ? "Subject Summary" : "Date-wise Log"}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {summary.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No attendance records found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Attended</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3 w-1/3">Percentage</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {summary.map(row => {
                  const low = row.percent < 75;
                  return (
                    <tr key={row.course} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-medium text-white">{row.course}</td>
                      <td className="px-6 py-4 text-slate-300 tabular-nums">{row.attended}</td>
                      <td className="px-6 py-4 text-slate-400 tabular-nums">{row.total}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 rounded-full bg-white/5">
                            <div className={`h-full rounded-full ${low ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${row.percent}%` }} />
                          </div>
                          <span className={`text-xs font-bold tabular-nums ${low ? "text-rose-400" : "text-emerald-400"}`}>{row.percent}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {low ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-0.5 text-xs font-medium text-rose-300">
                            <AlertTriangle className="h-3 w-3" /> Low
                          </span>
                        ) : <StatusBadge label="Active" tone="success" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "log" && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {records.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No attendance records found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-slate-300 tabular-nums">{r.date?.slice(0, 10)}</td>
                    <td className="px-6 py-3 text-white">{r.course_name || r.course_code}</td>
                    <td className="px-6 py-3"><StatusBadge label={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
