import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { adminFeedback } from "@/data/data";

export const Route = createFileRoute("/admin/feedback")({ component: AdminFeedbackPage });

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
      ))}
    </div>
  );
}

function AdminFeedbackPage() {
  const grouped = adminFeedback.reduce<Record<string, typeof adminFeedback>>((acc, f) => {
    if (!acc[f.teacher]) acc[f.teacher] = [];
    acc[f.teacher].push(f);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Student Feedback</h1>
      <p className="mb-6 text-sm text-slate-400">All submitted feedback grouped by teacher. Anonymous feedback is shown without student details.</p>
      <div className="space-y-8">
        {Object.entries(grouped).map(([teacher, items]) => {
          const avg = (items.reduce((s, f) => s + f.rating, 0) / items.length).toFixed(1);
          return (
            <div key={teacher}>
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-slate-900">
                  {teacher.split(" ").slice(-1)[0][0]}
                </div>
                <div>
                  <p className="font-semibold text-white">{teacher}</p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={Math.round(+avg)} />
                    <span className="text-xs text-slate-400">{avg} avg · {items.length} review{items.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
              <div className="ml-12 space-y-3">
                {items.map((f) => (
                  <div key={f.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarRating rating={f.rating} />
                        <span className="text-xs text-amber-300 font-medium">{f.rating}/5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {f.anonymous && <span className="rounded-full border border-slate-500/30 bg-slate-500/10 px-2 py-0.5 text-[10px] text-slate-400">Anonymous</span>}
                        <span className="text-xs text-slate-500">{f.date}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{f.course}</p>
                    <p className="text-sm text-slate-300">{f.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
