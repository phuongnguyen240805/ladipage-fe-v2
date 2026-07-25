import { redirect } from "next/navigation";
import { isInstaticEditorEnabled } from "@/features/landing-editor-host/editor-mode";

interface Props {
  params: Promise<{ pageId: string }>;
}

export default async function LegacyLandingEditorRoute({ params }: Props) {
  const { pageId } = await params;
  if (isInstaticEditorEnabled()) {
    redirect(`/landing-pages/${encodeURIComponent(pageId)}/edit`);
  }
  redirect(`/builder/${encodeURIComponent(pageId)}`);
}
