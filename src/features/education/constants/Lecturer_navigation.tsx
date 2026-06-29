import React from "react";
import {
  BarChart3,
  Calendar,
  CheckSquare,
  DoorOpen,
  FileText,
  LayoutDashboard,
  UploadCloud,
  UserCircle,
  Users,
  Video,
} from "lucide-react";

export type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
};

export type NavGroup = {
  groupName: string;
  items: NavItem[];
};

const iconClassName = "h-[18px] w-[18px]";

export const LecturerNavGroups: NavGroup[] = [
  {
    groupName: "Tổng quan",
    items: [
      {
        name: "Bảng điều khiển",
        path: "/education/dashboard/lecturer",
        icon: <LayoutDashboard className={iconClassName} />,
      },
    ],
  },
  {
    groupName: "Giảng dạy",
    items: [
      {
        name: "Lịch giảng dạy",
        path: "/education/dashboard/lecturer/my-schedule",
        icon: <Calendar className={iconClassName} />,
      },
      {
        name: "Lớp của tôi",
        path: "/education/dashboard/lecturer/my-classes",
        icon: <Users className={iconClassName} />,
      },
      {
        name: "Xem bài giảng",
        path: "/education/dashboard/lecturer/lectures",
        icon: <Video className={iconClassName} />,
      },
      {
        name: "Quản lý bài giảng",
        path: "/education/dashboard/lecturer/lecture-editor",
        icon: <UploadCloud className={iconClassName} />,
      },
      {
        name: "Tiến độ học tập",
        path: "/education/dashboard/lecturer/learning-progress",
        icon: <BarChart3 className={iconClassName} />,
      },
      {
        name: "Nhập điểm",
        path: "/education/dashboard/lecturer/enter-grades",
        icon: <FileText className={iconClassName} />,
      },
      {
        name: "Điểm danh",
        path: "/education/dashboard/lecturer/attendance",
        icon: <CheckSquare className={iconClassName} />,
      },
      {
        name: "Thông tin phòng",
        path: "/education/dashboard/lecturer/room-info",
        icon: <DoorOpen className={iconClassName} />,
      },
    ],
  },
  {
    groupName: "Cá nhân",
    items: [
      {
        name: "Thông tin cá nhân",
        path: "/education/dashboard/lecturer/profile",
        icon: <UserCircle className={iconClassName} />,
      },
    ],
  },
];
