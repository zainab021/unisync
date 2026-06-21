import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@/components/StatusBadge";

export const Route = createFileRoute("/admin/document-requests")({ component: AdminDocumentRequestsPage });

const API = "http://localhost:5000/api/doc-requests";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type DocStatus = "Pending" | "Processing" | "Ready to Collect";
type DocReq = { id: string; student_id: string; student_name: string; type: string; status: string; note: string; requested_on: string };

const toneMap: Record<string, any> = { Pending: "warning", Processing: "info", "Ready to Collect": "success" };

function AdminDocumentRequestsPage() {
  const [docs, setDocs]     = useState<DocReq[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDocs(); }, []);

  async function fetchDocs() {
    try {
      const res  = await fetch(API, { headers: h() });
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load requests."); }
    finally { setLoading(false); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`${API}/${id}/status`, { method: "PATCH", headers: h(), body: JSON.stringify({ status }) });
      toast.success(`Status updated to "${status}"`);
      fetchDocs();
    } catch { toast.error("Failed to update."); }
  }

  const STATUSES: DocStatus[] = ["Pending", "Processing", "Ready to Collect"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Document Requests</h1>
        <p className="mt-1 text-xs text-slate-400">Student document requests — update status to notify them.</p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {STATUSES.map(s => (
          <div key={s} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-white">{docs.filter(d => d.status === s).length}</p>
            <p className="text-xs text-slate-500">{s}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 transition">
        <Search className="h-4 w-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student or document type..."
          className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-600" />
      </div>
      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading requests...</p>
      ) : docs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center">
          <p className="text-slate-400">No document requests yet.</p>
          <p className="mt-1 text-xs text-slate-600">Students can submit requests from their portal.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-slate-900/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["ID", "Student", "Student ID", "Document Type", "Requested On", "Status", "Update"].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.filter(d => !search || d.student_name?.toLowerCase().includes(search.toLowerCase()) || d.type?.toLowerCase().includes(search.toLowerCase())).map(d => (
                <tr key={d.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-mono text-xs text-amber-300">{d.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{d.student_name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{d.student_id}</td>
                  <td className="px-4 py-3 text-slate-300">{d.type}</td>
                  <td className="px-4 py-3 text-slate-400">{d.requested_on?.slice(0,10)}</td>
                  <td className="px-4 py-3"><StatusBadge label={d.status} tone={toneMap[d.status]} /></td>
                  <td className="px-4 py-3">
                    <select value={d.status} onChange={e => updateStatus(d.id, e.target.value)}
                      className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white outline-none focus:border-amber-500/50">
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
