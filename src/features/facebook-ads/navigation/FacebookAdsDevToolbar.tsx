"use client";

import { Bug, MonitorSmartphone } from "lucide-react";
import type { FacebookAdsScenarioId } from "../contracts/runtime";
import { FACEBOOK_ADS_SCENARIOS } from "../dev-fixtures/scenarios";

export default function FacebookAdsDevToolbar({
  scenario,
  onScenarioChange,
}: {
  scenario: FacebookAdsScenarioId;
  onScenarioChange: (scenario: FacebookAdsScenarioId) => void;
}) {
  const activeScenario =
    FACEBOOK_ADS_SCENARIOS.find((item) => item.id === scenario) ??
    FACEBOOK_ADS_SCENARIOS[0];

  return (
    <div className="adsmeta-dev-toolbar" data-testid="facebook-ads-dev-toolbar">
      <span><Bug aria-hidden="true" size={12} />DEV UI</span>
      <span className="adsmeta-dev-divider" />
      <label>
        <span>Kịch bản mock</span>
        <select
          aria-label="Kịch bản mock Facebook Ads"
          value={scenario}
          onChange={(event) => onScenarioChange(event.target.value as FacebookAdsScenarioId)}
        >
          {FACEBOOK_ADS_SCENARIOS.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </label>
      <p>{activeScenario.description}</p>
      <span className="ml-auto"><MonitorSmartphone aria-hidden="true" size={12} />Extension preview</span>
    </div>
  );
}

