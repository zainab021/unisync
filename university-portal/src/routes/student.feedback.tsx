import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Student Portal" }] }),
  component: FeedbackPage,
});

const API         = "https://unisync-4ovf.onrender.com/api/feedback";
const COURSES_API  = "https://unisync-4ovf.onrender.com/api/courses/my";
const getToken    = () => localStorage.getItem("token") ?? "";
const h = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

type Course   = { code: string; name: string; teacher_id: string; teacher_name?: string };
type Feedback = { id: number; teacher_name: string; course_name: string; rating: number; comment: string; created_at: string };

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className={`text-2xl transition ${(hover || value) >= n ? "text-amber-400" : "text-slate-700"}`}>
          ★
        </button>
      ))}
    </div>
  );
}

function FeedbackPage() {
  const [courses, setCourses]       = useState<Course[]>([]);
  const [myFeedback, setMyFeedback] = useState<Feedback[]>([]);
  const [form, setForm]             = useState({ teacher_id: "", course_code: "", rating: 0, comment: "", anonymous: true });
  const [tab, setTab]               = useState<"submit" | "history">("submit");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(COURSES_API, { headers: h() }).then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API}/my`, { headers: h() }).then(r => r.json()).then(d => setMyFeedback(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // Unique teachers from enrolled courses only
  const teachers = Array.from(
    new Map(courses.filter(c => c.teacher_id).map(c => [c.teacher_id, { id: c.teacher_id, name: c.teacher_name ?? c.teacher_id }])).values()
  );

  function handleCourseChange(code: string) {
    const course = courses.find(c => c.code === code);
    setForm(f => ({ ...f, course_code: code, teacher_id: course?.teacher_id ?? f.teacher_id }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.teacher_id || !form.course_code || !form.rating) {
      toast.error("Please select teacher, course and give a rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(API, { method: "POST", headers: h(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success("Feedback submitted. Thank you!");
      setForm({ teacher_id: "", course_code: "", rating: 0, comment: "", anonymous: true });
      fetch(`${API}/my`, { headers: h() }).then(r => r.json()).then(d => setMyFeedback(Array.isArray(d) ? d : []));
      setTab("history");
    } catch { toast.error("Failed to submit feedback."); }
    setSubmitting(false);
  }

  const ratingLabels = ["", "Poor", "Below Average", "Average", "Good", "Excellent"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Course Feedback</h1>
        <p className="mt-1 text-sm text-slate-400">Your feedback helps improve teaching quality.</p>
      </div>

      <div className="flex gap-1 border-b border-white/10">
        {[{ key: "submit", label: "Submit Feedback" }, { key: "history", label: `My Feedback (${myFeedback.length})` }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2.5 text-sm font-medium transition ${tab === t.key ? "border-b-2 border-amber-500 text-amber-300" : "text-slate-400 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "submit" && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">Course</label>
              <select value={form.course_code} onChange={e => handleCourseChange(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40">
                <option value="">— Select Course —</option>
                {courses.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">Teacher</label>
              <select value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40">
                <option value="">— Select Teacher —</option>
                {teachers.map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Rating {form.rating > 0 && <span className="text-amber-400 normal-case font-normal">— {ratingLabels[form.rating]}</span>}
            </label>
            <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">Comments (Optional)</label>
            <textarea rows={4} value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Share your thoughts about this course and teacher..."
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 placeholder:text-slate-600" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.anonymous} onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-500" />
            <span className="text-sm text-slate-400">Submit anonymously <span className="text-xs text-slate-600">(your name will not be shown)</span></span>
          </label>

          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-400 disabled:opacity-50">
            <Star className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {myFeedback.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">You have not submitted any feedback yet.</p>
          ) : myFeedback.map(f => (
            <div key={f.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{f.teacher_name}</p>
                  <p className="text-xs text-slate-400">{f.course_name}</p>
                </div>
                <div className="text-right">
                  <div className="flex gap-0.5 justify-end">
                    {[1,2,3,4,5].map(n => (
                      <span key={n} className={n <= f.rating ? "text-amber-400" : "text-slate-700"}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{new Date(f.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {f.comment && <p className="mt-3 text-sm text-slate-400 border-t border-white/5 pt-3">{f.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
