"use client"

import type {
  SeoProjectDto,
  SeoTaskDto,
  SeoTrafficEnvelopeDto,
  SeoTrafficMetricRowDto,
  SeoTrafficStatsDto,
} from '@liora/api-types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type React from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Eye,
  FileSearch,
  Globe2,
  Loader2,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { aiSeoApi } from '@/lib/endpoints/ai-seo.api'

import SeoProjectScanButton from './SeoProjectScanButton'

type DetailTab = 'overview' | 'seo' | 'issues' | 'traffic' | 'pages'

export function SeoProjectDetailPage({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const projectQuery = useQuery({
    queryKey: ['ai-seo', 'project-detail', projectId],
    queryFn: () => aiSeoApi.getProject(projectId),
  })
  const tasksQuery = useQuery({
    queryKey: ['ai-seo', 'project-detail-tasks', projectId],
    queryFn: () => aiSeoApi.listTasks(projectId),
  })
  const trafficQuery = useQuery({
    queryKey: ['ai-seo', 'project-detail-traffic', projectId, '7d'],
    queryFn: () => aiSeoApi.getProjectTraffic(projectId, '7d'),
    retry: 1,
  })
  const pagesQuery = useQuery({
    queryKey: ['ai-seo', 'project-detail-pages', projectId],
    queryFn: () => aiSeoApi.listLandingPages(projectId),
    enabled: activeTab === 'pages',
  })
  const referrersQuery = useQuery({
    queryKey: ['ai-seo', 'project-detail-metrics', projectId, 'referrer', '7d'],
    queryFn: () => aiSeoApi.getProjectTrafficMetrics(projectId, 'referrer', '7d'),
    enabled: activeTab === 'traffic',
    retry: 1,
  })
  const devicesQuery = useQuery({
    queryKey: ['ai-seo', 'project-detail-metrics', projectId, 'device', '7d'],
    queryFn: () => aiSeoApi.getProjectTrafficMetrics(projectId, 'device', '7d'),
    enabled: activeTab === 'traffic',
    retry: 1,
  })

  if (projectQuery.isLoading) return <DetailSkeleton />
  if (projectQuery.isError || !projectQuery.data) {
    return (
      <div className="mx-auto max-w-6xl p-6 text-center">
        <p className="text-sm font-semibold text-rose-600">Không thể tải project AI‑SEO.</p>
        <Link href="/ai-seo" className="mt-3 inline-block text-xs font-semibold text-lime-700">
          Quay lại dashboard
        </Link>
      </div>
    )
  }

  const project = projectQuery.data
  const tasks = (tasksQuery.data ?? []).filter((task) =>
    ['ON_PAGE', 'CONTENT', 'TECHNICAL'].includes(task.type)
  )
  const openIssues = tasks.filter((task) => task.status === 'pending')
  const traffic = trafficQuery.data

  return (
    <div className="min-h-screen bg-slate-50/60 pb-12 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
          <Link
            href="/ai-seo"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại dashboard
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-50 text-lime-700 dark:bg-lime-950/30 dark:text-lime-300">
                <Globe2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-slate-900 dark:text-white">
                  {project.name || project.hostname}
                </h1>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {project.hostname}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SeoProjectScanButton
                projectId={project.id}
                taskStatus={mapTaskStatus(project.taskStatus)}
              />
              <Link
                href={`/ai-seo/projects/${project.id}/installation`}
                aria-label="Mở cài đặt project"
                className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <nav className="mt-5 flex gap-1 overflow-x-auto" aria-label="Chi tiết project">
            {DETAIL_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {activeTab === 'overview' && (
          <OverviewTab project={project} tasks={openIssues} traffic={traffic} />
        )}
        {activeTab === 'seo' && <SeoTab project={project} tasks={openIssues} />}
        {activeTab === 'issues' && (
          <IssuesTab tasks={tasks} loading={tasksQuery.isLoading} />
        )}
        {activeTab === 'traffic' && (
          <TrafficTab
            traffic={traffic}
            loading={trafficQuery.isLoading}
            referrers={referrersQuery.data}
            devices={devicesQuery.data}
          />
        )}
        {activeTab === 'pages' && (
          <PagesTab pages={pagesQuery.data ?? []} loading={pagesQuery.isLoading} />
        )}
      </main>
    </div>
  )
}

const DETAIL_TABS: Array<{ id: DetailTab; label: string }> = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'seo', label: 'Phân tích SEO' },
  { id: 'issues', label: 'Vấn đề' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'pages', label: 'Landing Pages' },
]

