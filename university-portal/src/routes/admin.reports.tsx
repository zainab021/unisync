import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@/components/StatusBadge";

export const Route = createFileRoute("/admin/reports")({ component: AdminReportsPage });

const API = "https://unisync-4ovf.onrender.com/api";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ Authorization: `Bearer ${getToken()}` });

const TABS = ["Students", "Fees", "Attendance", "Courses"] as const;
type Tab = typeof TABS[number];

function AdminReportsPage() {
  const [tab, setTab]         = useState<Tab>("Students");
  const [search, setSearch]   = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [fees, setFees]       = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/students`,   { headers: h() }).then(r => r.json()),
      fetch(`${API}/fees`,       { headers: h() }).then(r => r.json()),
      fetch(`${API}/courses`,    { headers: h() }).then(r => r.json()),
    ]).then(([s, f, c]) => {
      setStudents(Array.isArray(s) ? s : []);
      setFees(Array.isArray(f) ? f : []);
      setCourses(Array.isArray(c) ? c : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function exportCSV() {
    let rows: string[][] = [];
    let filename = "";
    if (tab === "Students") {
      filename = "students_report.csv";
      rows = [["ID", "Name", "Program", "Semester", "CGPA", "Status"],
        ...filtered_students.map(s => [s.id, s.name, s.program, s.semester, Number(s.cgpa).toFixed(2), s.status])];
    } else if (tab === "Fees") {
      filename = "fees_report.csv";
      rows = [["ID", "Student", "Semester", "Amount", "Due Date", "Status"],
        ...filtered_fees.map(f => [f.id, f.student_name, f.semester, f.amount, f.due_date?.slice(0,10), f.status])];
    } else if (tab === "Courses") {
      filename = "courses_report.csv";
      rows = [["Code", "Name", "Department", "Teacher", "Credits", "Status"],
        ...filtered_courses.map(c => [c.code, c.name, c.department, c.teacher_name || "TBA", c.credits, c.status])];
    }
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${tab} report exported.`);
  }

  const q = search.toLowerCase();
  const filtered_students = students.filter(s => s.name?.toLowerCase().includes(q) || s.id?.toLowerCase().includes(q));
  const filtered_fees     = fees.filter(f => f.student_name?.toLowerCase().includes(q));
  const filtered_courses  = courses.filter(c => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q));

  const feeStats = {
    paid:    fees.filter(f => f.status === "Paid").length,
    pending: fees.filter(f => f.status === "Pending").length,
    overdue: fees.filter(f => f.status === "Overdue").length,
    total:   fees.reduce((s, f) => s + Number(f.amount || 0), 0),
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-xs text-slate-400">Real-time data from the database.</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: "Students",  val: students.length,  color: "amber" },
          { label: "Courses",   val: courses.length,   color: "sky" },
          { label: "Fees Paid", val: feeStats.paid,    color: "emerald" },
          { label: "Overdue",   val: feeStats.overdue, color: "rose" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border border-${s.color}-500/20 bg-${s.color}-500/5 p-4 text-center`}>
            <p className={`text-3xl font-bold text-${s.color}-400`}>{s.val}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-white/10">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition ${tab === t ? "border-b-2 border-amber-500 text-amber-300" : "text-slate-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 w-full max-w-sm focus-within:border-amber-500/50 transition">
        <Search className="h-4 w-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          className="flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-slate-600" />
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading data...</p>
      ) : (
        <>
          {tab === "Students" && (
            <div className="overflow-hidden rounded-xl bg-slate-900/50">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/10 bg-white/5">
                  {["Student ID", "Name", "Program", "Semester", "CGPA", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered_students.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-sm text-slate-500">No students found.</td></tr>}
                  {filtered_students.map(s => (
                    <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-mono text-xs text-amber-300">{s.id}</td>
                      <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                      <td className="px-4 py-3 text-slate-400">{s.program}</td>
                      <td className="px-4 py-3 text-slate-300">{s.semester}</td>
                      <td className="px-4 py-3 font-semibold text-white">{Number(s.cgpa).toFixed(2)}</td>
                      <td className="px-4 py-3"><StatusBadge label={s.status} tone={s.status === "Active" ? "success" : "warning"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "Fees" && (
            <>
              <div className="mb-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Paid",    val: feeStats.paid,    color: "emerald" },
                  { label: "Pending", val: feeStats.pending, color: "amber" },
                  { label: "Overdue", val: feeStats.overdue, color: "rose" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                    <p className={`text-2xl font-bold text-${s.color}-400`}>{s.val}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-hidden rounded-xl bg-slate-900/50">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/10 bg-white/5">
                    {["ID", "Student", "Semester", "Amount (PKR)", "Due Date", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {filtered_fees.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-sm text-slate-500">No fee records found.</td></tr>}
                    {filtered_fees.map(f => (
                      <tr key={f.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                        <td className="px-4 py-3 font-mono text-xs text-amber-300">{f.id}</td>
                        <td className="px-4 py-3 font-medium text-white">{f.student_name}</td>
                        <td className="px-4 py-3 text-slate-400">{f.semester}</td>
                        <td className="px-4 py-3 text-slate-300">{Number(f.amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-400">{f.due_date?.slice(0,10)}</td>
                        <td className="px-4 py-3"><StatusBadge label={f.status} tone={f.status === "Paid" ? "success" : f.status === "Overdue" ? "danger" : "warning"} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "Courses" && (
            <div className="overflow-hidden rounded-xl bg-slate-900/50">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/10 bg-white/5">
                  {["Code", "Course Name", "Department", "Teacher", "Credits", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered_courses.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-sm text-slate-500">No courses found.</td></tr>}
                  {filtered_courses.map(c => (
                    <tr key={c.code} className="border-t border-white/5 hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-mono text-amber-300">{c.code}</td>
                      <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                      <td className="px-4 py-3 text-slate-400">{c.department}</td>
                      <td className="px-4 py-3 text-slate-400">{c.teacher_name || "TBA"}</td>
                      <td className="px-4 py-3 text-slate-300">{c.credits}</td>
                      <td className="px-4 py-3"><StatusBadge label={c.status} tone="success" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "Attendance" && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
              <p className="text-slate-400">Attendance report coming soon.</p>
              <p className="mt-1 text-xs text-slate-600">Use the Attendance section to mark and view attendance records.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
