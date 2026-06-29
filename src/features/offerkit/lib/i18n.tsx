/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type { ReactNode } from "react";

export function T({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useGT() {
  return (value: string) => value;
}
