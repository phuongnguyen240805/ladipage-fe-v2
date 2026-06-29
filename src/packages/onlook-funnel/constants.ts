export const FUNNELX_DISTINCT_ID_KEY = "funnelx.distinct_id";

export const FUNNELX_FLAGS = [
  "funnelx.welcome_popup",
  "funnelx.exit_intent_offer",
  "funnelx.sticky_bar",
  "funnelx.multi_step_form",
] as const;

export type FunnelFeatureFlag = (typeof FUNNELX_FLAGS)[number] | (string & {});

export const FUNNELX_EVENTS = {
  featureEvaluated: "funnelx.feature_evaluated",
  popupShown: "funnelx.popup_shown",
  popupDismissed: "funnelx.popup_dismissed",
  stickyBarShown: "funnelx.sticky_bar_shown",
  conditionalShown: "funnelx.conditional_shown",
  triggerFired: "funnelx.trigger_fired",
  formStepCompleted: "funnelx.form_step_completed",
  formSubmitted: "funnelx.form_submitted",
  conversion: "funnelx.conversion",
} as const;

export type FunnelEventName = (typeof FUNNELX_EVENTS)[keyof typeof FUNNELX_EVENTS];

export type FunnelTriggerType =
  | "time_on_page"
  | "scroll_progress"
  | "exit_intent"
  | "inactivity"
  | "click";

export interface FunnelTriggerConfig {
  type: FunnelTriggerType;
  enabled: boolean;
  threshold?: number;
  selector?: string;
}

export const DEFAULT_FUNNEL_TRIGGERS: FunnelTriggerConfig[] = [
  { type: "time_on_page", enabled: true, threshold: 5000 },
  { type: "scroll_progress", enabled: true, threshold: 50 },
  { type: "exit_intent", enabled: false },
  { type: "inactivity", enabled: false, threshold: 15000 },
  { type: "click", enabled: false, selector: "[data-funnel-track]" },
];
