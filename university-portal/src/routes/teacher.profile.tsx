import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, GraduationCap, BookOpen } from "lucide-react";

export const Route = createFileRoute("/teacher/profile")({
  head: () => ({ meta: [{ title: "Profile — Teacher Portal" }] }),
  component: TeacherProfilePage,
});

const API = "http://localhost:5000/api/teachers/me";
const getToken = () => localStorage.getItem("token") ?? "";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Teacher = { id: string; name: string; email?: string; department: string; designation: string; phone?: string; office?: string };

function TeacherProfilePage() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState<Partial<Teacher>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(API, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setTeacher(data); setForm(data); })
      .catch(() => {});
  }, []);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/teachers/${teacher?.id}`, {
        method: "PUT", headers: authHeaders(), body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTeacher(updated);
      setEditing(false);
      toast.success("Profile updated");
    } catch { toast.error("Failed to save"); }
    setLoading(false);
  }

  if (!teacher) return <p className="py-8 text-center text-sm text-slate-500">Loading profile...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">My Profile</h1>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/15 text-2xl font-bold text-amber-400">
            {teacher.name.split(" ").map(n => n[0]).slice(0,2).join("")}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{teacher.name}</h2>
            <p className="text-sm text-slate-400">{teacher.designation} — {teacher.department}</p>
            <p className="text-xs text-amber-400 font-mono">{teacher.id}</p>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="ml-auto rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition">
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            {[["name", "Name"], ["department", "Department"], ["designation", "Designation"], ["phone", "Phone"], ["office", "Office"]] .map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</label>
                <input value={(form as any)[key] ?? ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={loading}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            {[
              [Mail, "Email", teacher.email ?? "—"],
              [Phone, "Phone", teacher.phone ?? "Not set"],
              [MapPin, "Office", teacher.office ?? "Not set"],
              [GraduationCap, "Designation", teacher.designation],
              [BookOpen, "Department", teacher.department],
            ].map(([Icon, label, value]: any) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <Icon className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{label}</p>
                  <p className="text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
