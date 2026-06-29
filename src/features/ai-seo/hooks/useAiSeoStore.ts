import { create } from "zustand";
import { Agent, Conversation, Message, Run, ToolCall } from "../types";

interface AiSeoState {
  agents: Agent[];
  conversations: Conversation[];
  messages: Message[];
  activeAgentId: string | null;
  activeConversationId: string | null;
  activeRun: Run | null;
  toolCalls: ToolCall[];
  isStreaming: boolean;
  currentStreamText: string;
  isLoadingAgents: boolean;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;

  setAgents: (agents: Agent[]) => void;
  setConversations: (convos: Conversation[]) => void;
  setActiveAgentId: (id: string | null) => void;
  setActiveConversationId: (id: string | null) => void;

  fetchAgents: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (convoId: string) => Promise<void>;
  createConversation: (agentId: string, title?: string) => Promise<Conversation | null>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  sendMessage: (convoId: string, content: string, agentId: string) => Promise<void>;
}

export const useAiSeoStore = create<AiSeoState>((set, get) => ({
  agents: [],
  conversations: [],
  messages: [],
  activeAgentId: "chat-assistant",
  activeConversationId: null,
  activeRun: null,
  toolCalls: [],
  isStreaming: false,
  currentStreamText: "",
  isLoadingAgents: false,
  isLoadingConversations: false,
  isLoadingMessages: false,

  setAgents: (agents) => set({ agents }),
  setConversations: (convos) => set({ conversations: convos }),
  setActiveAgentId: (id) => set({ activeAgentId: id }),
  setActiveConversationId: (id) => {
    set({ activeConversationId: id });
    if (id) {
      get().fetchMessages(id);
    } else {
      set({ messages: [], activeRun: null, toolCalls: [] });
    }
  },

  fetchAgents: async () => {
    set({ isLoadingAgents: true });
    try {
      const res = await fetch("/api/ai-seo/agents");
      if (res.ok) {
        const data = await res.json();
        set({ agents: data });
      }
    } catch (err) {
      console.error("Fetch agents failed:", err);
    } finally {
      set({ isLoadingAgents: false });
    }
  },

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const res = await fetch("/api/ai-seo/conversations");
      if (res.ok) {
        const data = await res.json();
        set({ conversations: data });
      }
    } catch (err) {
      console.error("Fetch conversations failed:", err);
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  fetchMessages: async (convoId) => {
    set({ isLoadingMessages: true, messages: [], activeRun: null, toolCalls: [] });
    try {
      const res = await fetch(`/api/ai-seo/conversations/${convoId}/messages`);
      if (res.ok) {
        const data = await res.json();
        set({ messages: data });
      }
    } catch (err) {
      console.error("Fetch messages failed:", err);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  createConversation: async (agentId, title) => {
    try {
      const res = await fetch("/api/ai-seo/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, title }),
      });
      if (res.ok) {
        const newConvo = await res.json();
        set((state) => ({
          conversations: [newConvo, ...state.conversations],
          activeConversationId: newConvo.id,
          activeAgentId: newConvo.agent_id,
        }));
        get().fetchMessages(newConvo.id);
        return newConvo;
      }
    } catch (err) {
      console.error("Create conversation failed:", err);
    }
    return null;
  },

  deleteConversation: async (id) => {
    try {
      const res = await fetch(`/api/ai-seo/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        set((state) => {
          const nextConvos = state.conversations.filter((c) => c.id !== id);
          const nextActiveId =
            state.activeConversationId === id
              ? nextConvos[0]?.id || null
              : state.activeConversationId;

          return {
            conversations: nextConvos,
            activeConversationId: nextActiveId,
          };
        });

        const activeId = get().activeConversationId;
        if (activeId) {
          get().fetchMessages(activeId);
        } else {
          set({ messages: [], activeRun: null, toolCalls: [] });
        }
      }
    } catch (err) {
      console.error("Delete conversation failed:", err);
    }
  },

  renameConversation: async (id, title) => {
    try {
      const res = await fetch(`/api/ai-seo/conversations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const updated = await res.json();
        set((state) => ({
          conversations: state.conversations.map((c) => (c.id === id ? { ...c, title: updated.title } : c)),
        }));
      }
    } catch (err) {
      console.error("Rename conversation failed:", err);
    }
  },

  sendMessage: async (convoId, content, agentId) => {
    if (get().isStreaming) return;

    set({
      isStreaming: true,
      currentStreamText: "",
      activeRun: null,
      toolCalls: [],
    });

    try {
      // Local optimistic update for the user message
      const tempUserMsg: Message = {
        id: "temp-user-msg",
        conversationId: convoId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, tempUserMsg],
      }));

      // Call streaming API
      const res = await fetch(`/api/ai-seo/conversations/${convoId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, agentId }),
      });

      if (!res.body) {
        throw new Error("No response body for streaming");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine.startsWith("data: ")) {
            try {
              const { event, data } = JSON.parse(cleanLine.substring(6));

              if (event === "message") {
                // Replaces temporary user message with real database message
                set((state) => ({
                  messages: state.messages.map((m) =>
                    m.id === "temp-user-msg" ? data : m
                  ),
                }));
              } else if (event === "run_status") {
                set({ activeRun: data });
              } else if (event === "tool_start") {
                set((state) => ({
                  toolCalls: [...state.toolCalls, data],
                }));
              } else if (event === "tool_end") {
                set((state) => ({
                  toolCalls: state.toolCalls.map((tc) =>
                    tc.id === data.id ? data : tc
                  ),
                }));
              } else if (event === "text_chunk") {
                // Accumulate streaming text
                const nextText = get().currentStreamText + data;
                set({ currentStreamText: nextText });

                // Update assistant placeholder in message list
                set((state) => {
                  const lastMsg = state.messages[state.messages.length - 1];
                  if (lastMsg && lastMsg.role === "assistant" && lastMsg.id === "stream-placeholder") {
                    return {
                      messages: state.messages.map((m) =>
                        m.id === "stream-placeholder" ? { ...m, content: nextText } : m
                      ),
                    };
                  } else {
                    const assistantPlaceholder: Message = {
                      id: "stream-placeholder",
                      conversationId: convoId,
                      role: "assistant",
                      content: nextText,
                      created_at: new Date().toISOString(),
                    };
                    return {
                      messages: [...state.messages, assistantPlaceholder],
                    };
                  }
                });
              } else if (event === "final_message") {
                // Replace stream placeholder with the saved assistant message
                set((state) => ({
                  messages: state.messages.map((m) =>
                    m.id === "stream-placeholder" ? data : m
                  ),
                  currentStreamText: "",
                }));
                // Update conversation list timestamp
                set((state) => ({
                  conversations: state.conversations.map((c) =>
                    c.id === convoId ? { ...c, updated_at: new Date().toISOString() } : c
                  ),
                }));
              } else if (event === "error") {
                console.error("Streaming agent error:", data);
              }
            } catch (parseErr) {
              console.warn("Error parsing SSE line:", parseErr, cleanLine);
            }
          }
        }
      }
    } catch (err) {
      console.error("SendMessage failed:", err);
      // Clean up state
      set((state) => {
        const nextMsgs = state.messages.filter((m) => m.id !== "temp-user-msg" && m.id !== "stream-placeholder");
        return { messages: nextMsgs };
      });
    } finally {
      set({ isStreaming: false });
    }
  },
}));
