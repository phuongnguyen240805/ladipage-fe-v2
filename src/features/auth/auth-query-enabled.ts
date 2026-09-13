import type { AuthState } from "./types";

type AuthQueryGateState = Pick<
  AuthState,
  "authBootstrapped" | "platformStatus"
>;

/** Pure selector — server-owned session status gates authenticated queries. */
export function selectAuthQueryEnabled(state: AuthQueryGateState): boolean {
  return state.authBootstrapped && state.platformStatus === "authenticated";
}
