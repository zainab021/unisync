import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Mail, Lock, Eye, EyeOff, Sparkles, BookOpen, Trophy } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In — Northfield University Portal" },
      { name: "description", content: "Access your Northfield University student, teacher, or admin portal." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const { profile } = await signIn(email, password);
      toast.success(`Welcome back, ${profile?.name ?? "User"}!`);
      if (profile?.role === "teacher") navigate({ to: "/teacher/dashboard" });
      else if (profile?.role === "admin") navigate({ to: "/admin/dashboard" });
      else navigate({ to: "/student/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-slate-950 text-slate-200">
      {/* LEFT — Branding */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#0F172A] p-12">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.08),transparent_50%)]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-xl shadow-amber-500/30">
            <GraduationCap className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-lg font-bold text-white tracking-tight">Northfield</p>
            <p className="text-xs text-amber-400/80 uppercase tracking-[0.2em] font-semibold">University</p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
            <Sparkles className="inline h-3.5 w-3.5 mr-1.5" />
            University Management Portal
          </p>
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white">
            Where ambition <br />
            meets <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">excellence.</span>
          </h1>
          <p className="mt-6 text-slate-400 text-base leading-relaxed">
            Manage your courses, attendance, results, and campus life — all in one place.
            Built for students, faculty, and staff at Northfield University.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: BookOpen, label: "12K+", sub: "Students" },
              { icon: Trophy, label: "180+", sub: "Programs" },
              { icon: Sparkles, label: "1962", sub: "Established" },
            ].map((s) => (
              <div key={s.sub} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <s.icon className="h-4 w-4 text-amber-400 mb-2" />
                <p className="text-2xl font-bold text-white">{s.label}</p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">
          © 2026 Northfield University. All rights reserved.
        </p>
      </div>

      {/* RIGHT — Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900">
              <GraduationCap className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <p className="text-base font-bold text-white">Northfield University</p>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white">Sign in to your account</h2>
          <p className="mt-2 text-sm text-slate-400">Choose your role to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 focus-within:bg-white/[0.07] transition">
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
                  placeholder="you@university.edu"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Password</label>
                <button
                  type="button"
                  onClick={() => toast.info("Password reset link sent (demo)")}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-amber-500/50 focus-within:bg-white/[0.07] transition">
                <Lock className="h-4 w-4 text-slate-500" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-500" />
              Keep me signed in
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            Need help? Contact <span className="text-amber-400">it-support@university.edu</span>
          </p>
        </div>
      </div>
    </div>
  );
}
