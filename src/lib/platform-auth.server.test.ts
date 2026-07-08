import { canEditLandingPage } from "./platform-auth.server";

describe("canEditLandingPage", () => {
  const supabaseUser = { id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", source: "supabase" as const };
  const nestUser = { id: "19", source: "nest" as const, nestUid: 19 };
  const linkedId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

  it("denies editing orphan pages (user_id null)", () => {
    expect(canEditLandingPage({ user_id: null }, nestUser)).toBe(false);
    expect(canEditLandingPage({ user_id: null }, supabaseUser)).toBe(false);
  });

  it("allows supabase session when user_id matches", () => {
    expect(canEditLandingPage({ user_id: linkedId }, supabaseUser)).toBe(true);
  });

  it("denies supabase session when user_id differs", () => {
    expect(
      canEditLandingPage({ user_id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12" }, supabaseUser),
    ).toBe(false);
  });

  it("denies nest session when page has owner but no linked supabase id", () => {
    expect(canEditLandingPage({ user_id: linkedId }, nestUser)).toBe(false);
  });

  it("allows nest session when linked supabase id matches page owner", () => {
    expect(canEditLandingPage({ user_id: linkedId }, nestUser, linkedId)).toBe(true);
  });
});