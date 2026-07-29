/**
 * Khai báo type tối thiểu cho `jsdom` phục vụ script build (không có @types/jsdom
 * trong node_modules). Chỉ khai báo đúng bề mặt API mà build-bedimcode-editor-data.ts dùng.
 */
declare module "jsdom" {
  export class JSDOM {
    constructor(html?: string, options?: unknown);
    readonly window: Window & typeof globalThis;
  }
}