function OverviewTab({
  project,
  tasks,
  traffic,
}: {
  project: SeoProjectDto
  tasks: SeoTaskDto[]
  traffic?: SeoTrafficEnvelopeDto<SeoTrafficStatsDto | null>
}) {
  const scores = scoreModel(project)
  const critical = tasks.filter((task) => taskSeverity(task) === 'error')
  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <SummaryCard label="Điểm SEO" value={scores.overall || '—'} icon={<FileSearch className="h-4 w-4" />} tone={scoreTone(scores.overall)} />
        <SummaryCard label="Nghiêm trọng" value={critical.length} icon={<AlertTriangle className="h-4 w-4" />} tone={critical.length ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'} />
        <SummaryCard label="Visitors" value={formatStat(traffic?.data?.visitors)} icon={<Users className="h-4 w-4" />} />
        <SummaryCard label="Pageviews" value={formatStat(traffic?.data?.pageviews)} icon={<Eye className="h-4 w-4" />} />
        <SummaryCard label="Visits" value={formatStat(traffic?.data?.visits)} icon={<Activity className="h-4 w-4" />} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Trụ cột SEO" subtitle="Điểm tổng hợp gần nhất, thang 0–100">
          <div className="space-y-4">
            <ScoreBar label="Kỹ thuật" score={scores.technical} />
            <ScoreBar label="Nội dung" score={scores.content} />
            <ScoreBar label="Uy tín" score={scores.authority} />
            <ScoreBar label="Tín hiệu UX" score={scores.ux} />
          </div>
        </Panel>
        <Panel title="Vấn đề ưu tiên" subtitle={`${critical.length} vấn đề nghiêm trọng chưa xử lý`}>
          <IssuePreview tasks={critical.slice(0, 5)} />
        </Panel>
      </div>
    </div>
  )
}

function SeoTab({ project, tasks }: { project: SeoProjectDto; tasks: SeoTaskDto[] }) {
  const scores = scoreModel(project)
  const groups = [
    { label: 'Technical & Meta', score: scores.technical, types: ['TECHNICAL', 'ON_PAGE'] },
    { label: 'Content', score: scores.content, types: ['CONTENT'] },
    { label: 'Authority', score: scores.authority, types: [] },
    { label: 'UX', score: scores.ux, types: [] },
  ]

  return (
    <div className="space-y-4">
      <Panel title="Điểm SEO tổng" subtitle="Chi tiết các trụ cột từ lần quét gần nhất">
        <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-center">
          <div className="text-center">
            <p className={`text-5xl font-black ${scoreTone(scores.overall)}`}>
              {scores.overall || '—'}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Trên 100
            </p>
          </div>
          <div className="space-y-3">
            {groups.map((group) => <ScoreBar key={group.label} label={group.label} score={group.score} />)}
          </div>
        </div>
      </Panel>

      {groups.map((group) => {
        const groupTasks = tasks.filter((task) => group.types.includes(task.type))
        return (
          <details
            key={group.label}
            open={groupTasks.some((task) => taskSeverity(task) === 'error')}
            className="group rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
              <span className="font-bold text-slate-900 dark:text-white">{group.label}</span>
              <span className={`text-sm font-black ${scoreTone(group.score)}`}>{group.score || '—'}/100</span>
            </summary>
            <div className="border-t border-slate-100 px-5 py-2 dark:border-slate-800">
              {groupTasks.length ? <IssueRows tasks={groupTasks} /> : (
                <p className="py-5 text-sm text-slate-500">Chưa có vấn đề trong nhóm này.</p>
              )}
            </div>
          </details>
        )
      })}
    </div>
  )
}

