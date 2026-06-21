import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@/components/StatusBadge";

export const Route = createFileRoute("/admin/room-approvals")({ component: AdminRoomApprovalsPage });

const API = "http://localhost:5000/api/room-requests";
const getToken = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type RoomReq = { id: string; teacher_name: string; room: string; date: string; slot: string; reason: string; status: string };

function AdminRoomApprovalsPage() {
  const [requests, setRequests] = useState<RoomReq[]>([]);

  useEffect(() => { fetchRequests(); }, []);

  async function fetchRequests() {
    try {
      const res  = await fetch(API, { headers: authHeaders() });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load"); }
  }

  async function updateStatus(id: string, status: "Approved" | "Rejected") {
    try {
      await fetch(`${API}/${id}/status`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status }) });
      toast.success(`Request ${status.toLowerCase()}`);
      fetchRequests();
    } catch { toast.error("Failed to update"); }
  }

  const pending  = requests.filter(r => r.status === "Pending");
  const resolved = requests.filter(r => r.status !== "Pending");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Room Approval Requests</h1>
      {pending.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-400">Pending ({pending.length})</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map(r => (
              <div key={r.id} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{r.teacher_name}</p>
                    <p className="text-xs text-slate-400">{r.id}</p>
                  </div>
                  <StatusBadge label={r.status} tone="warning" />
                </div>
                <div className="space-y-1 text-sm text-slate-400">
                  <p><span className="text-slate-500">Room:</span> <span className="text-slate-200">{r.room}</span></p>
                  <p><span className="text-slate-500">Date:</span> <span className="text-slate-200">{r.date?.slice(0,10)}</span></p>
                  <p><span className="text-slate-500">Slot:</span> <span className="text-slate-200">{r.slot}</span></p>
                  <p><span className="text-slate-500">Reason:</span> <span className="text-slate-200">{r.reason}</span></p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => updateStatus(r.id, "Approved")} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition">
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button onClick={() => updateStatus(r.id, "Rejected")} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 transition">
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {pending.length === 0 && <p className="mb-6 text-sm text-slate-500">Koi pending request nahi.</p>}
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Resolved ({resolved.length})</p>
      <div className="overflow-hidden rounded-xl bg-slate-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {["ID", "Teacher", "Room", "Date", "Slot", "Status"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resolved.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-sm text-slate-500">No resolved requests.</td></tr>}
            {resolved.map(r => (
              <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-mono text-xs text-amber-300">{r.id}</td>
                <td className="px-4 py-3 text-white">{r.teacher_name}</td>
                <td className="px-4 py-3 text-slate-400">{r.room}</td>
                <td className="px-4 py-3 text-slate-400">{r.date?.slice(0,10)}</td>
                <td className="px-4 py-3 text-slate-400">{r.slot}</td>
                <td className="px-4 py-3"><StatusBadge label={r.status} tone={r.status === "Approved" ? "success" : "danger"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
