import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Trash2, RotateCcw, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/audit-logs")({ component: AdminAuditLogsPage });

const API = "https://unisync-4ovf.onrender.com/api/backups";
const getToken = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Backup = { id: number; table_name: string; record_id: string; record_data: any; deleted_by_name: string; deleted_at: string };

const TABLE_COLORS: Record<string, string> = {
  students: "text-sky-400 bg-sky-500/10 border-sky-500/30",
  teachers: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  notices:  "text-amber-400 bg-amber-500/10 border-amber-500/30",
  courses:  "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
};

function AdminAuditLogsPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin]           = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [backups, setBackups]   = useState<Backup[]>([]);
  const [filter, setFilter]     = useState("All");

  useEffect(() => {
    if (unlocked) fetchBackups();
  }, [unlocked]);

  async function verifyPin(e: React.FormEvent) {
    e.preventDefault();
    if (!pin) return;
    setPinLoading(true);
    setPinError("");
    try {
      const res  = await fetch(`${API}/verify-pin`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ pin }) });
      const data = await res.json();
      if (data.success) {
        setUnlocked(true);
        toast.success("Access granted");
      } else {
        setPinError("Incorrect PIN — please try again.");
        setPin("");
      }
    } catch {
      setPinError("Could not connect to server. Please try again.");
    }
    setPinLoading(false);
  }

  async function fetchBackups() {
    try {
      const res = await fetch(API, { headers: authHeaders() });
      const data = await res.json();
      setBackups(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load backup logs"); }
  }

  async function restoreBackup(id: number, tableName: string) {
    if (!confirm(`Restore this "${tableName}" record back to the database?`)) return;
    try {
      const res  = await fetch(`${API}/${id}/restore`, { method: "POST", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Record restored successfully!`);
      fetchBackups();
    } catch (err: any) { toast.error(err.message ?? "Restore failed"); }
  }

  async function removeBackup(id: number) {
    if (!confirm("This backup will be permanently deleted and cannot be recovered. Are you sure?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE", headers: authHeaders() });
      toast.success("Backup entry permanently deleted.");
      fetchBackups();
    } catch { toast.error("Failed to remove"); }
  }

  // ── PIN Screen ──────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/15 text-amber-400">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Backup Access</h1>
            <p className="mt-2 text-sm text-slate-400">
              This page is restricted to authorized administrators only.<br />
              Enter your secret PIN to continue.
            </p>
          </div>

          <form onSubmit={verifyPin} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                Secret PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={e => { setPin(e.target.value); setPinError(""); }}
                placeholder="••••"
                maxLength={10}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none focus:border-amber-500/50"
              />
              {pinError && (
                <p className="mt-2 text-center text-xs text-rose-400">{pinError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={pinLoading || !pin}
              className="w-full rounded-lg bg-amber-500 py-3 text-sm font-bold text-slate-900 hover:bg-amber-400 disabled:opacity-50 transition"
            >
              {pinLoading ? "Checking..." : "Enter"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-600">
            After 5 incorrect attempts, access will be locked for 15 minutes.
          </p>
        </div>
      </div>
    );
  }

  // ── Backup Dashboard ────────────────────────────────────────────────
  const tables  = ["All", ...Array.from(new Set(backups.map(b => b.table_name)))];
  const filtered = filter === "All" ? backups : backups.filter(b => b.table_name === filter);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Deleted Records Backup</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">All deleted records are safely stored here — you can restore them anytime.</p>
        </div>
        <button onClick={() => { setUnlocked(false); setPin(""); }}
          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:text-white transition">
          Lock
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {["students", "teachers", "notices", "courses"].map(t => (
          <div key={t} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
            <p className="text-2xl font-bold text-white">{backups.filter(b => b.table_name === t).length}</p>
            <p className="text-xs capitalize text-slate-500">{t}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-1 border-b border-white/10">
        {tables.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition ${filter === t ? "border-b-2 border-amber-500 text-amber-300" : "text-slate-400 hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-slate-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {["#", "Table", "ID", "Record", "Deleted By", "Date", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-sm text-slate-500">No deleted records found.</td></tr>
            )}
            {filtered.map((b, i) => {
              const data    = typeof b.record_data === "string" ? JSON.parse(b.record_data) : b.record_data;
              const preview = data.name || data.title || data.code || b.record_id;
              const color   = TABLE_COLORS[b.table_name] || "text-slate-400 bg-white/5 border-white/10";
              return (
                <tr key={b.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${color}`}>
                      {b.table_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-amber-300">{b.record_id}</td>
                  <td className="px-4 py-3 font-medium text-white">{preview}</td>
                  <td className="px-4 py-3 text-slate-400">{b.deleted_by_name ?? "System"}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(b.deleted_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => restoreBackup(b.id, b.table_name)}
                        title="Restore karein"
                        className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition">
                        <RotateCcw className="h-3 w-3" /> Restore
                      </button>
                      <button onClick={() => removeBackup(b.id)}
                        title="Permanently delete"
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