function IssuesTab({ tasks, loading }: { tasks: SeoTaskDto[]; loading: boolean }) {
  const queryClient = useQueryClient()
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [improvementError, setImprovementError] = useState<{
    taskId: string
    message: string
  } | null>(null)
  const improveMutation = useMutation({
    mutationFn: (taskId: string) => aiSeoApi.improveTask(taskId),
    onMutate: (taskId) => {
      setImprovementError(null)
      setExpandedTaskId(taskId)
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<SeoTaskDto[]>(
        ['ai-seo', 'project-detail-tasks', updatedTask.projectId],
        (current = []) => current.map((task) => (
          task.id === updatedTask.id ? updatedTask : task
        ))
      )
      setExpandedTaskId(updatedTask.id)
    },
    onError: (error, taskId) => {
      setImprovementError({
        taskId,
        message: error instanceof Error
          ? error.message
          : 'Không thể tạo phương án cải thiện bằng AI.',
      })
    },
  })

  if (loading) return <TabLoading />
  const sorted = [...tasks].sort(
    (a, b) => severityWeight(taskSeverity(b)) - severityWeight(taskSeverity(a))
  )
  return (
    <Panel
      title="Danh sách vấn đề"
      subtitle="Audit OpenSEO kết hợp AI for SEO để tạo phương án cải thiện theo từng vấn đề"
    >
      {sorted.length ? (
        <IssueRows
          tasks={sorted}
          showStatus
          aiImprovement={{
            expandedTaskId,
            improvingTaskId: improveMutation.isPending
              ? improveMutation.variables
              : null,
            error: improvementError,
            onImprove: (taskId) => improveMutation.mutate(taskId),
            onToggle: (taskId) => {
              setImprovementError(null)
              setExpandedTaskId((current) => current === taskId ? null : taskId)
            },
          }}
        />
      ) : (
        <p className="py-10 text-center text-sm text-slate-500">Chưa phát hiện vấn đề SEO.</p>
      )}
    </Panel>
  )
}

function TrafficTab({
  traffic,
  loading,
  referrers,
  devices,
}: {
  traffic?: SeoTrafficEnvelopeDto<SeoTrafficStatsDto | null>
  loading: boolean
  referrers?: SeoTrafficEnvelopeDto<SeoTrafficMetricRowDto[] | null>
  devices?: SeoTrafficEnvelopeDto<SeoTrafficMetricRowDto[] | null>
}) {
  if (loading) return <TabLoading />
  const stats = traffic?.data
  return (
    <div className="space-y-5">
      {traffic?.status !== 'ok' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
          {traffic?.status === 'degraded'
            ? 'Dữ liệu traffic tạm thời chưa đồng bộ. Đang hiển thị dữ liệu gần nhất nếu có.'
            : 'Project chưa có dữ liệu traffic Umami.'}
        </div>
      )}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Visitors" value={formatStat(stats?.visitors)} icon={<Users className="h-4 w-4" />} />
        <SummaryCard label="Pageviews" value={formatStat(stats?.pageviews)} icon={<Eye className="h-4 w-4" />} />
        <SummaryCard label="Visits" value={formatStat(stats?.visits)} icon={<Activity className="h-4 w-4" />} />
        <SummaryCard label="Bounces" value={formatStat(stats?.bounces)} icon={<BarChart3 className="h-4 w-4" />} />
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <MetricList title="Nguồn truy cập" envelope={referrers} />
        <MetricList title="Thiết bị" envelope={devices} />
      </div>
    </div>
  )
}

