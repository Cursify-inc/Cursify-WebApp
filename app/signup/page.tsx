import { AuthBrochure } from "@/components/auth/auth-brochure";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthShell mode="signup" after={<AuthBrochure />}>
      <SignupForm />
    </AuthShell>
  );
}