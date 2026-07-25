"use client";

import React from "react";

import { ChannelHealthBadge } from "@/features/commerce/components/ChannelHealthBadge";
import { CommerceMockRoleBar } from "@/features/commerce/components/CommerceMockRoleBar";
import { PermissionDeniedState } from "@/features/commerce/components/PermissionDeniedState";
import { useCommerceAccess } from "@/features/commerce/hooks/useCommerceAccess";
import { useCommerceStoreLink } from "@/features/commerce/hooks/useCommerceStoreLink";
import { formatCommerceDate } from "@/features/commerce/utils/format-money";

export function CommerceSettingsPanel() {
  const { canManageStore, canReadProduct } = useCommerceAccess();
  const { storeLink, organization } = useCommerceStoreLink();

  if (!canReadProduct && !canManageStore) {
    return (
      <div>
        <CommerceMockRoleBar />
        <PermissionDeniedState title="Không có quyền xem cài đặt cửa hàng" />
      </div>
    );
  }

  return (
    <div className="space-y-5 flex-1 max-w-3xl">
      <CommerceMockRoleBar />
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">
          Cài đặt cửa hàng online
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Liên kết LadiPage org ↔ Medusa organization / sales channel (mock)
        </p>
      </div>

      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Gian hàng (Sales Channel)
          </h2>
          <ChannelHealthBadge storeLink={storeLink} />
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">
              Channel ID
            </dt>
            <dd className="font-mono text-xs text-slate-700 dark:text-slate-200 break-all">
              {storeLink.salesChannelId}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">
              Tên channel
            </dt>
            <dd className="font-medium text-slate-800 dark:text-white">
              {storeLink.salesChannelName}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">
              LadiPage org
            </dt>
            <dd className="font-mono text-xs">{storeLink.ladipageOrganizationId}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">
              Region / currency
            </dt>
            <dd className="font-medium">
              {storeLink.regionId} · {storeLink.currencyCode.toUpperCase()}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">
              Provisioned
            </dt>
            <dd className="text-xs text-slate-600 dark:text-slate-300">
              {storeLink.provisionedAt
                ? formatCommerceDate(storeLink.provisionedAt)
                : "—"}
            </dd>
          </div>
        </dl>
        {storeLink.healthMessage && (
          <p className="text-xs text-slate-500 font-medium">
            {storeLink.healthMessage}
          </p>
        )}
      </section>

      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white">
          Medusa Organization (tham chiếu)
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">ID</dt>
            <dd className="font-mono text-xs break-all">{organization.id}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">
              Name
            </dt>
            <dd className="font-medium">{organization.name}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">
              Legal name
            </dt>
            <dd className="font-medium">{organization.legalName}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">
              Billing email
            </dt>
            <dd className="font-medium">{organization.billingEmail}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">
              VAT
            </dt>
            <dd className="font-medium">{organization.vatNumber}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">
              Status
            </dt>
            <dd className="font-medium text-[#65a30d]">{organization.status}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">
              Account holder
            </dt>
            <dd className="font-medium">{organization.accountHolder}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-slate-400">
              Subscription
            </dt>
            <dd className="font-medium">
              {organization.subscription.plan} ({organization.subscription.planId})
              · {organization.subscription.status}
            </dd>
          </div>
        </dl>
        <div>
          <h3 className="text-[10px] font-bold uppercase text-slate-400 mb-2">
            Members ({organization.members.length})
          </h3>
          <ul className="space-y-1.5">
            {organization.members.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap justify-between gap-2 text-xs border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {m.name}
                </span>
                <span className="text-slate-500">{m.email}</span>
                <span className="font-mono text-slate-400 w-full sm:w-auto">
                  {m.id}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-950/20 p-4">
        <h2 className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-1">
          Cổng thanh toán (GA H3)
        </h2>
        <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90 font-medium leading-relaxed">
          Mock UI: sau khi nối Medusa thật, cấu hình payment provider trên
          channel. Checkout khách = redirect H3, không dùng Nest /billing SaaS.
        </p>
        <ul className="mt-2 text-[11px] text-amber-800/80 dark:text-amber-200/80 space-y-1 list-disc list-inside">
          <li>Stripe / PayOS plugin trên Medusa (plane commerce)</li>
          <li>Test mode trước khi publish sales landing</li>
        </ul>
      </section>
    </div>
  );
}
