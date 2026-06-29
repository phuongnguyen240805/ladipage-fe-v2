/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import { useForm } from "@tanstack/react-form";
import { T, useGT } from "@/features/offerkit/lib/i18n";
import { Button } from "@/features/offerkit/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/offerkit/components/ui/card";
import { Input } from "@/features/offerkit/components/ui/input";
import { Label } from "@/features/offerkit/components/ui/label";
import { Textarea } from "@/features/offerkit/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/offerkit/components/ui/select";
import { RuleEditor } from "./rule-editor";

export type AppliesTo = "voucher" | "promotion" | "earn" | "reward";

export interface RuleFormState {
  name: string;
  description: string;
  appliesTo: AppliesTo;
  rule: Record<string, unknown>;
}

const APPLIES_TO: AppliesTo[] = ["voucher", "promotion", "earn", "reward"];

export function RuleForm({
  initial,
  submitLabel,
  onSubmit,
  pending,
}: {
  initial: RuleFormState;
  submitLabel: string;
  onSubmit: (state: RuleFormState) => void;
  pending: boolean;
}) {
  const gt = useGT();
  const form = useForm({
    defaultValues: initial,
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <T>Details</T>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={field.name}>
                  <T>Name</T>
                </Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  placeholder={gt("Order over $50")}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="appliesTo">
            {(field) => (
              <div className="space-y-2">
                <Label>
                  <T>Applies to</T>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v as AppliesTo)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLIES_TO.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={field.name}>
                  <T>Description</T>
                </Label>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={gt("Optional context")}
                  className="h-20"
                />
              </div>
            )}
          </form.Field>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <T>Rule</T>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form.Field name="rule">
            {(field) => <RuleEditor value={field.state.value} onChange={field.handleChange} />}
          </form.Field>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <form.Subscribe selector={(s) => [s.values.name, s.isSubmitting] as const}>
          {([name, isSubmitting]) => (
            <Button type="submit" disabled={pending || isSubmitting || !name.trim()}>
              {pending || isSubmitting ? <T>Saving…</T> : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
