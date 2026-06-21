import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import StatusBadge from "@/components/StatusBadge";
import { adminDocumentRequests } from "@/data/data";

export const Route = createFileRoute("/admin/document-requests")({ component: AdminDocumentRequestsPage });

type DocStatus = "Pending" | "Processing" | "Ready to Collect";
type DocReq = typeof adminDocumentRequests[number];

const toneMap: Record<DocStatus, "warning" | "info" | "success"> = { Pending: "warning", Processing: "info", "Ready to Collect": "success" };

function AdminDocumentRequestsPage() {
  const [docs, setDocs] = useState(adminDocumentRequests);

  const updateStatus = (id: string, status: DocStatus) => {
    setDocs((p) => p.map((d) => d.id === id ? { ...d, status } : d));
    toast.success(`Status updated to "${status}"`);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Document Requests</h1>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {(["Pending", "Processing", "Ready to Collect"] as DocStatus[]).map((s) => (
          <div key={s} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-white">{docs.filter((d) => d.status === s).length}</p>
            <p className="text-xs text-slate-500">{s}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl bg-slate-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {["ID", "Student", "Student ID", "Document Type", "Requested On", "Status", "Update"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-mono text-xs text-amber-300">{d.id}</td>
                <td className="px-4 py-3 font-medium text-white">{d.student}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{d.studentId}</td>
                <td className="px-4 py-3 text-slate-300">{d.type}</td>
                <td className="px-4 py-3 text-slate-400">{d.requestedOn}</td>
                <td className="px-4 py-3"><StatusBadge label={d.status} tone={toneMap[d.status as DocStatus]} /></td>
                <td className="px-4 py-3">
                  <select
                    value={d.status}
                    onChange={(e) => updateStatus(d.id, e.target.value as DocStatus)}
                    className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white outline-none"
                  >
                    {(["Pending", "Processing", "Ready to Collect"] as DocStatus[]).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
