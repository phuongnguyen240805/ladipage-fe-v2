export interface EditorSessionResponse {
  pageId: string;
  editPath: string;
  cmsPath: string;
  /** Phase-2 SSO URL — preferred for navigation */
  editorUrl?: string;
  sessionToken: string;
  expiresAt: string;
  engine: "instatic" | "legacy";
}