function PagesTab({ pages, loading }: { pages: Record<string, unknown>[]; loading: boolean }) {
  if (loading) return <TabLoading />
  return (
    <Panel title="Landing Pages" subtitle={`${pages.length} trang đang liên kết`}>
      {pages.length ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {pages.map((page) => (
            <div key={String(page.id)} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {String(page.name ?? page.pageUrl ?? 'Landing Page')}
                </p>
                <p className="truncate text-xs text-slate-500">{String(page.pageUrl ?? '')}</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-500">{String(page.scanStatus ?? 'pending')}</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {Number(page.graderScore ?? 0) || '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-slate-500">Chưa có Landing Page liên kết.</p>
      )}
    </Panel>
  )
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  tone = 'text-slate-900 dark:text-white',
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  tone?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </div>
      <p className={`mt-2 text-2xl font-black tabular-nums ${tone}`}>{value}</p>
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="grid grid-cols-[110px_1fr_42px] items-center gap-3">
      <span className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${scoreBarTone(score)}`}
          style={{ width: `${Math.max(0, Math.min(score, 100))}%` }}
        />
      </div>
      <span className={`text-right text-xs font-black ${scoreTone(score)}`}>{score || '—'}</span>
    </div>
  )
}

function IssuePreview({ tasks }: { tasks: SeoTaskDto[] }) {
  if (!tasks.length) {
    return <p className="py-8 text-center text-sm text-emerald-600">Không có vấn đề nghiêm trọng.</p>
  }
  return <IssueRows tasks={tasks} />
}

interface AiImprovementModel {
  source: string
  summary: string
  why: string
  suggested: {
    metaTitle: string | null
    metaDescription: string | null
    content: string | null
    technicalSteps: string[]
  }
  canAutoDeploy: boolean
  generatedAt?: string
}

interface IssueAiImprovementActions {
  expandedTaskId: string | null
  improvingTaskId: string | null
  error: { taskId: string; message: string } | null
  onImprove: (taskId: string) => void
  onToggle: (taskId: string) => void
}

function IssueRows({
  tasks,
  showStatus = false,
  aiImprovement,
}: {
  tasks: SeoTaskDto[]
  showStatus?: boolean
  aiImprovement?: IssueAiImprovementActions
}) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {tasks.map((task) => {
        const severity = taskSeverity(task)
        const improvement = taskAiImprovement(task)
        const isImproving = aiImprovement?.improvingTaskId === task.id
        const isExpanded = aiImprovement?.expandedTaskId === task.id
        const taskError = aiImprovement?.error?.taskId === task.id
          ? aiImprovement.error.message
          : null

        return (
          <div key={task.id} className="py-3">
            <div className="grid gap-2 sm:grid-cols-[110px_1fr_auto] sm:items-center">
              <SeverityBadge severity={severity} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                  {String(task.payload?.message ?? task.payload?.title ?? `${task.type} issue`)}
                </p>
                {task.payload?.suggested != null && (
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    Gợi ý: {String(task.payload.suggested)}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {showStatus && (
                  <span className="text-xs font-semibold text-slate-500">
                    {taskStatusLabel(task.status)}
                  </span>
                )}
                {aiImprovement && task.status !== 'deployed' && (
                  <button
                    type="button"
                    onClick={() => improvement
                      ? aiImprovement.onToggle(task.id)
                      : aiImprovement.onImprove(task.id)}
                    disabled={isImproving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isImproving
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Sparkles className="h-3.5 w-3.5" />}
                    {isImproving
                      ? 'AI đang cải thiện...'
                      : improvement
                        ? isExpanded ? 'Ẩn gợi ý AI' : 'Xem gợi ý AI'
                        : 'Cải thiện bằng AI'}
                  </button>
                )}
              </div>
            </div>

            {taskError && (
              <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                {taskError}
              </p>
            )}

            {improvement && isExpanded && (
              <AiImprovementPanel
                improvement={improvement}
                isRegenerating={isImproving}
                onRegenerate={() => aiImprovement?.onImprove(task.id)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function AiImprovementPanel({
  improvement,
  isRegenerating,
  onRegenerate,
}: {
  improvement: AiImprovementModel
  isRegenerating: boolean
  onRegenerate: () => void
}) {
  const suggestions = [
    improvement.suggested.metaTitle
      ? { label: 'Meta title', value: improvement.suggested.metaTitle }
      : null,
    improvement.suggested.metaDescription
      ? { label: 'Meta description', value: improvement.suggested.metaDescription }
      : null,
    improvement.suggested.content
      ? { label: 'Nội dung đề xuất', value: improvement.suggested.content }
      : null,
  ].filter((item): item is { label: string; value: string } => item != null)

  return (
    <div className="ml-0 mt-3 rounded-xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900/50 dark:bg-violet-950/20 sm:ml-[118px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">
          <Sparkles className="h-3.5 w-3.5" />
          AI for SEO · dữ liệu OpenSEO
        </span>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="text-[11px] font-semibold text-violet-700 underline-offset-2 hover:underline disabled:opacity-50 dark:text-violet-300"
        >
          Tạo lại bằng AI
        </button>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
        {improvement.summary}
      </p>
      {improvement.why && (
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {improvement.why}
        </p>
      )}
      {suggestions.length > 0 && (
        <div className="mt-3 grid gap-2">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.label}
              className="rounded-lg border border-violet-100 bg-white/80 px-3 py-2 dark:border-violet-900/40 dark:bg-slate-900/70"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {suggestion.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                {suggestion.value}
              </p>
            </div>
          ))}
        </div>
      )}
      {improvement.suggested.technicalSteps.length > 0 && (
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
          {improvement.suggested.technicalSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      <p className="mt-3 text-[10px] text-slate-400">
        {improvement.canAutoDeploy
          ? 'Có thể triển khai tự động sau khi bạn duyệt.'
          : 'Cần xem lại và triển khai thủ công.'}
      </p>
    </div>
  )
}

function taskAiImprovement(task: SeoTaskDto): AiImprovementModel | null {
  const value = task.result?.aiImprovement
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const suggestedValue = record.suggested
  const suggested = suggestedValue != null
    && typeof suggestedValue === 'object'
    && !Array.isArray(suggestedValue)
    ? suggestedValue as Record<string, unknown>
    : {}
  const summary = typeof record.summary === 'string' ? record.summary.trim() : ''
  if (!summary) return null

  return {
    source: typeof record.source === 'string' ? record.source : 'openseo-ai-for-seo',
    summary,
    why: typeof record.why === 'string' ? record.why : '',
    suggested: {
      metaTitle: typeof suggested.metaTitle === 'string' ? suggested.metaTitle : null,
      metaDescription: typeof suggested.metaDescription === 'string'
        ? suggested.metaDescription
        : null,
      content: typeof suggested.content === 'string' ? suggested.content : null,
      technicalSteps: Array.isArray(suggested.technicalSteps)
        ? suggested.technicalSteps.filter((step): step is string => typeof step === 'string')
        : [],
    },
    canAutoDeploy: record.canAutoDeploy === true,
    generatedAt: typeof record.generatedAt === 'string' ? record.generatedAt : undefined,
  }
}

function SeverityBadge({ severity }: { severity: 'error' | 'warning' | 'info' }) {
  const styles = severity === 'error'
    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
    : severity === 'warning'
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
  const label = severity === 'error' ? 'Nghiêm trọng' : severity === 'warning' ? 'Cảnh báo' : 'Gợi ý'
  return <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}>{label}</span>
}

function MetricList({
  title,
  envelope,
}: {
  title: string
  envelope?: SeoTrafficEnvelopeDto<SeoTrafficMetricRowDto[] | null>
}) {
  const rows = envelope?.data ?? []
  const max = Math.max(...rows.map((row) => Number(row.y) || 0), 1)
  return (
    <Panel title={title} subtitle="7 ngày gần nhất">
      {rows.length ? (
        <div className="space-y-3">
          {rows.slice(0, 8).map((row) => (
            <div key={row.x} className="grid grid-cols-[120px_1fr_48px] items-center gap-3">
              <span className="truncate text-xs text-slate-600 dark:text-slate-300">{row.x || 'Trực tiếp'}</span>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-lime-500" style={{ width: `${Math.max(4, (row.y / max) * 100)}%` }} />
              </div>
              <span className="text-right text-xs font-bold text-slate-700 dark:text-slate-200">{formatStat(row.y)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-500">Chưa có dữ liệu.</p>
      )}
    </Panel>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-5 p-6">
      <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-900" />)}
      </div>
      <div className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-900" />
    </div>
  )
}

function TabLoading() {
  return <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
}

function scoreModel(project: SeoProjectDto) {
  return {
    overall: Math.round(Number(project.aiGradeOverall) || 0),
    technical: Math.round(Number(project.holisticScores?.technicalsScore) || 0),
    content: Math.round(Number(project.holisticScores?.contentScore) || 0),
    authority: Math.round(Number(project.holisticScores?.authorityScore) || 0),
    ux: Math.round(Number(project.holisticScores?.uxScore) || 0),
  }
}

function taskSeverity(task: SeoTaskDto): 'error' | 'warning' | 'info' {
  const severity = String(task.payload?.severity ?? '').toLowerCase()
  if (severity === 'error' || severity === 'warning' || severity === 'info') return severity
  const priority = String(task.payload?.priority ?? task.payload?.importance ?? '').toLowerCase()
  if (priority === 'high') return 'error'
  if (priority === 'medium') return 'warning'
  return 'info'
}

function severityWeight(severity: 'error' | 'warning' | 'info') {
  return severity === 'error' ? 3 : severity === 'warning' ? 2 : 1
}

function taskStatusLabel(status: string) {
  if (status === 'deployed') return 'Đã triển khai'
  if (status === 'approved') return 'Đã duyệt'
  if (status === 'rejected') return 'Đã từ chối'
  return 'Chưa xử lý'
}

function scoreTone(score: number) {
  if (!score) return 'text-slate-400'
  if (score < 50) return 'text-rose-600 dark:text-rose-400'
  if (score < 80) return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

function scoreBarTone(score: number) {
  if (score < 50) return 'bg-rose-500'
  if (score < 80) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function formatStat(value: number | null | undefined) {
  if (value == null) return '—'
  return new Intl.NumberFormat('vi-VN', {
    notation: value >= 1_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}

function mapTaskStatus(status: string): 'pending' | 'started' | 'completed' | 'failed' {
  if (status === 'running') return 'started'
  if (status === 'done') return 'completed'
  if (status === 'failed') return 'failed'
  return 'pending'
}

export default SeoProjectDetailPage
