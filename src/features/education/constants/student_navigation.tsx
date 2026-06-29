import React from "react";
import {
  Calendar,      // Lịch học
  GraduationCap, // Kết quả học tập
  Bell,
  CreditCard,
  FileText,
  ClipboardList,
  ClipboardCheck,
  HelpCircle,
  UserCircle,
} from "lucide-react"; 

export const StudentNavGroups = [
  {
    groupName: "Thông báo",
    items: [
      {
        name: "Thông báo",
        path: "/education/dashboard/student/notifications",
        icon: <Bell className="w-[18px] h-[18px]" />,
      },
    ],
  },
  {
    groupName: "Học tập",
    items: [
      {
        name: "Thời khóa biểu",
        path: "/education/dashboard/student/my-schedule",
        icon: <Calendar className="w-[18px] h-[18px]" />,
      },
      {
        name: "Kết quả học tập",
        path: "/education/dashboard/student/academic-results",
        icon: <GraduationCap className="w-[18px] h-[18px]" />,
      },
      {
        name: "Đăng ký học phần",
        path: "/education/dashboard/student/registrations",
        icon: <ClipboardList className="w-[18px] h-[18px]" />,
      },
      {
        name: "Lịch thi",
        path: "/education/dashboard/student/exams",
        icon: <ClipboardCheck className="w-[18px] h-[18px]" />,
      },
      {
        name: "Học phí",
        path: "/education/dashboard/student/tuition",
        icon: <CreditCard className="w-[18px] h-[18px]" />,
      },
    ],
  },
  {
    groupName: "Học vụ",
    items: [
      {
        name: "Tài liệu học tập",
        path: "/education/dashboard/student/documents",
        icon: <FileText className="w-[18px] h-[18px]" />,
      },
      {
        name: "Yêu cầu hỗ trợ",
        path: "/education/dashboard/student/requests",
        icon: <HelpCircle className="w-[18px] h-[18px]" />,
      },
    ],
  },
  {
    groupName: "Cá nhân",
    items: [
      {
        name: "Thông tin cá nhân",
        path: "/education/dashboard/student/profile",
        icon: <UserCircle className="w-[18px] h-[18px]" />,
      },
    ],
  },
];
