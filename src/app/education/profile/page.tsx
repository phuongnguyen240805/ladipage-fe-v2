"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/education/context/AuthContext";
import { 
  User as UserIcon, Mail, Shield, AlertCircle, Phone, 
  MapPin, Building, GraduationCap, Briefcase, Calendar, 
  CreditCard, Edit3, Settings, ShieldCheck, Camera, CheckCircle2
} from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center text-sm text-gray-500 dark:text-gray-400">
        Đang tải thông tin hồ sơ...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chưa đăng nhập</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Vui lòng đăng nhập lại để xem hồ sơ cá nhân.
        </p>
      </div>
    );
  }

  const displayUser = user;

  // MOCK DATA Động dựa theo Role
  const isStudent = displayUser.role === "student";
  const isLecturer = displayUser.role === "lecturer";
  const isAdmin = displayUser.role === "admin";

  const profileDetails = {
    phone: isStudent ? "+84 333 444 555" : "+84 987 654 321",
    address: isStudent ? "Ký túc xá ĐH Đông Á, Đà Nẵng" : "Số 33, Đường Xô Viết Nghệ Tĩnh, Hải Châu, Đà Nẵng",
    dob: isStudent ? "15/08/2004" : "15/08/1990",
    gender: isStudent ? "Nữ" : "Nam",
    citizenId: isStudent ? "048304123456" : "048090123456",
    department: isStudent ? "Khoa Công nghệ thông tin" : "Khoa Công nghệ thông tin",
    specialization: isStudent ? "Kỹ thuật phần mềm" : "Công nghệ phần mềm",
    joinedDate: isStudent ? "Khóa 2022 - 2026" : "01/09/2020",
    status: "Đang hoạt động",
    code: isStudent ? "SV001" : isAdmin ? "AD001" : "GV001",
    classOrPosition: isStudent ? "D22CNTT01" : isAdmin ? "Quản trị viên Hệ thống" : "Giảng viên"
  };

  const getInitials = (name?: string): string => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getRoleAvatar = (role?: string): string => {
    const avatars: Record<string, string> = {
      admin: "/education/images/user/user-01.jpg",
      super_admin: "/education/images/user/user-01.jpg",
      lecturer: "/education/images/user/user-04.jpg",
      teacher: "/education/images/user/user-04.jpg",
      student: "/education/images/user/user-02.jpg",
      consultant: "/education/images/user/user-06.jpg",
      parents: "/education/images/user/user-08.jpg",
      "branch-management": "/education/images/user/user-10.jpg",
    };

    return avatars[role || ""] || "/education/images/user/user-03.jpg";
  };

  const getRoleLabel = (role?: string): string => {
    const labels: Record<string, string> = {
      admin: "Quản trị viên (Admin)",
      lecturer: "Giảng viên",
      student: "Sinh viên"
    };
    return labels[role || ""] || role || "Người dùng";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-gray-200/50 dark:border-gray-800/50">
        <div className="h-48 md:h-64 bg-gradient-to-r from-brand-600 via-brand-500 to-sky-500 w-full relative">
          <div className="absolute inset-0 bg-[url('/education/images/pattern.svg')] opacity-20"></div>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-6 md:px-10 pb-6 relative pt-16 md:pt-20 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* AVATAR KHỐI */}
          <div className="absolute -top-16 md:-top-20 left-1/2 md:left-10 transform -translate-x-1/2 md:translate-x-0">
            <div className="relative group">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center overflow-hidden">
                {displayUser.avatarUrl || displayUser.role ? (
                  <img
                    src={displayUser.avatarUrl || getRoleAvatar(displayUser.role)}
                    alt={displayUser.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl md:text-5xl font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 w-full h-full flex items-center justify-center">
                    {getInitials(displayUser.fullName)}
                  </span>
                )}
              </div>
              <button className="absolute bottom-2 right-2 p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg transition-transform hover:scale-110">
                <Camera size={18} />
              </button>
            </div>
          </div>

          <div className="mt-2 md:mt-0 md:pl-48 text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {displayUser.fullName}
              </h1>
              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 w-fit mx-auto md:mx-0">
                <ShieldCheck size={14} /> {getRoleLabel(displayUser.role)}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
              @{displayUser.username} • {isStudent ? "Sinh viên từ" : "Tham gia từ"} {profileDetails.joinedDate}
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-all">
              <Edit3 size={18} /> Cập nhật hồ sơ
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI - THÔNG TIN LIÊN HỆ */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-800/50 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
               Thông tin liên hệ
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email liên lạc</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">{displayUser.email}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Số điện thoại</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">{profileDetails.phone}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Địa chỉ</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{profileDetails.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 shadow-lg shadow-brand-500/20 text-white relative overflow-hidden">
             <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
               <ShieldCheck size={120} />
             </div>
             <h3 className="text-brand-100 font-bold mb-1 opacity-90">Trạng thái tài khoản</h3>
             <div className="flex items-center gap-2 mt-2">
               <CheckCircle2 size={24} className="text-emerald-300" />
               <span className="text-xl font-black">{profileDetails.status}</span>
             </div>
             <p className="text-sm text-brand-100 mt-4 opacity-80">
               Tài khoản của bạn đã được xác thực an toàn bởi hệ thống EMS.
             </p>
          </div>
        </div>

        {/* CỘT PHẢI - THÔNG TIN CHI TIẾT */}
        <div className="lg:col-span-2">
          <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-sm overflow-hidden min-h-full flex flex-col">
            
            {/* TABS */}
            <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-800/50 hide-scrollbar">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === "overview" 
                    ? "border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 bg-brand-50/50 dark:bg-brand-900/10" 
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:hover:text-gray-200 dark:hover:bg-gray-800/50"
                }`}
              >
                <UserIcon size={16} /> Thông tin cá nhân
              </button>
              <button 
                onClick={() => setActiveTab("academic")}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === "academic" 
                    ? "border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 bg-brand-50/50 dark:bg-brand-900/10" 
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:hover:text-gray-200 dark:hover:bg-gray-800/50"
                }`}
              >
                <GraduationCap size={16} /> {isStudent ? "Quản lý Đào tạo" : "Học vấn & Công tác"}
              </button>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === "settings" 
                    ? "border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 bg-brand-50/50 dark:bg-brand-900/10" 
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:hover:text-gray-200 dark:hover:bg-gray-800/50"
                }`}
              >
                <Settings size={16} /> Cài đặt & Bảo mật
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 md:p-8 flex-1">
              
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <UserIcon size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">{isStudent ? "Mã Sinh viên" : isAdmin ? "Mã Quản trị" : "Mã Giảng viên"}</span>
                      </div>
                      <p className="text-base font-bold text-brand-600 dark:text-brand-400">{profileDetails.code}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <CreditCard size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">CMND / CCCD</span>
                      </div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{profileDetails.citizenId}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Ngày sinh</span>
                      </div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{profileDetails.dob}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <UserIcon size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Giới tính</span>
                      </div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{profileDetails.gender}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ACADEMIC TAB */}
              {activeTab === "academic" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <Building size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">{isStudent ? "Khoa / Viện quản lý" : "Đơn vị công tác"}</span>
                      </div>
                      <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{profileDetails.department}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <Briefcase size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">{isStudent ? "Lớp danh nghĩa" : "Chức vụ"}</span>
                      </div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{profileDetails.classOrPosition}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <GraduationCap size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">{isStudent ? "Ngành học" : "Chuyên ngành giảng dạy"}</span>
                      </div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{profileDetails.specialization}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">{isStudent ? "Niên khóa" : "Ngày gia nhập"}</span>
                      </div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{profileDetails.joinedDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Mật khẩu bảo mật</h4>
                      <p className="text-sm text-gray-500 mt-1">Cập nhật mật khẩu để bảo vệ tài khoản</p>
                    </div>
                    <button className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                      Đổi mật khẩu
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Xác thực 2 bước (2FA)</h4>
                      <p className="text-sm text-gray-500 mt-1">Tăng cường lớp bảo mật thứ hai</p>
                    </div>
                    <button className="px-4 py-2 text-brand-600 bg-brand-50 dark:bg-brand-900/20 font-semibold text-sm rounded-xl hover:bg-brand-100 transition-colors">
                      Thiết lập ngay
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
