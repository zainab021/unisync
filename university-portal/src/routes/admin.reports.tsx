import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@/components/StatusBadge";
import { attendanceBySubject, adminFees, adminStudents } from "@/data/data";

export const Route = createFileRoute("/admin/reports")({ component: AdminReportsPage });

const TABS = ["Attendance Report", "Results Report", "Fee Report"] as const;
type Tab = typeof TABS[number];

const resultsData = adminStudents.map((s) => ({ name: s.name, id: s.id, program: s.program, semester: s.semester, cgpa: s.cgpa, status: s.cgpa >= 2.0 ? "Pass" : "At Risk" }));

function AdminReportsPage() {
  const [tab, setTab] = useState<Tab>("Attendance Report");
  const [search, setSearch] = useState("");

  const handleExport = () => toast.success("Report exported as CSV");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mb-6 flex gap-1 border-b border-white/10">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium transition ${tab === t ? "border-b-2 border-amber-500 text-amber-300" : "text-slate-400 hover:text-white"}`}>{t}</button>
        ))}
      </div>

      <div className="mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter results..." className="w-full max-w-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50 placeholder:text-slate-600" />
      </div>

      {tab === "Attendance Report" && (
        <div className="overflow-hidden rounded-xl bg-slate-900/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["Course", "Attended", "Total", "Percentage", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceBySubject.filter((r) => r.course.toLowerCase().includes(search.toLowerCase())).map((r) => (
                <tr key={r.course} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium text-white">{r.course}</td>
                  <td className="px-4 py-3 text-slate-300">{r.attended}</td>
                  <td className="px-4 py-3 text-slate-300">{r.total}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${r.percent >= 75 ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${r.percent}%` }} />
                      </div>
                      <span className={r.percent < 75 ? "text-rose-300" : "text-slate-300"}>{r.percent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge label={r.percent >= 75 ? "Good" : "Low"} tone={r.percent >= 75 ? "success" : "danger"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Results Report" && (
        <div className="overflow-hidden rounded-xl bg-slate-900/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["Student", "ID", "Program", "Semester", "CGPA", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resultsData.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())).map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-amber-300">{r.id}</td>
                  <td className="px-4 py-3 text-slate-400">{r.program}</td>
                  <td className="px-4 py-3 text-slate-300">{r.semester}</td>
                  <td className="px-4 py-3 font-semibold text-white">{r.cgpa.toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge label={r.status} tone={r.status === "Pass" ? "success" : "danger"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Fee Report" && (
        <div className="overflow-hidden rounded-xl bg-slate-900/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["Student", "Semester", "Amount", "Due Date", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adminFees.filter((f) => f.student.toLowerCase().includes(search.toLowerCase())).map((f) => (
                <tr key={f.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium text-white">{f.student}</td>
                  <td className="px-4 py-3 text-slate-400">{f.semester}</td>
                  <td className="px-4 py-3 text-slate-300">PKR {f.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-400">{f.dueDate}</td>
                  <td className="px-4 py-3"><StatusBadge label={f.status} tone={f.status === "Paid" ? "success" : f.status === "Overdue" ? "danger" : "warning"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
