import { Suspense } from "react";
import { ConversationWorkspace } from "@/components/customer-care/conversations/ConversationWorkspace";

export default function CustomerCareConversationsPage() {
  return (
    <Suspense fallback={<div className="h-full animate-pulse bg-slate-100 dark:bg-white/5" />}>
      <ConversationWorkspace />
    </Suspense>
  );
}
