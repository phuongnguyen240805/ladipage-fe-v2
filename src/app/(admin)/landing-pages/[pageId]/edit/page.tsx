import { EditorHostPage } from "@/features/landing-editor-host/EditorHostPage";
import { isInstaticEditorEnabled } from "@/features/landing-editor-host/editor-mode";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ pageId: string }>;
}

export default async function LandingPageEditRoute({ params }: PageProps) {
  const { pageId } = await params;

  if (!isInstaticEditorEnabled()) {
    // Legacy path: keep VisualEditor builder until flag flips.
    redirect(`/builder/${encodeURIComponent(pageId)}`);
  }

  return <EditorHostPage pageId={pageId} />;
}
