type UpgradePlanOpener = () => void;

let upgradePlanOpener: UpgradePlanOpener | null = null;

/** Registered by UserDropdown on mount — opens the 4-step plan picker modal. */
export function registerUpgradePlanOpener(opener: UpgradePlanOpener | null) {
  upgradePlanOpener = opener;
}

const UPGRADE_PLAN_EVENT = "ladipage:open-upgrade-plan";

export function openUpgradePlanModal() {
  if (upgradePlanOpener) {
    upgradePlanOpener();
    return;
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(UPGRADE_PLAN_EVENT));
  }
}

export { UPGRADE_PLAN_EVENT };