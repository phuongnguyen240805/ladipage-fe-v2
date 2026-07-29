import type { SeoDashboardProjectDto } from '@liora/api-types'
import type React from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  Globe2,
  Star,
  Users,
} from 'lucide-react'
import Link from 'next/link'

import { useAiSeoProjectMutations } from '../hooks/useAiSeoProjectMutations'
import { useAiSeoOrgId } from '../hooks/useAiSeoOrgId'
import SeoProjectScanButton from './SeoProjectScanButton'

export function SeoProjectCompactCard({
  project,
}: {
  project: SeoDashboardProjectDto
}) {
  const orgId = useAiSeoOrgId()
  const { favoriteMutation } = useAiSeoProjectMutations(orgId)
  const scoreTone = getScoreTone(project.scores.overall)
  const isScanning = project.taskStatus === 'running'
  const needsInstall = project.pixelTagState !== 'installed'

  return (
    <article className="flex min-h-[238px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            <Globe2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {project.name || project.hostname}
            </h2>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {project.hostname}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={project.isFavorite ? 'Bỏ yêu thích dự án' : 'Yêu thích dự án'}
          disabled={favoriteMutation.isPending}
          onClick={() => favoriteMutation.mutate(project.id)}
          className={`rounded-lg p-2 transition ${
            project.isFavorite
              ? 'text-amber-500'
              : 'text-slate-300 hover:bg-slate-50 hover:text-amber-500 dark:text-slate-700 dark:hover:bg-slate-800'
          }`}
        >
          <Star className={`h-4 w-4 ${project.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </header>

      <div className="mt-3 flex items-center justify-between gap-3">
        <ProjectStatus
          scanning={isScanning}
          needsInstall={needsInstall}
          criticalIssues={project.issues.critical}
        />
        <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
          {project.lastAnalysis
            ? `Quét ${formatDate(project.lastAnalysis)}`
            : 'Chưa quét'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-100 bg-slate-100 sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-800">
        <Metric
          label="Điểm SEO"
          value={project.scores.overall > 0 ? String(project.scores.overall) : '—'}
          valueClassName={scoreTone}
        />
        <Metric
          label="Nghiêm trọng"
          value={String(project.issues.critical)}
          icon={<AlertTriangle className="h-3 w-3" />}
          valueClassName={project.issues.critical > 0 ? 'text-rose-600 dark:text-rose-400' : ''}
        />
        <Metric
          label="Visitors"
          value={formatStat(project.traffic.visitors)}
          icon={<Users className="h-3 w-3" />}
        />
        <Metric
          label="Pageviews"
          value={formatStat(project.traffic.pageviews)}
          icon={<Eye className="h-3 w-3" />}
        />
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between dark:border-slate-800">
        <p className="text-[11px] leading-relaxed text-slate-500 sm:max-w-[220px] dark:text-slate-400">
          {trafficCaption(project)}
        </p>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:shrink-0">
          {needsInstall ? (
            <Link
              href={`/ai-seo/projects/${project.id}/installation`}
              className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-950/20"
            >
              Hoàn tất cài đặt
            </Link>
          ) : (
            <SeoProjectScanButton
              projectId={project.id}
              taskStatus={
                isScanning
                  ? 'started'
                  : project.taskStatus === 'failed'
                    ? 'failed'
                    : project.taskStatus === 'done'
                      ? 'completed'
                      : 'pending'
              }
            />
          )}
          <Link
            href={`/ai-seo/projects/${project.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-lime-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-lime-600"
          >
            Chi tiết
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}

function Metric({
  label,
  value,
  icon,
  valueClassName = '',
}: {
  label: string
  value: string
  icon?: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="min-w-0 bg-slate-50/95 px-2.5 py-3 text-center dark:bg-slate-950/70">
      <div className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className={`mt-1 text-lg font-black tabular-nums text-slate-800 dark:text-white ${valueClassName}`}>
        {value}
      </p>
    </div>
  )
}

function ProjectStatus({
  scanning,
  needsInstall,
  criticalIssues,
}: {
  scanning: boolean
  needsInstall: boolean
  criticalIssues: number
}) {
  if (scanning) {
    return <StatusBadge className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">Đang quét</StatusBadge>
  }
  if (needsInstall) {
    return <StatusBadge className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">Chưa cài theo dõi</StatusBadge>
  }
  if (criticalIssues > 0) {
    return <StatusBadge className="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">Cần xử lý</StatusBadge>
  }
  return <StatusBadge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">Ổn định</StatusBadge>
}

function StatusBadge({
  children,
  className,
}: {
  children: React.ReactNode
  className: string
}) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  )
}

function getScoreTone(score: number) {
  if (score <= 0) return 'text-slate-400'
  if (score < 50) return 'text-rose-600 dark:text-rose-400'
  if (score < 80) return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

function formatStat(value: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('vi-VN', {
    notation: value >= 1_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return [
    String(date.getUTCDate()).padStart(2, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    date.getUTCFullYear(),
  ].join('/')
}

function trafficCaption(project: SeoDashboardProjectDto) {
  if (project.traffic.status === 'ok') {
    return project.traffic.syncedAt
      ? `Traffic 7 ngày · cập nhật ${formatDate(project.traffic.syncedAt)}`
      : 'Traffic 7 ngày gần nhất'
  }
  if (project.traffic.status === 'degraded') {
    return 'Dữ liệu traffic đang được cập nhật.'
  }
  return 'Chưa bật thống kê traffic cho project này.'
}

export default SeoProjectCompactCard
