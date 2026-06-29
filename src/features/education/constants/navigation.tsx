"use client";

import React from "react";
import {
  Award,
  BookOpen,
  Building,
  Calendar,
  CalendarDays,
  CheckSquare,
  Clock,
  DoorOpen,
  FileText,
  GraduationCap,
  Landmark,
  Layers,
  LayoutDashboard,
  Network,
  ShieldCheck,
  Target,
  User,
  Users,
} from "lucide-react";

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
};

export type NavGroup = {
  groupName: string;
  icon: React.ReactNode;
  items: NavItem[];
};

const iconClassName = "h-[18px] w-[18px]";

export const adminNavItems: NavItem[] = [
  { name: "Tổng quan", icon: <LayoutDashboard className={iconClassName} />, path: "/education/dashboard/admin" },
  { name: "Sinh viên", icon: <Users className={iconClassName} />, path: "/education/dashboard/admin/students" },
  { name: "Giảng viên", icon: <User className={iconClassName} />, path: "/education/dashboard/admin/lecturers" },
  { name: "Khoa / đơn vị", icon: <Landmark className={iconClassName} />, path: "/education/dashboard/admin/departments" },
  { name: "Ngành học", icon: <GraduationCap className={iconClassName} />, path: "/education/dashboard/admin/majors" },
  { name: "Khóa đào tạo", icon: <Network className={iconClassName} />, path: "/education/dashboard/admin/academic-cohorts" },
  { name: "Chương trình đào tạo", icon: <Target className={iconClassName} />, path: "/education/dashboard/admin/training-programs" },
  { name: "Năm học", icon: <Calendar className={iconClassName} />, path: "/education/dashboard/admin/school-years" },
  { name: "Học kỳ", icon: <CalendarDays className={iconClassName} />, path: "/education/dashboard/admin/semesters" },
  { name: "Lớp hành chính", icon: <Users className={iconClassName} />, path: "/education/dashboard/admin/classes" },
  { name: "Môn học", icon: <BookOpen className={iconClassName} />, path: "/education/dashboard/admin/courses" },
  { name: "Lớp học phần", icon: <Layers className={iconClassName} />, path: "/education/dashboard/admin/course-classes" },
  { name: "Thời khóa biểu", icon: <CalendarDays className={iconClassName} />, path: "/education/dashboard/admin/schedules" },
  { name: "Duyệt điều chỉnh lịch", icon: <CheckSquare className={iconClassName} />, path: "/education/dashboard/admin/schedule-adjustments" },
  { name: "Tài khoản người dùng", icon: <User className={iconClassName} />, path: "/education/dashboard/admin/users" },
  { name: "Phân quyền (RBAC)", icon: <ShieldCheck className={iconClassName} />, path: "/education/dashboard/admin/rbac" },
];

