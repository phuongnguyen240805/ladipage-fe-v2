import { FUNNELX_EVENTS } from "./constants";
import { AnalyticsAdapter } from "./analytics-adapter";
import { GrowthBookLikeAdapter } from "./growthbook-adapter";

export interface FormFlowControllerOptions {
  formId: string;
  analytics: AnalyticsAdapter;
  growthbook?: GrowthBookLikeAdapter;
}

export class FormFlowController {
  private formId: string;
  private analytics: AnalyticsAdapter;
  private growthbook?: GrowthBookLikeAdapter;

  constructor(options: FormFlowControllerOptions) {
    this.formId = options.formId;
    this.analytics = options.analytics;
    this.growthbook = options.growthbook;
  }

  completeStep(step: number, data?: Record<string, unknown>) {
    this.growthbook?.setAttributes({
      [`form_${this.formId}_last_step`]: step,
      ...data,
    });
    this.analytics.capture(FUNNELX_EVENTS.formStepCompleted, {
      formId: this.formId,
      step,
      ...data,
    });
  }

  submit(data?: Record<string, unknown>) {
    this.growthbook?.setAttributes({
      [`form_${this.formId}_submitted`]: true,
      ...data,
    });
    this.analytics.capture(FUNNELX_EVENTS.formSubmitted, {
      formId: this.formId,
      ...data,
    });
    this.analytics.capture(FUNNELX_EVENTS.conversion, {
      source: "form",
      formId: this.formId,
    });
  }
}
