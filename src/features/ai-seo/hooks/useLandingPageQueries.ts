import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConnectedLandingPages,
  linkLandingPage,
  unlinkLandingPage,
  scanLandingPage,
  fetchLandingPageScores,
  fetchLandingPageTasks,
  fetchWebsiteProjects,
  fetchWebsitePages,
  publishWebsitePage,
  connectWebsitePageToAiSeo
} from "../api/landing-pages.api";

export function useConnectedLandingPagesQuery(orgId: string, projectId: string) {
  return useQuery({
    queryKey: ["landing-pages", { orgId, projectId }],
    queryFn: () => fetchConnectedLandingPages(orgId, projectId),
    refetchInterval: 10000, // refresh every 10s to capture updates on scan status
  });
}

export function useLinkLandingPageMutation(orgId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageUrl, websitePageId, source }: { pageUrl: string; websitePageId?: string | null; source: 'internal' | 'external' }) =>
      linkLandingPage(orgId, projectId, pageUrl, websitePageId, source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-pages", { orgId, projectId }] });
    }
  });
}

export function useUnlinkLandingPageMutation(orgId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) => unlinkLandingPage(orgId, projectId, pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-pages", { orgId, projectId }] });
    }
  });
}

export function useScanLandingPageMutation(orgId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) => scanLandingPage(orgId, projectId, pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-pages", { orgId, projectId }] });
    }
  });
}

export function useLandingPageScoresQuery(orgId: string, projectId: string, pageId: string) {
  return useQuery({
    queryKey: ["landing-page-scores", { orgId, projectId, pageId }],
    queryFn: () => fetchLandingPageScores(orgId, projectId, pageId),
    enabled: !!pageId,
  });
}

export function useLandingPageTasksQuery(orgId: string, projectId: string, pageId: string) {
  return useQuery({
    queryKey: ["landing-page-tasks", { orgId, projectId, pageId }],
    queryFn: () => fetchLandingPageTasks(orgId, projectId, pageId),
    enabled: !!pageId,
  });
}

export function useWebsiteProjectsQuery(orgId: string) {
  return useQuery({
    queryKey: ["website-projects", { orgId }],
    queryFn: () => fetchWebsiteProjects(orgId)
  });
}

export function useWebsitePagesQuery(orgId: string, websiteProjectId: string) {
  return useQuery({
    queryKey: ["website-pages", { orgId, websiteProjectId }],
    queryFn: () => fetchWebsitePages(orgId, websiteProjectId),
    enabled: !!websiteProjectId
  });
}

export function usePublishWebsitePageMutation(orgId: string, websiteProjectId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId }: { pageId: string }) => publishWebsitePage(orgId, websiteProjectId, pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website-pages", { orgId, websiteProjectId }] });
      queryClient.invalidateQueries({ queryKey: ["landing-pages", { orgId, projectId }] });
    }
  });
}

export function useConnectWebsitePageToAiSeoMutation(orgId: string, websiteProjectId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, aiSeoProjectId }: { pageId: string; aiSeoProjectId: string }) =>
      connectWebsitePageToAiSeo(orgId, websiteProjectId, pageId, aiSeoProjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website-pages", { orgId, websiteProjectId }] });
      queryClient.invalidateQueries({ queryKey: ["landing-pages", { orgId, projectId }] });
    }
  });
}
