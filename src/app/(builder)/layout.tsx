import { LadiFeedbackProvider } from "@/components/feedback/LadiFeedbackProvider";

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-950">
      {children}
      <LadiFeedbackProvider />
    </div>
  );
}
