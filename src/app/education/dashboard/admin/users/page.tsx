"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, RefreshCw, RotateCcw, Search, ShieldOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/features/education/components/ui/button";
import { Card, CardContent, CardHeader } from "@/features/education/components/ui/card";
import { Input } from "@/features/education/components/ui/input";
import { userAdminApi, type UserAccount } from "@/features/education/api/admin-resources";

export default function UsersPage() {
  const [rows, setRows] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setRows(await userAdminApi.getAll({ keyword: search || undefined }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    return rows.filter((row) =>
      [row.username, row.email, row.roles?.join(",")].some((value) => String(value || "").toLowerCase().includes(keyword)),
    );
  }, [rows, search]);

  const runAction = async (label: string, action: () => Promise<void>) => {
    try {
      await action();
      toast.success(label);
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Thao tác thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tài khoản người dùng</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quản trị trạng thái, khóa/mở khóa và phiên đăng nhập.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo username, email, vai trò..." className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900">
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const userId = row.userId || "";
                  const locked = Boolean(row.lockoutEndAt);
                  return (
                    <tr key={userId} className="border-b hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{row.username}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.email}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.roles?.join(", ") || "—"}</td>
                      <td className="px-4 py-3">{row.emailConfirmed ? "Đã xác nhận" : "Chưa xác nhận"}</td>
                      <td className="px-4 py-3">{row.isActive ? (locked ? "Đang khóa" : "Hoạt động") : "Đã xóa"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {locked ? (
                            <Button variant="ghost" size="sm" onClick={() => runAction("Đã mở khóa tài khoản", () => userAdminApi.unlock(userId))}>
                              <ShieldOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => runAction("Đã khóa tài khoản", () => userAdminApi.lock(userId, "Khóa bởi admin"))}>
                              <Lock className="h-4 w-4" />
                            </Button>
                          )}
                          {!row.isActive && (
                            <Button variant="ghost" size="sm" onClick={() => runAction("Đã khôi phục tài khoản", () => userAdminApi.restore(userId))}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => runAction("Đã thu hồi phiên đăng nhập", () => userAdminApi.revokeSessions(userId))}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => runAction("Đã xóa tài khoản", () => userAdminApi.delete(userId))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">Chưa có tài khoản phù hợp.</td>
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
