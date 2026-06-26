import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Download, Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/student/fees")({
  head: () => ({ meta: [{ title: "Fees — Student Portal" }] }),
  component: FeesPage,
});

const API = "https://unisync-4ovf.onrender.com/api/fees/my";
const getToken = () => localStorage.getItem("token") ?? "";

type Fee = { id: string; semester: string; amount: number; due_date: string; status: string; paid_on?: string };

function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);

  useEffect(() => {
    fetch(API, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(data => setFees(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const totalPaid    = fees.filter(f => f.status === "Paid").reduce((a, f) => a + Number(f.amount), 0);
  const totalPending = fees.filter(f => f.status === "Pending").reduce((a, f) => a + Number(f.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Fee & Finance</h1>
        <p className="mt-1 text-sm text-slate-400">Track challans, payments, and outstanding dues.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-5">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-wider">Total Paid</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-white tabular-nums">PKR {totalPaid.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-5">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-wider">Pending</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-white tabular-nums">PKR {totalPending.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 text-sky-400">
            <Wallet className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-wider">Account Status</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{totalPending > 0 ? "Dues Pending" : "In Good Standing"}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="font-semibold text-white">Challan History</h2>
        </div>
        {fees.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No fee records found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-400 bg-white/[0.02]">
              <tr>
                <th className="px-6 py-3">Challan ID</th>
                <th className="px-6 py-3">Semester</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {fees.map(f => (
                <tr key={f.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">{f.id}</td>
                  <td className="px-6 py-3 text-white">{f.semester}</td>
                  <td className="px-6 py-3 text-amber-400 tabular-nums">PKR {Number(f.amount).toLocaleString()}</td>
                  <td className="px-6 py-3 text-slate-400 tabular-nums">{f.due_date?.slice(0, 10)}</td>
                  <td className="px-6 py-3"><StatusBadge label={f.status} /></td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => toast.success(`Challan ${f.id} download started`)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-amber-500/15 hover:text-amber-300">
                      <Download className="h-3 w-3" /> Challan
                    </button>
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
