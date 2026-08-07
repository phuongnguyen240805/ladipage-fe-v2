import { Suspense } from "react";
import { ZaloConversationGate } from "@/components/customer-care/conversations/ZaloConversationGate";

export default function CustomerCareConversationsPage() {
  return (
    <Suspense fallback={<div className="h-full animate-pulse bg-slate-100 dark:bg-white/5" />}>
      <ZaloConversationGate />
    </Suspense>
  );
}
