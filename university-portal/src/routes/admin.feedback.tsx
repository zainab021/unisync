import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin/feedback")({ component: AdminFeedbackPage });

const API = "http://localhost:5000/api/feedback";
const getToken = () => localStorage.getItem("token") ?? "";
const h = () => ({ Authorization: `Bearer ${getToken()}` });

type Feedback = { id: number; student_name: string; teacher_name: string; course_name: string; rating: number; comment: string; anonymous: boolean; created_at: string };

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filter, setFilter]     = useState(0);

  useEffect(() => {
    fetch(API, { headers: h() }).then(r => r.json()).then(d => setFeedback(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const filtered = filter === 0 ? feedback : feedback.filter(f => f.rating === filter);
  const avg      = feedback.length ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : "—";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Course Feedback</h1>
          <p className="mt-1 text-xs text-slate-400">Anonymous student feedback on courses and teachers.</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-3 text-center">
          <p className="text-xs text-slate-400">Average Rating</p>
          <p className="text-3xl font-bold text-amber-400">{avg}</p>
          <p className="text-xs text-slate-500">{feedback.length} reviews</p>
        </div>
      </div>

      {/* Rating filter */}
      <div className="mb-4 flex gap-2">
        <button onClick={() => setFilter(0)} className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${filter === 0 ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-white/10 text-slate-400 hover:text-white"}`}>All</button>
        {[5,4,3,2,1].map(n => (
          <button key={n} onClick={() => setFilter(n)} className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${filter === n ? "border-amber-500/40 bg-amber-500/15 text-amber-300" : "border-white/10 text-slate-400 hover:text-white"}`}>
            {n}★
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No feedback submitted yet.</p>
        ) : filtered.map(f => (
          <div key={f.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{f.teacher_name}</p>
                <p className="text-xs text-slate-400">{f.course_name}</p>
              </div>
              <div className="text-right shrink-0">
                <Stars rating={f.rating} />
                <p className="mt-1 text-xs text-slate-500">{new Date(f.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            {f.comment && <p className="mt-3 text-sm text-slate-400 border-t border-white/5 pt-3">{f.comment}</p>}
            <p className="mt-2 text-xs text-slate-600">
              By: {f.anonymous ? "Anonymous Student" : f.student_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
