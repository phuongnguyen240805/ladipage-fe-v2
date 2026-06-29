import { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingBuilderShell } from "@/features/landing-builder/components/LandingBuilderShell";
import { isValidPageId } from "@/components/landing-pages/editor/core/editor-supabase-storage";

interface Props {
  params: Promise<{ pageId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pageId } = await params;
  return {
    title: isValidPageId(pageId) ? `Builder | ${pageId}` : "Builder",
  };
}

export default async function BuilderPage({ params }: Props) {
  const { pageId } = await params;

  if (!isValidPageId(pageId)) {
    redirect("/landing-pages");
  }

  return <LandingBuilderShell pageId={pageId} />;
}
