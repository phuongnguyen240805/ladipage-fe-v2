import { redirect } from "next/navigation";

type LegacyStatisticsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const legacyViewAliases: Record<string, string> = {
  staff: "user",
  tags: "tag",
  ratings: "feedback",
  backup: "export",
};

export default async function LegacyCustomerCareStatisticsPage({
  searchParams,
}: LegacyStatisticsPageProps) {
  const params = await searchParams;
  const nextParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    if (!normalizedValue) return;
    nextParams.set(key, key === "view" ? legacyViewAliases[normalizedValue] ?? normalizedValue : normalizedValue);
  });

  redirect(`/cskh/statistics${nextParams.size ? `?${nextParams.toString()}` : ""}`);
}
