import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";

export const Route = createFileRoute("/student/documents")({
  head: () => ({ meta: [{ title: "Document Requests — Student Portal" }] }),
  component: DocumentsPage,
});

const API = "http://localhost:5000/api/doc-requests";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

const DOC_TYPES = [
  "Transcript", "Degree Certificate", "Character Certificate",
  "Enrollment Certificate", "Fee Clearance", "Migration Certificate",
];

const toneMap: Record<string, any> = { Pending: "warning", Processing: "info", "Ready to Collect": "success" };

type DocReq = { id: string; type: string; status: string; note: string; requested_on: string };

function DocumentsPage() {
  const [docs, setDocs]         = useState<DocReq[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]         = useState({ type: DOC_TYPES[0], note: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchDocs(); }, []);

  async function fetchDocs() {
    fetch(`${API}/my`, { headers: h() }).then(r => r.json()).then(d => setDocs(Array.isArray(d) ? d : [])).catch(() => {});
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(API, { method: "POST", headers: h(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success("Document request submitted. Admin will process it.");
      setModalOpen(false);
      setForm({ type: DOC_TYPES[0], note: "" });
      fetchDocs();
    } catch { toast.error("Failed to submit request."); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Document Requests</h1>
          <p className="mt-1 text-sm text-slate-400">Request official documents from the university.</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">
          <Plus className="h-4 w-4" /> New Request
        </button>
      </div>

      {/* Available documents info */}
      <div className="grid gap-3 sm:grid-cols-3">
        {DOC_TYPES.slice(0, 3).map(t => (
          <div key={t} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <FileText className="h-5 w-5 text-amber-400 shrink-0" />
            <span className="text-sm text-slate-300">{t}</span>
          </div>
        ))}
      </div>

      {/* My requests */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="font-semibold text-white">My Requests</h2>
        </div>
        {docs.length === 0 ? (
          <div className="py-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-600 mb-3" />
            <p className="text-slate-400">No requests submitted yet.</p>
            <p className="mt-1 text-xs text-slate-600">Click "New Request" to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                {["Request ID", "Document Type", "Requested On", "Status"].map(col => (
                  <th key={col} className="px-6 py-3">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {docs.map(d => (
                <tr key={d.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3 font-mono text-xs text-amber-300">{d.id}</td>
                  <td className="px-6 py-3 font-medium text-white">{d.type}</td>
                  <td className="px-6 py-3 text-slate-400">{d.requested_on?.slice(0,10)}</td>
                  <td className="px-6 py-3"><StatusBadge label={d.status} tone={toneMap[d.status]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Request a Document">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Document Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none">
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Additional Note (Optional)</label>
            <textarea rows={3} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Any specific instructions or purpose..."
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50 placeholder:text-slate-600" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
