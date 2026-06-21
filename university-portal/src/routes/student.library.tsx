import { createFileRoute } from "@tanstack/react-router";
import { Book } from "lucide-react";
import { library } from "@/data/data";
import StatusBadge from "@/components/StatusBadge";

export const Route = createFileRoute("/student/library")({
  head: () => ({ meta: [{ title: "Library — Student Portal" }] }),
  component: LibraryPage,
});

function daysLeft(due: string) {
  const d = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
  return d;
}

function LibraryPage() {
  const totalFine = library.borrowed.reduce((a, b) => a + b.fine, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Library</h1>
          <p className="mt-1 text-sm text-slate-400">{library.borrowed.length} books currently borrowed</p>
        </div>
        {totalFine > 0 && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2">
            <p className="text-xs uppercase tracking-wider text-rose-300/80">Outstanding Fine</p>
            <p className="text-lg font-bold text-rose-300 tabular-nums">PKR {totalFine}</p>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-slate-400 bg-white/[0.02]">
            <tr>
              <th className="px-6 py-3">Book</th>
              <th className="px-6 py-3">Author</th>
              <th className="px-6 py-3">Borrowed</th>
              <th className="px-6 py-3">Due</th>
              <th className="px-6 py-3">Fine</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {library.borrowed.map((b) => {
              const d = daysLeft(b.due);
              const overdue = d < 0;
              return (
                <tr key={b.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-md bg-amber-500/15 text-amber-400">
                        <Book className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-white">{b.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-400">{b.author}</td>
                  <td className="px-6 py-3 text-slate-400 tabular-nums">{b.borrowed}</td>
                  <td className="px-6 py-3 tabular-nums">
                    <span className={overdue ? "text-rose-400" : "text-slate-300"}>{b.due}</span>
                    <span className="ml-2 text-xs text-slate-500">({overdue ? `${Math.abs(d)}d late` : `${d}d left`})</span>
                  </td>
                  <td className="px-6 py-3">
                    {b.fine > 0 ? (
                      <span className="rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-300">
                        PKR {b.fine}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge label={overdue ? "Overdue" : "Active"} />
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

