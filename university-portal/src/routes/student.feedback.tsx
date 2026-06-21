import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { teachers } from "@/data/data";
import { toast } from "sonner";

export const Route = createFileRoute("/student/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Student Portal" }] }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const [target, setTarget] = useState(teachers[0].id);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [anonymous, setAnonymous] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return toast.error("Please select a rating");
    if (!review.trim()) return toast.error("Please write a review");
    toast.success(`Feedback submitted ${anonymous ? "anonymously" : ""} · Thank you!`);
    setRating(0);
    setReview("");
  };

  const selected = teachers.find((t) => t.id === target)!;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Course Feedback</h1>
        <p className="mt-1 text-sm text-slate-400">Help improve teaching quality. Submissions can be anonymous.</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5 backdrop-blur-xl">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Teacher / Course</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id} className="bg-slate-900">
                {t.name} — {t.course}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-slate-500">Reviewing: <span className="text-amber-400">{selected.name}</span></p>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rating</label>
          <div className="mt-2 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="transition"
              >
                <Star
                  className={`h-9 w-9 ${
                    n <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-slate-600"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && <span className="ml-3 self-center text-sm text-slate-400">{rating}/5</span>}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Written Review</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={5}
            placeholder="What did you like? What could be improved?"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 placeholder:text-slate-600 resize-none"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-500"
          />
          Submit anonymously
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-bold text-slate-900 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}
