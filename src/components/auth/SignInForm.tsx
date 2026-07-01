"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { useLoginCaptcha } from "@/features/auth/hooks/useLoginCaptcha";
import { platformAuthService } from "@/features/auth/services/platform-auth.service";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function SignInForm() {
  const searchParams = useSearchParams();
  const { captcha, loading: captchaLoading, error: captchaError, refresh: refreshCaptcha } =
    useLoginCaptcha();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!captcha?.id) {
      setError("Captcha chưa sẵn sàng. Vui lòng thử tải lại.");
      return;
    }
    if (!verifyCode.trim() || verifyCode.trim().length < 4) {
      setError("Mã xác minh phải có 4 ký tự.");
      return;
    }

    setLoading(true);

    try {
      await platformAuthService.signIn(email.trim(), password, {
        captchaId: captcha.id,
        verifyCode: verifyCode.trim(),
      });
      const redirect = searchParams.get("redirect") || "/";
      platformAuthService.completeLoginRedirect(redirect);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại";
      setError(message);
      setVerifyCode("");
      await refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Đăng nhập bằng email, mật khẩu và mã captcha
            </p>
          </div>
          <div>
            {error && (
              <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                    <Label>
                      Mã xác minh (Captcha){" "}
                      <span className="text-error-500">*</span>
                    </Label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void refreshCaptcha()}
                        disabled={captchaLoading}
                        className="flex h-11 min-w-[120px] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                        title="Nhấn để đổi captcha"
                      >
                        {captchaLoading ? (
                          <span className="text-xs text-gray-400">Đang tải...</span>
                        ) : captcha?.img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={captcha.img}
                            alt="Captcha"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">Không có ảnh</span>
                        )}
                      </button>
                      <Input
                        type="text"
                        placeholder="4 số"
                        value={verifyCode}
                        onChange={(e) =>
                          setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        required
                        className="flex-1"
                      />
                    </div>
                    {captchaError && (
                      <p className="mt-1.5 text-xs text-error-500">{captchaError}</p>
                    )}
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      Nhấn vào ảnh captcha để làm mới mã
                    </p>
                  </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                </div>
                <div>
                  <Button type="submit" className="w-full" size="sm" disabled={loading || captchaLoading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
