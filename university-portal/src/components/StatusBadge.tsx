import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "amber";

const TONE_MAP: Record<string, Tone> = {
  Present: "success",
  Paid: "success",
  Active: "success",
  Late: "warning",
  Pending: "warning",
  Absent: "danger",
  Overdue: "danger",
  Cancelled: "danger",
};

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  danger: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  info: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  neutral: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
  className?: string;
}

export function StatusBadge({ label, tone, className }: StatusBadgeProps) {
  const resolved = tone ?? TONE_MAP[label] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[resolved],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

export default StatusBadge;
