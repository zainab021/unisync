import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";

export const Route = createFileRoute("/admin/fees")({ component: AdminFeesPage });

const API = "http://localhost:5000/api/fees";
const getToken = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Fee = { id: string; student_id: string; student_name: string; semester: string; amount: number; due_date: string; status: string; paid_on?: string };
type FilterTab = "All" | "Paid" | "Pending" | "Overdue";
const toneMap: Record<string, "success" | "warning" | "danger"> = { Paid: "success", Pending: "warning", Overdue: "danger" };

function AdminFeesPage() {
  const [fees, setFees]     = useState<Fee[]>([]);
  const [filter, setFilter] = useState<FilterTab>("All");
  const [viewFee, setViewFee] = useState<Fee | null>(null);

  useEffect(() => { fetchFees(); }, []);

  async function fetchFees() {
    try {
      const res = await fetch(API, { headers: authHeaders() });
      const data = await res.json();
      setFees(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load fees"); }
  }

  async function markPaid(id: string) {
    try {
      await fetch(`${API}/${id}/pay`, { method: "PATCH", headers: authHeaders() });
      toast.success("Fee marked as paid");
      fetchFees();
    } catch { toast.error("Failed to update"); }
  }

  const filtered = filter === "All" ? fees : fees.filter(f => f.status === filter);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Fee Management</h1>
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total Paid", val: fees.filter(f => f.status === "Paid").length, color: "emerald" },
          { label: "Pending", val: fees.filter(f => f.status === "Pending").length, color: "amber" },
          { label: "Overdue", val: fees.filter(f => f.status === "Overdue").length, color: "rose" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className={`text-3xl font-bold text-${s.color}-400`}>{s.val}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mb-4 flex gap-1 border-b border-white/10">
        {(["All", "Paid", "Pending", "Overdue"] as FilterTab[]).map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-2.5 text-sm font-medium transition ${filter === t ? "border-b-2 border-amber-500 text-amber-300" : "text-slate-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl bg-slate-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {["ID", "Student", "Semester", "Amount", "Due Date", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm text-slate-500">No fees found.</td></tr>}
            {filtered.map(f => (
              <tr key={f.id} className={`border-t border-white/5 hover:bg-white/[0.03] ${f.status === "Overdue" ? "bg-rose-500/5" : ""}`}>
                <td className="px-4 py-3 font-mono text-xs text-amber-300">{f.id}</td>
                <td className="px-4 py-3 font-medium text-white">{f.student_name}</td>
                <td className="px-4 py-3 text-slate-400">{f.semester}</td>
                <td className="px-4 py-3 text-slate-300">PKR {Number(f.amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-400">{f.due_date?.slice(0, 10)}</td>
                <td className="px-4 py-3"><StatusBadge label={f.status} tone={toneMap[f.status]} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setViewFee(f)} className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"><Eye className="h-3.5 w-3.5" /></button>
                    {f.status !== "Paid" && (
                      <button onClick={() => markPaid(f.id)} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition">
                        Mark Paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!viewFee} onClose={() => setViewFee(null)} title="Fee Details">
        {viewFee && (
          <div className="space-y-3 text-sm">
            {[["ID", viewFee.id], ["Student", viewFee.student_name], ["Semester", viewFee.semester], ["Amount", `PKR ${Number(viewFee.amount).toLocaleString()}`], ["Due Date", viewFee.due_date?.slice(0, 10)], ["Status", viewFee.status], ["Paid On", viewFee.paid_on?.slice(0, 10) ?? "—"]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">{k}</span>
                <span className="font-medium text-white">{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
