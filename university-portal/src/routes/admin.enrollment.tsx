import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import { adminEnrollments, adminStudents, adminCourses } from "@/data/data";

export const Route = createFileRoute("/admin/enrollment")({ component: AdminEnrollmentPage });

type Enrollment = typeof adminEnrollments[number];

function AdminEnrollmentPage() {
  const [enrollments, setEnrollments] = useState(adminEnrollments);
  const [modalOpen, setModalOpen] = useState(false);
  const [student, setStudent] = useState(adminStudents[0].id);
  const [course, setCourse] = useState(adminCourses[0].code);
  const [semester, setSemester] = useState("Spring 2026");

  const handleEnroll = () => {
    const s = adminStudents.find((x) => x.id === student);
    const c = adminCourses.find((x) => x.code === course);
    if (!s || !c) return;
    const exists = enrollments.find((e) => e.studentId === student && e.course.startsWith(course));
    if (exists) { toast.error("Already enrolled in this course"); return; }
    const newE: Enrollment = { id: `ENR-${Date.now()}`, student: s.name, studentId: s.id, course: `${c.code} — ${c.name}`, semester, status: "Enrolled" };
    setEnrollments((p) => [...p, newE]);
    toast.success("Student enrolled successfully");
    setModalOpen(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Enrollment</h1>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">
          <Plus className="h-4 w-4" /> Enroll Student
        </button>
      </div>
      <div className="overflow-hidden rounded-xl bg-slate-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {["ID", "Student", "Student ID", "Course", "Semester", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-mono text-xs text-amber-300">{e.id}</td>
                <td className="px-4 py-3 font-medium text-white">{e.student}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.studentId}</td>
                <td className="px-4 py-3 text-slate-300">{e.course}</td>
                <td className="px-4 py-3 text-slate-400">{e.semester}</td>
                <td className="px-4 py-3"><StatusBadge label={e.status} tone={e.status === "Enrolled" ? "success" : "danger"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enroll Student">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Student</label>
            <select value={student} onChange={(e) => setStudent(e.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
              {adminStudents.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Course</label>
            <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none">
              {adminCourses.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Semester</label>
            <input value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
            <button onClick={handleEnroll} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition">Enroll</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
