export type BuilderMessage =
  | { type: "EM_BUILDER_READY"; pageId: string }
  | { type: "EM_BUILDER_INIT"; pageId: string; sessionToken: string; adminOrigin: string }
  | { type: "EM_BUILDER_DIRTY"; pageId: string; dirty: boolean }
  | { type: "EM_BUILDER_SAVED"; pageId: string; savedAt: string }
  | { type: "EM_BUILDER_PUBLISHED"; pageId: string; slug: string; publicUrl: string }
  | { type: "EM_BUILDER_CLOSE"; pageId: string };
