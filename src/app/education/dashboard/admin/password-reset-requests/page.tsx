"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/features/education/components/ui/button";
import { Card, CardContent } from "@/features/education/components/ui/card";
import { passwordResetAdminApi, type PasswordResetRequest } from "@/features/education/api/admin-resources";

export default function PasswordResetRequestsPage() {
  const [rows, setRows] = useState<PasswordResetRequest[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await passwordResetAdminApi.getAll(status));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải yêu cầu reset mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const approve = async (id: string) => {
    try {
      const result = await passwordResetAdminApi.approve(id, "Duyệt bởi admin");
      toast.success(`Đã reset mật khẩu. Mật khẩu mới: ${result?.defaultPassword || "theo ngày sinh"}`);
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể duyệt yêu cầu");
    }
  };

  const reject = async (id: string) => {
    try {
      await passwordResetAdminApi.reject(id, "Từ chối bởi admin");
      toast.success("Đã từ chối yêu cầu");
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể từ chối yêu cầu");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Yêu cầu reset mật khẩu</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Duyệt hoặc từ chối các yêu cầu khôi phục mật khẩu từ người dùng.</p>
        </div>
        <div className="flex gap-2">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="PENDING">Đang chờ</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Đã từ chối</option>
          </select>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900">
                  <th className="px-4 py-3">Người yêu cầu</th>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Điện thoại</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = row.passwordResetRequestId || "";
                  return (
                    <tr key={id} className="border-b hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-semibold">{row.fullName || row.username}</td>
                      <td className="px-4 py-3">{row.requesterCode}</td>
                      <td className="px-4 py-3">{row.emailEdu}</td>
                      <td className="px-4 py-3">{row.phoneNumber || "—"}</td>
                      <td className="px-4 py-3">{row.createdAt || "—"}</td>
                      <td className="px-4 py-3">
                        {row.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => approve(id)}>
                              <Check className="mr-1 h-4 w-4" />
                              Duyệt
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => reject(id)}>
                              <X className="mr-1 h-4 w-4" />
                              Từ chối
                            </Button>
                          </div>
                        ) : (
                          <span className="flex justify-end text-slate-500">{row.status}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">Không có yêu cầu nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