export const adminNavGroups: NavGroup[] = [
  {
    groupName: "Tổng quan",
    icon: <LayoutDashboard className={iconClassName} />,
    items: [
      { name: "Bảng điều khiển", icon: <LayoutDashboard className={iconClassName} />, path: "/education/dashboard/admin" },
    ],
  },
  {
    groupName: "Hồ sơ nhân sự",
    icon: <Users className={iconClassName} />,
    items: [
      { name: "Sinh viên", icon: <Users className={iconClassName} />, path: "/education/dashboard/admin/students" },
      { name: "Giảng viên", icon: <User className={iconClassName} />, path: "/education/dashboard/admin/lecturers" },
      { name: "Phân lớp theo học kỳ", icon: <Layers className={iconClassName} />, path: "/education/dashboard/admin/student-class-assignments", badge: "NEW" },
    ],
  },
  {
    groupName: "Cơ cấu đào tạo",
    icon: <Landmark className={iconClassName} />,
    items: [
      { name: "Khoa / đơn vị", icon: <Landmark className={iconClassName} />, path: "/education/dashboard/admin/departments" },
      { name: "Bộ phận chuyên môn", icon: <Building className={iconClassName} />, path: "/education/dashboard/admin/divisions" },
      { name: "Chức vụ", icon: <Award className={iconClassName} />, path: "/education/dashboard/admin/positions" },
      { name: "Bằng cấp", icon: <Award className={iconClassName} />, path: "/education/dashboard/admin/degrees" },
      { name: "Ngành học", icon: <GraduationCap className={iconClassName} />, path: "/education/dashboard/admin/majors" },
      { name: "Khóa đào tạo", icon: <Network className={iconClassName} />, path: "/education/dashboard/admin/academic-cohorts" },
      { name: "Chương trình đào tạo", icon: <Target className={iconClassName} />, path: "/education/dashboard/admin/training-programs" },
      { name: "Chuyên ngành", icon: <Target className={iconClassName} />, path: "/education/dashboard/admin/specializations", badge: "NEW" },
    ],
  },
  {
    groupName: "Niên khóa & lớp",
    icon: <CalendarDays className={iconClassName} />,
    items: [
      { name: "Năm học", icon: <Calendar className={iconClassName} />, path: "/education/dashboard/admin/school-years" },
      { name: "Học kỳ", icon: <CalendarDays className={iconClassName} />, path: "/education/dashboard/admin/semesters" },
      { name: "Lớp hành chính", icon: <Users className={iconClassName} />, path: "/education/dashboard/admin/classes" },
    ],
  },
  {
    groupName: "Giảng dạy",
    icon: <BookOpen className={iconClassName} />,
    items: [
      { name: "Môn học", icon: <BookOpen className={iconClassName} />, path: "/education/dashboard/admin/courses" },
      // { name: "Môn tiên quyết", icon: <CheckSquare className={iconClassName} />, path: "/education/dashboard/admin/course-prerequisites" },
      { name: "Lớp học phần", icon: <Layers className={iconClassName} />, path: "/education/dashboard/admin/course-classes" },
      { name: "Lịch học", icon: <CalendarDays className={iconClassName} />, path: "/education/dashboard/admin/schedules" },
      { name: "Duyệt điều chỉnh lịch", icon: <CheckSquare className={iconClassName} />, path: "/education/dashboard/admin/schedule-adjustments", badge: "NEW" },
    ],
  },
  {
    groupName: "Cơ sở vật chất",
    icon: <Building className={iconClassName} />,
    items: [
      { name: "Tòa nhà", icon: <Building className={iconClassName} />, path: "/education/dashboard/admin/buildings" },
      { name: "Phòng học", icon: <DoorOpen className={iconClassName} />, path: "/education/dashboard/admin/rooms" },
      { name: "Ca học", icon: <Clock className={iconClassName} />, path: "/education/dashboard/admin/time-slots" },
    ],
  },
  {
    groupName: "Hệ thống",
    icon: <ShieldCheck className={iconClassName} />,
    items: [
      { name: "Tài khoản người dùng", icon: <User className={iconClassName} />, path: "/education/dashboard/admin/users" },
      { name: "Phân quyền (RBAC)", icon: <ShieldCheck className={iconClassName} />, path: "/education/dashboard/admin/rbac" },
      {
        name: "Reset mật khẩu",
        icon: <ShieldCheck className={iconClassName} />,
        path: "/education/dashboard/admin/password-reset-requests",
        badge: "BE",
      },
    ],
  },
];

export const lecturerNavItems: NavItem[] = [
  { name: "Lịch giảng dạy", icon: <Calendar className={iconClassName} />, path: "/education/dashboard/lecturer/my-schedule" },
  { name: "Lớp của tôi", icon: <Users className={iconClassName} />, path: "/education/dashboard/lecturer/my-classes" },
  { name: "Nhập điểm", icon: <FileText className={iconClassName} />, path: "/education/dashboard/lecturer/enter-grades" },
  { name: "Điểm danh", icon: <CheckSquare className={iconClassName} />, path: "/education/dashboard/lecturer/attendance" },
  { name: "Thông tin phòng", icon: <DoorOpen className={iconClassName} />, path: "/education/dashboard/lecturer/room-info" },
];

export const studentNavItems: NavItem[] = [
  { name: "Thời khóa biểu", icon: <Calendar className={iconClassName} />, path: "/education/dashboard/student/my-schedule" },
  { name: "Kết quả học tập", icon: <Award className={iconClassName} />, path: "/education/dashboard/student/academic-results" },
];

export const CenterItems: NavItem[] = adminNavItems;
export const LearingItems: NavItem[] = [];
export const navItems: NavItem[] = [];
export const othersItems: NavItem[] = [];
