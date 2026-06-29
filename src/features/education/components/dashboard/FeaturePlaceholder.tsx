"use client";

import { ArrowLeft, Construction, Database, Route } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const featureTitles: Record<string, string> = {
  "/education/dashboard/admin/users": "Tài khoản người dùng",
  "/education/dashboard/admin/staffs": "Nhân viên",
  "/education/dashboard/admin/divisions": "Bộ phận chuyên môn",
  "/education/dashboard/admin/positions": "Chức vụ",
  "/education/dashboard/admin/school-years": "Năm học",
  "/education/dashboard/admin/semesters": "Học kỳ",
  "/education/dashboard/admin/classes": "Lớp hành chính",
  "/education/dashboard/admin/course-prerequisites": "Môn tiên quyết",
  "/education/dashboard/admin/registrations": "Đăng ký học phần",
  "/education/dashboard/admin/grades": "Điểm sinh viên",
  "/education/dashboard/admin/contracts": "Hợp đồng",
  "/education/dashboard/admin/degrees": "Bằng cấp",
  "/education/dashboard/student/tuition": "Học phí",
  "/education/dashboard/student/notifications": "Thông báo",
  "/education/dashboard/student/documents": "Tài liệu học tập",
  "/education/dashboard/lecturer/notifications": "Thông báo",
  "/education/dashboard/lecturer/support": "Hỗ trợ giảng dạy",
};

function titleFromPath(pathname: string) {
  const lastSegment = pathname.split("/").filter(Boolean).at(-1) ?? "chuc-nang";

  return decodeURIComponent(lastSegment)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type FeaturePlaceholderProps = {
  homeHref: string;
  roleLabel: string;
};

export function FeaturePlaceholder({ homeHref, roleLabel }: FeaturePlaceholderProps) {
  const pathname = usePathname();
  const title = featureTitles[pathname] ?? titleFromPath(pathname);

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-10">
      <section className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Construction className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h1>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Đang kết nối
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Mục này đã được đưa vào sidebar để đồng bộ với phạm vi chức năng của hệ thống. Phần backend, database hoặc luồng nghiệp vụ liên quan sẽ được nối UI ở bước tiếp theo.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Ưu tiên nối API
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Dữ liệu sẽ lấy theo module backend tương ứng.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <Route className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Route đã sẵn sàng
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Có thể thay bằng màn hình thật mà không đổi sidebar.
                </p>
              </div>
            </div>

            <Link
              href={homeHref}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại {roleLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
