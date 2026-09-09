"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { platformAuthService } from "@/features/auth/services/platform-auth.service";
import { toAuthUserMessage } from "@/features/auth/utils/auth-error-messages";

export default function SignUpForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleCredential = async (credential: string, nonce: string) => {
    if (isLoading || googleLoading) return;
    setError(null);
    setGoogleLoading(true);

    try {
      const result = await platformAuthService.signUpWithGoogleIdToken(
        credential,
        nonce,
      );
      alert(
        result.message ||
          "Đăng ký Google thành công! Hãy đăng nhập bằng Google.",
      );
      router.push("/signin");
    } catch (err: unknown) {
      console.error("Google signup unexpected error:", err);
      setError(toAuthUserMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ tất cả thông tin.");
      return;
    }

    if (!isChecked) {
      setError("Bạn cần đồng ý với các Điều khoản & Chính sách bảo mật.");
      return;
    }

    setIsLoading(true);

    try {
      const username = `${firstName.trim()} ${lastName.trim()}`;
      const result = await platformAuthService.signUp(
        email.trim(),
        password,
        username,
      );

      alert(result.message || "Đăng ký thành công! Hãy đăng nhập bằng tài khoản vừa tạo.");
      router.push("/signin");
    } catch (err: unknown) {
      console.error("Signup unexpected error:", err);
      setError(toAuthUserMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-[400px] sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Quay lại trang chủ
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-[400px] mx-auto">
        <div>
          <div className="mb-6">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng ký tài khoản
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Đăng ký bằng Google hoặc email và mật khẩu của bạn.
            </p>
          </div>
          <div>
            {/* Error Message Box */}
            {error && (
              <div className="mb-5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
                {error}
              </div>
            )}

            <div className="mb-5">
              {googleClientId ? (
                <GoogleSignInButton
                  clientId={googleClientId}
                  disabled={isLoading || googleLoading}
                  onCredential={(credential, nonce) =>
                    void handleGoogleCredential(credential, nonce)
                  }
                  onError={setError}
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-gray-300 bg-gray-50 shadow-theme-xs px-4 text-xs font-medium text-gray-400 opacity-70 dark:border-gray-700 dark:bg-gray-900 dark:text-white/50"
                >
                  Google chưa được cấu hình
                </button>
              )}

              <div className="relative mt-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-xs font-medium uppercase tracking-wide text-gray-400 dark:bg-gray-900 dark:text-gray-500">
                    Hoặc
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Tên <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      placeholder="Nhập tên"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  {/* <!-- Last Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Họ <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lname"
                      name="lname"
                      placeholder="Nhập họ"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Mật khẩu <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Tạo mật khẩu"
                      type={showPassword ? "text" : "password"}
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
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400 text-xs">
                    Tạo tài khoản đồng nghĩa bạn đã đồng ý với {""}
                    <span className="text-gray-800 dark:text-white/90 font-bold">
                      Điều khoản & Điều kiện
                    </span>{" "}
                    của chúng tôi.
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div>
                  <Button className="w-full" size="sm" type="submit" disabled={isLoading || googleLoading}>
                    {isLoading && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-6">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Đã có tài khoản? {""}
                <Link
                  href="/signin"
                  className="text-lime-600 hover:text-brand-600 dark:text-lime-500"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
