"use client";

import { useCallback } from "react";

import { openUpgradePlanModal } from "./upgrade-plan-bridge";

export function useUpgradePlan() {
  const openUpgradePlan = useCallback(() => {
    openUpgradePlanModal();
  }, []);

  return { openUpgradePlan };
}