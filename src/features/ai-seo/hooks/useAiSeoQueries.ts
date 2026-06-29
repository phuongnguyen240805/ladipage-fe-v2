import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Agent, Conversation } from "../types";

export function useAgentsQuery() {
  return useQuery<Agent[]>({
    queryKey: ["ai-seo", "agents"],
    queryFn: async () => {
      const res = await fetch("/api/ai-seo/agents");
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}

export function useConversationsQuery() {
  return useQuery<Conversation[]>({
    queryKey: ["ai-seo", "conversations"],
    queryFn: async () => {
      const res = await fetch("/api/ai-seo/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
    refetchOnWindowFocus: true,
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ai-seo/conversations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete conversation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-seo", "conversations"] });
    },
  });
}

export function useRenameConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const res = await fetch(`/api/ai-seo/conversations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to rename conversation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-seo", "conversations"] });
    },
  });
}
