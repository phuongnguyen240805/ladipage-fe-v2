"use client";

import type {
  CustomerCareConversation,
  CustomerCareTag,
} from "@liora/api-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, LoaderCircle, Plus, Tag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { customerCareApi } from "@/lib/endpoints/customer-care.api";
import { customerCareQueryKey, useCustomerCareScopeKey } from "@/features/customer-care/session/customer-care-scope";

const TAG_COLORS: Record<string, string> = {
  "công việc": "#92501f",
  "bạn bè": "#8a7418",
  "trả lời sau": "#357058",
  "đồng nghiệp": "#245493",
  "kiểm hàng": "#354156",
  "câu hỏi": "#583475",
  "mua hàng": "#24549a",
  "đã gửi": "#08623d",
  "hết hàng": "#175775",
  "trả hàng": "#9b3432",
  "khách hàng": "#8d2735",
  "gia đình": "#87205f",
};

function getTagColor(tag: CustomerCareTag) {
  return TAG_COLORS[tag.name.toLocaleLowerCase("vi")] || tag.color || "#475569";
}

function hasTag(conversation: CustomerCareConversation, tag: CustomerCareTag) {
  return conversation.tags.some(
    (current) => String(current.id) === String(tag.id) || current.name === tag.name,
  );
}

export function ConversationTagBar({
  conversation,
}: {
  conversation: CustomerCareConversation;
}) {
  const queryClient = useQueryClient();
  const scopeKey = useCustomerCareScopeKey();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busyTagId, setBusyTagId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tagsQuery = useQuery({
    queryKey: customerCareQueryKey(scopeKey ?? "signed-out", "tags"),
    enabled: Boolean(scopeKey),
    queryFn: () => customerCareApi.tags(),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  const updateConversationCache = (nextTags: CustomerCareTag[]) => {
    queryClient.setQueriesData<CustomerCareConversation[]>(
      { queryKey: customerCareQueryKey(scopeKey ?? "signed-out", "conversations") },
      (current) =>
        current?.map((item) =>
          item.id === conversation.id
            ? {
                ...item,
                tags: nextTags,
                customer: {
                  ...item.customer,
                  tags: nextTags,
                },
              }
            : item,
        ),
    );
  };

  const toggleTag = async (tag: CustomerCareTag) => {
    if (busyTagId || !scopeKey) return;

    const selected = hasTag(conversation, tag);
    setBusyTagId(tag.id);
    setError(null);

    try {
      await customerCareApi.setTags(
        conversation.id,
        [tag.name],
        selected ? "remove" : "add",
      );

      const nextTags = selected
        ? conversation.tags.filter(
            (current) =>
              String(current.id) !== String(tag.id) && current.name !== tag.name,
          )
        : [...conversation.tags, tag];

      updateConversationCache(nextTags);
      await queryClient.invalidateQueries({
        queryKey: customerCareQueryKey(scopeKey, "conversations"),
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể cập nhật nhãn.");
    } finally {
      setBusyTagId(null);
    }
  };

  return (
    <div className="relative border-b border-slate-100 bg-slate-50/75 px-3 py-1 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <div className="flex h-8 items-center gap-2">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/80 dark:bg-white/[0.06] dark:text-slate-400 dark:ring-white/10"
          title="Nhãn khách hàng"
        >
          <Tag className="h-3.5 w-3.5" />
        </div>

        <div className="custom-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto overflow-y-hidden whitespace-nowrap py-0.5">
          {conversation.tags.length ? (
            conversation.tags.map((tag) => (
              <span
                key={`${tag.id}:${tag.name}`}
                className="inline-flex h-[21px] max-w-[132px] items-center truncate rounded-md px-2 text-[10px] font-semibold leading-none text-white shadow-sm"
                style={{ backgroundColor: getTagColor(tag) }}
                title={tag.name}
              >
                {tag.name}
              </span>
            ))
          ) : (
            <span className="row-span-2 flex h-full items-center text-[11px] text-slate-400">
              Chưa có nhãn khách hàng
            </span>
          )}
        </div>

        <div ref={menuRef} className="relative shrink-0 self-start pt-0.5">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-[24px] items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-lime-300 hover:bg-lime-50 hover:text-lime-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-lime-500/10 dark:hover:text-lime-300"
            aria-expanded={menuOpen}
            title="Thêm hoặc bỏ nhãn"
          >
            <Plus className="h-3 w-3" />
            <span>Nhãn</span>
          </button>

          {menuOpen ? (
            <div className="absolute bottom-[30px] right-0 z-50 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#181d25]">
              <div className="flex items-center border-b border-slate-100 px-3 py-2 dark:border-white/[0.07]">
                <div>
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    Nhãn khách hàng
                  </div>
                  <div className="text-[9px] text-slate-400">Chọn để thêm hoặc bỏ nhãn</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="Đóng danh sách nhãn"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="custom-scrollbar max-h-64 overflow-y-auto p-1.5">
                {tagsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />
                  </div>
                ) : null}

                {!tagsQuery.isLoading && !(tagsQuery.data ?? []).length ? (
                  <div className="px-3 py-5 text-center text-[11px] text-slate-400">
                    Chưa cấu hình nhãn
                  </div>
                ) : null}

                {(tagsQuery.data ?? []).map((tag) => {
                  const selected = hasTag(conversation, tag);
                  const busy = busyTagId === tag.id;

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      disabled={Boolean(busyTagId)}
                      onClick={() => void toggleTag(tag)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:text-slate-200 dark:hover:bg-white/[0.06]"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: getTagColor(tag) }}
                      />
                      <span className="min-w-0 flex-1 truncate">{tag.name}</span>
                      {busy ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin text-slate-400" />
                      ) : selected ? (
                        <Check className="h-3.5 w-3.5 text-lime-600" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {error ? (
                <div className="border-t border-red-100 bg-red-50 px-3 py-2 text-[10px] text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
