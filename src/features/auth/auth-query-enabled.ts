import type { AuthState } from "./types";

type AuthQueryGateState = Pick<
  AuthState,
  "authBootstrapped" | "platformStatus" | "platform"
>;

/** Pure selector — gates TanStack Query until persist + auth bootstrap complete. */
export function selectAuthQueryEnabled(state: AuthQueryGateState): boolean {
  return (
    state.authBootstrapped &&
    state.platformStatus === "authenticated" &&
    !!state.platform.nestToken
  );
}