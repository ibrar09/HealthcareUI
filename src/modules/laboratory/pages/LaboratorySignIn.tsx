import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@shared/design-system/components";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

const MOCK_LAB_ACCOUNT = { email: "fatima.zahra@citygeneral.org", name: "Sr. MLS Fatima Zahra", hospital: "City General Hospital" };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LaboratorySignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState(MOCK_LAB_ACCOUNT.email);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = "Lab ID or email is required.";
    else if (!emailPattern.test(email.trim())) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    if (email.trim().toLowerCase() !== MOCK_LAB_ACCOUNT.email) {
      setSubmitting(false);
      setFormError("We couldn't verify those credentials. Check your Lab ID/email and password, or contact IT Support.");
      return;
    }
    signIn({ name: MOCK_LAB_ACCOUNT.name, role: ROLES.LAB_TECHNICIAN, hospital: MOCK_LAB_ACCOUNT.hospital }, "mock-jwt-token");
    navigate(ROUTES.LABORATORY.DASHBOARD);
  }

  return (
    <AuthLayout brand="City General Hospital" tagline="Laboratory Workspace — Main Laboratory" stats={["6 Sections", "6 Analyzers", "24/7 STAT Coverage"]}>
      <form className="w-full max-w-sm" onSubmit={handleSubmit} noValidate>
        <h2 className="font-display font-bold text-2xl text-on-surface mb-1">Laboratory Sign In</h2>
        <p className="text-sm text-on-surface-variant mb-8">Enter your credentials to access the laboratory workspace.</p>

        {formError && <div role="alert" className="mb-4 rounded-input border border-pulse-coral/30 bg-pulse-coral/10 px-4 py-3 text-sm text-pulse-coral">{formError}</div>}

        <label htmlFor="lab-email" className="block text-xs font-display font-semibold text-on-surface-variant mb-1.5">Lab ID or Email</label>
        <input
          id="lab-email" type="text" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          className={`w-full rounded-input border px-4 py-3 text-sm outline-none focus:ring-2 transition-all ${fieldErrors.email ? "border-pulse-coral focus:border-pulse-coral focus:ring-pulse-coral/15" : "border-line focus:border-signal-indigo focus:ring-signal-indigo/15"}`}
        />
        {fieldErrors.email && <p className="mt-1.5 text-xs text-pulse-coral">{fieldErrors.email}</p>}

        <label htmlFor="lab-password" className="block text-xs font-display font-semibold text-on-surface-variant mb-1.5 mt-4">Password</label>
        <div className="relative">
          <input
            id="lab-password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)} placeholder="Enter your password"
            className={`w-full rounded-input border px-4 py-3 pr-11 text-sm outline-none focus:ring-2 transition-all ${fieldErrors.password ? "border-pulse-coral focus:border-pulse-coral focus:ring-pulse-coral/15" : "border-line focus:border-signal-indigo focus:ring-signal-indigo/15"}`}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {fieldErrors.password && <p className="mt-1.5 text-xs text-pulse-coral">{fieldErrors.password}</p>}

        <Button type="submit" fullWidth size="lg" disabled={submitting} className="mt-6">
          {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Signing in…</span> : "Sign In"}
        </Button>

        <div className="border-t border-line mt-6 pt-4 text-center">
          <span className="font-mono text-[11px] text-on-surface-variant/60">HIPAA-compliant session · Auto-logout after 15 min</span>
        </div>
      </form>
    </AuthLayout>
  );
}
