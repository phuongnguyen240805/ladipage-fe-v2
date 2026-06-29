/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import Link from "next/link";
import { T } from "@/features/offerkit/lib/i18n";
import { getDashboardRole, requireDashboardSession } from "@/features/offerkit/lib/session";
import { dashboardSections } from "@/features/offerkit/components/dashboard/sections";
import { Badge } from "@/features/offerkit/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/features/offerkit/components/ui/card";

const kpis = [
  { label: "Facebook leads", value: "12.4k", delta: "+18%" },
  { label: "Course enrollments", value: "1,284", delta: "+11%" },
  { label: "Offer revenue", value: "$86.2k", delta: "+24%" },
  { label: "Learner activation", value: "72%", delta: "+9%" },
];

export default async function DashboardPage() {
  const role = getDashboardRole(await requireDashboardSession());
  const sections = dashboardSections
    .filter((section) => section.label !== "Overview")
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly || role === "admin"),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg border bg-card p-6 text-card-foreground">
          <Badge variant="secondary" className="mb-4 w-fit">
            Marketing + E-learning
          </Badge>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight">
            <T>Operate Facebook offers and online learning funnels from one workspace.</T>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            <T>
              Track audiences, campaigns, enrollments, rewards, and automation rules without a
              login gate.
            </T>
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="pb-1">
                <CardDescription>
                  <T>{kpi.label}</T>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-end justify-between gap-3">
                <span className="text-2xl font-semibold">{kpi.value}</span>
                <Badge variant="outline">{kpi.delta}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.label} className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            <T>{section.label}</T>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="block">
                  <Card className="h-full transition-colors hover:bg-muted/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="size-4 text-muted-foreground" />
                        <T>{item.label}</T>
                      </CardTitle>
                      <CardDescription>
                        <T>{item.description}</T>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
