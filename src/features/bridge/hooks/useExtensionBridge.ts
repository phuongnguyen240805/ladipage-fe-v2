import { extensionBridge } from "../services/extension-bridge.service";
import { BridgeOptions } from "../types";

export function useExtensionBridge() {
  const send = async <T = any>(channel: string, ...args: any[]): Promise<T> => {
    return extensionBridge.send<T>(channel, ...args);
  };

  const invoke = async <T = any>(
    channel: string,
    payload?: any,
    options?: BridgeOptions
  ): Promise<T> => {
    return extensionBridge.invoke<T>(channel, payload, options);
  };

  const invokeWithFallback = async <T = any>(
    channel: string,
    payload?: any,
    options?: BridgeOptions
  ): Promise<T> => {
    return extensionBridge.invokeWithFallback<T>(channel, payload, options);
  };

  return {
    send,
    invoke,
    invokeWithFallback,
    isDesktopMode: extensionBridge.isDesktopMode(),
  };
}
export default useExtensionBridge;
