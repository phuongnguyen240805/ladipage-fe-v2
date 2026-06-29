/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { T, useGT } from "@/features/offerkit/lib/i18n";
import { toast } from "sonner";
import {
  RewardTypeForm,
  type RewardTypeFormState,
} from "@/features/offerkit/components/dashboard/reward-type-form";
import { ovx } from "@/features/offerkit/lib/sdk";

export default function NewRewardTypePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const gt = useGT();

  const create = useMutation({
    mutationFn: (state: RewardTypeFormState) =>
      ovx().rewardTypes.create({
        key: state.key,
        name: state.name,
        description: state.description || undefined,
        payloadSchema: state.payloadSchema,
      }),
    onSuccess: async (rt) => {
      await queryClient.invalidateQueries({ queryKey: ["rewardTypes"] });
      toast.success(gt("Reward type created"));
      router.push(`/offerkit/rewards/${rt.id}`);
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : gt("Create failed"));
    },
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          <T>New reward type</T>
        </h1>
      </header>
      <RewardTypeForm
        mode="create"
        initial={{
          key: "",
          name: "",
          description: "",
          payloadSchema: { type: "object", properties: {}, required: [] },
        }}
        submitLabel={gt("Create reward type")}
        pending={create.isPending}
        onSubmit={(state) => create.mutate(state)}
      />
    </div>
  );
}
