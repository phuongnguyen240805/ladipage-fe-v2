import { LadiFeedbackProvider } from "@/components/feedback/LadiFeedbackProvider";
import { AuthProvider } from "@/features/auth/providers/AuthProvider";

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-950">
        {children}
        <LadiFeedbackProvider />
      </div>
    </AuthProvider>
  );
}
