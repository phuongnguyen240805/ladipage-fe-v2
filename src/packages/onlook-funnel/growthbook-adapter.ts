import { FUNNELX_EVENTS, FunnelFeatureFlag } from "./constants";
import { AnalyticsAdapter } from "./analytics-adapter";

export type FunnelVariant = string | number | boolean | Record<string, unknown> | null;

export interface FunnelFeatureMap {
  [feature: string]: FunnelVariant;
}

export interface GrowthBookLikeAdapter {
  setAttributes: (attributes: Record<string, unknown>) => void;
  getAttributes: () => Record<string, unknown>;
  isOn: (feature: FunnelFeatureFlag) => boolean;
  getFeatureValue: <T = FunnelVariant>(feature: FunnelFeatureFlag, fallback: T) => T;
}

export function createGrowthBookAdapter(params?: {
  features?: FunnelFeatureMap;
  attributes?: Record<string, unknown>;
  analytics?: AnalyticsAdapter;
}): GrowthBookLikeAdapter {
  let attributes = params?.attributes ?? {};
  const features = params?.features ?? {};

  const trackEvaluation = (feature: FunnelFeatureFlag, value: FunnelVariant) => {
    params?.analytics?.capture(FUNNELX_EVENTS.featureEvaluated, {
      feature,
      variant: value,
      attributes,
    });
  };

  return {
    setAttributes: (nextAttributes) => {
      attributes = { ...attributes, ...nextAttributes };
    },
    getAttributes: () => ({ ...attributes }),
    isOn: (feature) => {
      const value = Boolean(features[feature]);
      trackEvaluation(feature, value as FunnelVariant);
      return value;
    },
    getFeatureValue: (feature, fallback) => {
      const value = feature in features ? features[feature] : fallback;
      trackEvaluation(feature, value as FunnelVariant);
      return value as typeof fallback;
    },
  };
}
