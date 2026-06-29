"use client";

import Checkbox from "@/features/education/components/form/input/Checkbox";
import Input from "@/features/education/components/form/input/InputField";
import Label from "@/features/education/components/form/Label";
import Button from "@/features/education/components/ui/button/Button";
import { ChevronRight, EyeOff as EyeCloseIcon, Eye as EyeIcon, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { authLogin } from "@/features/education/api/auth";
import CherryBlossoms from "../animations/CherryBlossoms";

const quickRoles = [
  { label: "Admin", role: "admin", path: "/e-learning/tong-quan" },
  { label: "Giảng viên", role: "lecturer", path: "/e-learning/lecturer" },
  { label: "Sinh viên", role: "student", path: "/e-learning/student/notifications" },
  { label: "Phụ huynh", role: "parents", path: "/e-learning/parents" },
  { label: "Tư vấn", role: "consultant", path: "/e-learning/consultant" },
  { label: "Cơ sở", role: "branch-management", path: "/e-learning/branch-management" },
];

function getLoginErrorMessage(err: any) {
  const status = err?.response?.status;
  const serverMessage = err?.response?.data?.message;

  if (status === 400 || status === 401) {
    return "Sai tài khoản hoặc mật khẩu.";
  }

  if (!err?.response) {
    return "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
  }

  return serverMessage || "Đăng nhập thất bại. Vui lòng thử lại.";
}

export default function SignInForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showQuickRoles, setShowQuickRoles] = useState(false);

  const handleQuickRole = (role: string, path: string) => {
    const demoToken = `demo-${role}`;

    localStorage.setItem("access_token", demoToken);
    localStorage.setItem(
      "user",
      JSON.stringify({
        role,
        fullName: `Demo ${role}`,
        username: `${role}@demo.local`,
        email: `${role}@demo.local`,
        id: null,
        avatarUrl: null,
        roles: [`ROLE_${role.toUpperCase()}`],
        permissions: ["demo"],
      }),
    );

    document.cookie = `user-token=${demoToken}; path=/; max-age=${60 * 60 * 24}`;
    document.cookie = `user-role=${role}; path=/; max-age=${60 * 60 * 24}`;

    router.push(path);
  };

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("remember_username") || "";
    const rememberedPassword = localStorage.getItem("remember_password") || "";

    setUsername(rememberedUsername);
    setPassword(rememberedPassword);
    setIsChecked(Boolean(rememberedUsername && rememberedPassword));
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      const data: any = await authLogin({
        username: username.trim(),
        password,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Đăng nhập thất bại");
      }

      const authData = data.data;

      if (authData?.accessToken) {
        // Save token
        localStorage.setItem("access_token", authData.accessToken);

        if (authData.refreshToken) {
          localStorage.setItem("refresh_token", authData.refreshToken);
        }

        // Remember login
        if (isChecked) {
          localStorage.setItem("remember_username", username);
          localStorage.setItem("remember_password", password);
        } else {
          localStorage.removeItem("remember_username");
          localStorage.removeItem("remember_password");
        }

        // Role
        const userRole = (authData.roles?.[0] || "student")
          .toLowerCase()
          .replace("role_", "");

        localStorage.setItem(
          "user",
          JSON.stringify({
            role: userRole,
            fullName: authData.fullName || authData.username || "Người dùng",
            username: authData.username,
            email: authData.username,
            id: authData.employeeId || null,
            avatarUrl: authData.avatarUrl || null,
            roles: authData.roles || [],
            permissions: authData.permissions || [],
          }),
        );

        // Cookie time
        const maxAge = isChecked ? 60 * 60 * 24 * 7 : 60 * 60 * 24;

        document.cookie = `user-token=${authData.accessToken}; path=/; max-age=${maxAge}`;
        document.cookie = `user-role=${userRole}; path=/; max-age=${maxAge}`;

        // Redirect
        const roleMap: Record<string, string> = {
          admin: "/education/dashboard/admin",
          "branch-management": "/education/dashboard/branch-management",
          teacher: "/education/dashboard/teacher",
          student: "/education/dashboard/student",
          consultant: "/education/dashboard/consultant",
          parents: "/education/dashboard/parents",
        };

        router.push(roleMap[userRole] || `/education/dashboard/${userRole}`);
      }
    } catch (err: any) {
      setError(getLoginErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf5f0] flex items-center justify-center p-4 lg:p-6 overflow-hidden relative">
      
      {/* Hiệu ứng hoa anh đào */}
      <CherryBlossoms />

      <div className="w-full max-w-[1450px] h-[92vh] bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden flex z-10">

        {/* Left Image */}
        <div className="hidden lg:block w-1/2 relative bg-[#f7faf8] overflow-hidden">
          <img
            src="/education/images/logo/nen-login.jpg"
            alt="Đại học Đông Á"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute top-10 left-10 z-20">
            <img
              src="/education/images/logo/logo-sidebar-admin-big.png"
              alt="Logo"
              className="w-[220px] object-contain drop-shadow-2xl"
            />
          </div>

          <div className="absolute bottom-20 left-10 z-20 text-white">
            <p className="text-[38px] leading-[42px] font-bold drop-shadow-2xl italic tracking-tight">
              Tạo dựng con đường
              <br />
              thành công
            </p>

            <p className="mt-5 text-[16px] font-medium opacity-95 drop-shadow-md">
              Hệ thống quản lý giáo dục (EMS)
            </p>

            <p className="text-[16px] font-semibold drop-shadow-md">
              Đại học Đông Á
            </p>
          </div>

          <div className="absolute -bottom-12 -right-10 z-20">
            <img
              src="/education/images/logo/logo-sidebar-admin-small.png"
              alt="Hoa"
              className="w-[280px] h-[280px] opacity-90 drop-shadow-2xl rotate-[-22deg] hover:rotate-[-8deg] transition-transform duration-700 ease-out"
            />
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full lg:w-1/2 h-full relative flex flex-col justify-center bg-white px-8 lg:px-20 py-6 overflow-hidden">

          {/* Language */}
          <div className="absolute top-6 right-8 z-20">
            <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 bg-white hover:bg-gray-50 transition">
              <img
                src="https://flagcdn.com/w20/vn.png"
                alt="VN"
                className="w-5 h-4 rounded-sm"
              />
              <span className="text-xs font-semibold text-gray-700">
                Tiếng Việt
              </span>
              <span className="text-gray-400 text-[10px]">▼</span>
            </button>
          </div>

          <div className="w-full max-w-[420px] mx-auto flex flex-col justify-center">

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img
                src="/education/images/logo/logo-sidebar-admin-Normal.png"
                alt="Logo"
                className="w-[160px] h-[160px] object-contain"
              />
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-tight">
                Đăng nhập hệ thống
              </h1>

              <p className="mt-1.5 text-[14px] text-gray-400">
                Đăng nhập để truy cập hệ thống EMS
              </p>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowQuickRoles((current) => !current)}
                className="group flex h-[66px] w-full items-center justify-between rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 px-4 shadow-[0_18px_38px_rgba(245,158,11,0.22)] transition hover:shadow-[0_20px_42px_rgba(245,158,11,0.3)] active:scale-[0.99]"
              >
                <span className="flex min-w-0 items-center gap-4">
                  <span className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-slate-950 px-4 text-[13px] font-black text-yellow-300">
                    <Zap className="h-4 w-4 fill-yellow-300" />
                    FREE
                  </span>
                  <span className="truncate text-left text-[16px] font-black italic text-slate-800">
                    Dùng thử nhanh các vai trò
                  </span>
                </span>
                <ChevronRight
                  className={`h-6 w-6 shrink-0 text-slate-800 transition-transform duration-200 ${
                    showQuickRoles ? "rotate-90" : "group-hover:translate-x-0.5"
                  }`}
                />
              </button>

              {showQuickRoles && (
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-amber-100 bg-amber-50/70 p-2 sm:grid-cols-3">
                  {quickRoles.map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleQuickRole(item.role, item.path)}
                      className="h-10 rounded-xl bg-white px-3 text-[13px] font-bold text-slate-700 shadow-sm transition hover:bg-yellow-100 hover:text-slate-950 active:scale-[0.98]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-4">

              {/* Username */}
              <div>
                <Label className="block mb-1.5 text-[13px] font-semibold text-gray-700">
                  Tên đăng nhập
                </Label>

                <Input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="h-[52px] rounded-xl border border-gray-200 bg-white px-4 text-[14px] shadow-none focus:border-[#009640] outline-none w-full"
                />
              </div>

              {/* Password */}
              <div>
                <Label className="block mb-1.5 text-[13px] font-semibold text-gray-700">
                  Mật khẩu
                </Label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-[52px] rounded-xl border border-gray-200 bg-white px-4 pr-12 text-[14px] shadow-none focus:border-[#009640] outline-none w-full"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeIcon size={18} />
                    ) : (
                      <EyeCloseIcon size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isChecked}
                    onChange={setIsChecked}
                  />

                  <span className="text-xs text-gray-500 font-medium select-none">
                    Ghi nhớ đăng nhập
                  </span>
                </div>
              </div>

              {/* Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] rounded-xl bg-[#009640] text-white text-[15px] font-semibold hover:bg-[#008137] transition-all duration-200 shadow-none mt-2"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            {/* Footer */}
            <p className="text-center text-[11px] text-gray-400 mt-8">
              © 2024 Đại học Đông Á. All rights reserved.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
