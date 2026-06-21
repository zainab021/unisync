import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PlaneTakeoff } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@/components/StatusBadge";

export const Route = createFileRoute("/teacher/leave")({
  head: () => ({ meta: [{ title: "Leave — Teacher Portal" }] }),
  component: TeacherLeavePage,
});

const API = "http://localhost:5000/api/leave-requests";
const getToken = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

const LEAVE_TYPES = ["Sick Leave", "Casual Leave", "Annual Leave", "Emergency Leave", "Study Leave"];
type Leave = { id: string; type: string; from_date: string; to_date: string; days: number; reason: string; status: string };

function TeacherLeavePage() {
  const [history, setHistory] = useState<Leave[]>([]);
  const [form, setForm]       = useState({ type: LEAVE_TYPES[0], from_date: "", to_date: "", reason: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchLeaves(); }, []);

  async function fetchLeaves() {
    try {
      const res  = await fetch(`${API}/my`, { headers: authHeaders() });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {}
  }

  function calcDays() {
    if (!form.from_date || !form.to_date) return 0;
    const diff = new Date(form.to_date).getTime() - new Date(form.from_date).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.from_date || !form.to_date || !form.reason) { toast.error("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const res = await fetch(API, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ ...form, days: calcDays() })
      });
      if (!res.ok) throw new Error();
      toast.success("Leave request submit ho gayi");
      setForm({ type: LEAVE_TYPES[0], from_date: "", to_date: "", reason: "" });
      fetchLeaves();
    } catch { toast.error("Failed to submit"); }
    setLoading(false);
  }

  const toneMap: Record<string, any> = { Approved: "success", Rejected: "danger", Pending: "warning" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <PlaneTakeoff className="h-6 w-6 text-amber-400" /> Leave Request
        </h1>
        <p className="mt-1 text-sm text-slate-400">Submit a leave application.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Leave Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40">
              {LEAVE_TYPES.map(t => <option key={t} className="bg-slate-900">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Days: {calcDays()}</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <input type="date" value={form.from_date} onChange={e => setForm(f => ({ ...f, from_date: e.target.value }))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark]" />
              <input type="date" value={form.to_date} onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark]" />
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reason</label>
          <textarea rows={3} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            className="mt-1.5 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 placeholder:text-slate-600"
            placeholder="Reason for leave..." />
        </div>
        <button type="submit" disabled={loading}
          className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900 hover:from-amber-300 disabled:opacity-50">
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="font-semibold text-white">Leave History</h2>
        </div>
        {history.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No leave requests found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">From</th>
                <th className="px-6 py-3">To</th>
                <th className="px-6 py-3">Days</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map(l => (
                <tr key={l.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3 text-white">{l.type}</td>
                  <td className="px-6 py-3 text-slate-300">{l.from_date?.slice(0,10)}</td>
                  <td className="px-6 py-3 text-slate-300">{l.to_date?.slice(0,10)}</td>
                  <td className="px-6 py-3 text-slate-400">{l.days}</td>
                  <td className="px-6 py-3 text-slate-400 max-w-xs truncate">{l.reason}</td>
                  <td className="px-6 py-3"><StatusBadge label={l.status} tone={toneMap[l.status]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
