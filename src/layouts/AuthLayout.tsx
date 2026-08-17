import { ReactNode } from "react";

interface AuthLayoutProps {
  brand: string;
  tagline: string;
  stats: string[];
  children: ReactNode; // the form side
}

/**
 * The split-screen sign-in shell every module's Sign In page uses —
 * extracted since DoctorSignIn and HospitalAdminSignIn were duplicating
 * this exact layout with only text differences.
 */
export function AuthLayout({ brand, tagline, stats, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div
        className="hidden md:flex w-[55%] flex-col justify-center px-16 relative overflow-hidden"
        style={{ backgroundColor: "var(--ink-navy)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: "radial-gradient(500px circle at 15% 15%, var(--signal-indigo-light), transparent 60%)" }}
        />
        <svg className="absolute left-0 right-0 top-1/2 -translate-y-1/2 opacity-90" height="60" width="100%" viewBox="0 0 800 60" preserveAspectRatio="none">
          <path
            d="M0 30 L280 30 L300 10 L320 50 L340 30 L800 30"
            fill="none"
            stroke="var(--signal-indigo-light)"
            strokeWidth="1.5"
            style={{ filter: "drop-shadow(0 0 6px var(--signal-indigo-light))" }}
          />
        </svg>
        <div className="relative z-10">
          <h1 className="font-display font-bold text-3xl text-white mb-1">{brand}</h1>
          <p className="font-body text-white/70 mb-10">{tagline}</p>
          <div className="flex gap-8 font-mono text-xs text-white/50">
            {stats.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-paper px-8">{children}</div>
    </div>
  );
}
