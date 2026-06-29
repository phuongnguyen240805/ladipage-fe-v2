import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ pageId: string }>;
}

export default async function LegacyLandingEditorRoute({ params }: Props) {
  const { pageId } = await params;
  redirect(`/builder/${pageId}`);
}
