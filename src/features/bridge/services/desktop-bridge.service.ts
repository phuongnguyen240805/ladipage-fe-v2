export class DesktopBridgeService {
  /**
   * Check if running in Desktop Profile Mode
   */
  isDesktop(): boolean {
    if (typeof window === "undefined") return false;
    return !!(window as any).apiWeb;
  }

  /**
   * Call a local handler exposed via Electron window.apiWeb
   */
  async invokeLocal<T = any>(handler: string, payload?: any): Promise<T> {
    if (!this.isDesktop()) {
      throw new Error("Desktop Profile Mode is not active.");
    }
    
    const api = (window as any).apiWeb;
    if (!api?.invoke) {
      throw new Error("apiWeb.invoke handler is not defined.");
    }
    
    return api.invoke(handler, payload);
  }

  /**
   * Fetch active Desktop profile context (e.g. proxy, current account, local storage data)
   */
  async getProfileContext(): Promise<any> {
    return this.invokeLocal("desktop-profile:get-context");
  }

  /**
   * Dispatch trigger to auto login facebook inside desktop profile session
   */
  async triggerAutoLogin(uid: string): Promise<boolean> {
    return this.invokeLocal("desktop-profile:auto-login-facebook", { uid });
  }
}

export const desktopBridge = new DesktopBridgeService();
