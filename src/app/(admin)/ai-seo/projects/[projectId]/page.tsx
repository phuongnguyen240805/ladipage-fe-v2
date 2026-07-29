import SeoProjectDetailPage from '@/features/ai-seo/components/SeoProjectDetailPage'

export default async function AiSeoProjectDetailRoute({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  return <SeoProjectDetailPage projectId={projectId} />
}
