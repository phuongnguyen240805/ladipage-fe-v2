"use client";

import Script from "next/script";
import { useCallback, useRef } from "react";

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdentityApi {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    nonce?: string;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: "outline";
      size: "medium";
      shape: "rectangular";
      text: "continue_with";
      logo_alignment: "left";
      locale: "vi";
      width: string;
    },
  ) => void;
}

interface GoogleWindow extends Window {
  google?: {
    accounts?: {
      id?: GoogleIdentityApi;
    };
  };
}

async function generateNoncePair(): Promise<{
  rawNonce: string;
  hashedNonce: string;
}> {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const rawNonce = btoa(String.fromCharCode(...randomBytes));
  const encodedNonce = new TextEncoder().encode(rawNonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashedNonce = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return { rawNonce, hashedNonce };
}

interface GoogleSignInButtonProps {
  clientId: string;
  disabled?: boolean;
  onCredential: (credential: string, nonce: string) => void;
  onError: (message: string) => void;
}

export default function GoogleSignInButton({
  clientId,
  disabled = false,
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  const renderGoogleButton = useCallback(async () => {
    const googleIdentity = (window as GoogleWindow).google?.accounts?.id;
    const target = buttonRef.current;
    if (!target) return;
    if (!googleIdentity) {
      onErrorRef.current("Không thể khởi tạo Google Sign-In. Vui lòng thử lại.");
      return;
    }

    try {
      const { rawNonce, hashedNonce } = await generateNoncePair();
      target.replaceChildren();
      googleIdentity.initialize({
        client_id: clientId,
        auto_select: false,
        cancel_on_tap_outside: true,
        nonce: hashedNonce,
        callback: (response) => {
          if (!response.credential) {
            onErrorRef.current(
              "Google không trả về thông tin đăng nhập hợp lệ.",
            );
            return;
          }
          onCredentialRef.current(response.credential, rawNonce);
        },
      });

      const availableWidth = Math.max(
        200,
        Math.min(target.clientWidth || 400, 400),
      );
      googleIdentity.renderButton(target, {
        type: "standard",
        theme: "outline",
        size: "medium",
        shape: "rectangular",
        text: "continue_with",
        logo_alignment: "left",
        locale: "vi",
        width: String(availableWidth),
      });
    } catch {
      onErrorRef.current("Không thể chuẩn bị Google Sign-In. Vui lòng thử lại.");
    }
  }, [clientId]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => void renderGoogleButton()}
        onError={() =>
          onErrorRef.current("Không thể tải Google Sign-In. Vui lòng thử lại.")
        }
      />
      <div
        className={`relative h-8 w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-theme-xs transition-colors hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 ${
          disabled ? "pointer-events-none opacity-60" : ""
        }`}
        aria-busy={disabled}
      >
        <div ref={buttonRef} className="absolute -inset-px" />
      </div>
    </>
  );
}
