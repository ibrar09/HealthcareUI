import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@shared/design-system/components";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

export function DoctorSignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  function handleSignIn() {
    // Real implementation later: call modules/auth/api signIn(email, password),
    // get back { user, token } from IAM Service, then:
    signIn({ name: "Dr. Ayesha Raza", role: ROLES.DOCTOR, hospital: "City General Hospital" }, "mock-jwt-token");
    navigate(ROUTES.DOCTOR.DASHBOARD);
  }

  return (
    <AuthLayout
      brand="City General Hospital"
      tagline="Clinical Workspace — Cardiology Department"
      stats={["142 Staff Members", "24 Departments", "18,400 Patients Served"]}
    >
      <div className="w-full max-w-sm">
        <h2 className="font-display font-bold text-2xl text-on-surface mb-1">Clinician Sign In</h2>
        <p className="text-sm text-on-surface-variant mb-8">Enter your credentials to access patient records.</p>

        <label className="block text-xs font-display font-semibold text-on-surface-variant mb-1.5">Doctor ID or Email</label>
        <input
          className="w-full mb-4 rounded-input border border-line px-4 py-3 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
          defaultValue="ayesha.raza@citygeneral.org"
        />

        <label className="block text-xs font-display font-semibold text-on-surface-variant mb-1.5">Password</label>
        <input
          type="password"
          className="w-full mb-4 rounded-input border border-line px-4 py-3 text-sm outline-none focus:border-signal-indigo focus:ring-2 focus:ring-signal-indigo/15 transition-all"
          defaultValue="••••••••••"
        />

        <label className="flex items-center gap-2 mb-6 text-sm text-on-surface-variant">
          <input type="checkbox" defaultChecked className="accent-signal-indigo" />
          Remember this device
        </label>

        <Button fullWidth size="lg" onClick={handleSignIn}>
          Sign In
        </Button>

        <p className="text-center text-sm text-on-surface-variant/70 mt-4">Forgot password? Contact IT Support</p>

        <div className="border-t border-line mt-6 pt-4 text-center">
          <span className="font-mono text-[11px] text-on-surface-variant/60">
            HIPAA-compliant session · Auto-logout after 15 min
          </span>
        </div>
      </div>
    </AuthLayout>
  );
}
