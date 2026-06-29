'use client';

import { studentPortalApi } from '@/features/education/api/student-portal';
import { Badge } from '@/features/education/components/ui/badge';
import { Button } from '@/features/education/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/education/components/ui/card';
import { FeaturePlaceholder } from '@/features/education/components/dashboard/FeaturePlaceholder';
import type { StudentAnnouncement, StudentDocument, StudentExam, StudentRegistration, StudentSupportRequest, StudentTuition } from '@/features/education/types/student-portal';
import { Bell, BookOpen, CalendarDays, ClipboardCheck, ClipboardList, CreditCard, FileText, HelpCircle, Inbox, Send } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function StudentFeaturePage() {
  const pathname = usePathname();

  if (pathname.endsWith('/notifications')) return <NotificationsPage />;
  if (pathname.endsWith('/documents')) return <DocumentsPage />;
  if (pathname.endsWith('/tuition')) return <TuitionPage />;
  if (pathname.endsWith('/registrations')) return <RegistrationsPage />;
  if (pathname.endsWith('/exams')) return <ExamsPage />;
  if (pathname.endsWith('/requests')) return <RequestsPage />;

  return <FeaturePlaceholder homeHref="/education/dashboard/student/notifications" roleLabel="Sinh viên" />;
}

function NotificationsPage() {
  const [items, setItems] = useState<StudentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    studentPortalApi
      .getAnnouncements()
      .then((payload) => {
        if (active) setItems(payload.data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <StudentSection
      title="Thông báo học vụ"
      description="Các thông báo lấy từ hệ thống dành cho sinh viên."
      icon={Bell}
    >
      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Đang tải thông báo...</CardContent>
        </Card>
      ) : items.length ? (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} size="sm">
              <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{item.type}</Badge>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-950 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.sender}</p>
                </div>
                <Button variant="outline" size="sm">Đã xem</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có thông báo" description="Hiện hệ thống chưa trả về thông báo nào cho tài khoản sinh viên này." />
      )}
    </StudentSection>
  );
}

function DocumentsPage() {
  const [items, setItems] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    studentPortalApi.getDocuments().then((payload) => {
      if (active) setItems(payload.data);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <StudentSection
      title="Tài liệu học tập"
      description="Tài liệu học tập lấy từ API theo tài khoản sinh viên."
      icon={BookOpen}
    >
      {loading ? (
        <LoadingCard label="Đang tải tài liệu..." />
      ) : items.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <Badge variant="secondary">{item.courseCode}</Badge>
                  <p className="mt-2 min-h-12 font-semibold text-slate-950 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.fileType} · Cập nhật {item.updatedAt}</p>
                </div>
                <Button nativeButton={false} variant="outline" disabled={!item.downloadUrl} render={item.downloadUrl ? <a href={item.downloadUrl} /> : undefined} className="w-full">
                  Tải tài liệu
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="Chưa có tài liệu" description="API chưa trả về tài liệu học tập nào cho sinh viên này." />
      )}
    </StudentSection>
  );
}

function TuitionPage() {
  const [tuition, setTuition] = useState<StudentTuition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    studentPortalApi.getTuition().then((payload) => {
      if (active) setTuition(payload.data);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <StudentSection
      title="Học phí"
      description="Công nợ và trạng thái thanh toán lấy từ API sinh viên."
      icon={CreditCard}
    >
      {loading ? (
        <LoadingCard label="Đang tải học phí..." />
      ) : tuition ? (
        <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
          <Card>
            <CardHeader>
              <CardTitle>Công nợ hiện tại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold text-slate-950 dark:text-white">{formatCurrency(tuition.remainingAmount)}</p>
              <Badge variant={tuition.remainingAmount > 0 ? 'outline' : 'secondary'}>
                {tuition.remainingAmount > 0 ? 'Còn phải thanh toán' : 'Không còn công nợ'}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết học phí</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Tổng phát sinh" value={formatCurrency(tuition.totalAmount)} />
              <InfoRow label="Đã thanh toán" value={formatCurrency(tuition.paidAmount)} />
              <InfoRow label="Tín chỉ đã đăng ký" value={`${tuition.registeredCredits}`} />
              <InfoRow label="Đăng ký chưa thanh toán" value={`${tuition.unpaidRegistrations}`} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState title="Chưa có dữ liệu học phí" description="API chưa trả về thông tin học phí cho sinh viên này." />
      )}
    </StudentSection>
  );
}

function RegistrationsPage() {
  const [items, setItems] = useState<StudentRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    studentPortalApi.getRegistrations().then((payload) => {
      if (active) setItems(payload.data);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <StudentSection
      title="Đăng ký học phần"
      description="Danh sách học phần đã đăng ký lấy từ API sinh viên."
      icon={ClipboardList}
    >
      {loading ? (
        <LoadingCard label="Đang tải đăng ký học phần..." />
      ) : items.length ? (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Học phần đã đăng ký</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.registrationId} className="grid gap-3 rounded-lg border border-slate-100 p-3 md:grid-cols-[1fr_auto] md:items-center dark:border-slate-800">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{item.courseCode}</Badge>
                    <span className="text-xs font-semibold text-slate-400">{item.credits} tín chỉ</span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-950 dark:text-white">{item.courseName}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.classCode} · {item.semesterLabel} · {item.registeredAt}</p>
                </div>
                <Badge variant={item.paid ? 'secondary' : 'outline'}>{item.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <EmptyState title="Chưa có học phần đăng ký" description="API chưa trả về học phần đã đăng ký cho sinh viên này." />
      )}
    </StudentSection>
  );
}

function ExamsPage() {
  const [items, setItems] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    studentPortalApi.getExams().then((payload) => {
      if (active) setItems(payload.data);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <StudentSection
      title="Lịch thi"
      description="Lịch thi lấy từ API khảo thí theo sinh viên."
      icon={ClipboardCheck}
    >
      {loading ? (
        <LoadingCard label="Đang tải lịch thi..." />
      ) : items.length ? (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-emerald-600" />
              Kế hoạch thi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-3">Học phần</th>
                    <th className="px-4 py-3">Ngày thi</th>
                    <th className="px-4 py-3">Giờ thi</th>
                    <th className="px-4 py-3">Phòng</th>
                    <th className="px-4 py-3">Hình thức</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-950 dark:text-white">{item.courseName}</p>
                        <p className="text-xs font-semibold uppercase text-emerald-600">{item.courseCode}</p>
                      </td>
                      <td className="px-4 py-3">{item.examDate}</td>
                      <td className="px-4 py-3">{item.startTime} - {item.endTime}</td>
                      <td className="px-4 py-3">{item.roomCode}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{item.format}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState title="Chưa có lịch thi" description="API chưa trả về lịch thi cho sinh viên này." icon={CalendarDays} />
      )}
    </StudentSection>
  );
}

function RequestsPage() {
  const [items, setItems] = useState<StudentSupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const load = () => {
    setLoading(true);
    studentPortalApi.getSupportRequests().then((payload) => {
      setItems(payload.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }
    setSaving(true);
    try {
      const created = await studentPortalApi.createSupportRequest({ title, content });
      setItems((current) => [created, ...current]);
      setTitle('');
      setContent('');
      toast.success('Đã gửi yêu cầu hỗ trợ');
    } catch {
      toast.error('Chưa thể gửi yêu cầu hỗ trợ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudentSection
      title="Yêu cầu hỗ trợ"
      description="Gửi và theo dõi yêu cầu hỗ trợ qua API sinh viên."
      icon={HelpCircle}
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Gửi yêu cầu mới</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Tiêu đề
                <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950" placeholder="Nhập tiêu đề yêu cầu" />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Nội dung
                <textarea value={content} onChange={(event) => setContent(event.target.value)} className="min-h-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950" placeholder="Mô tả nội dung cần hỗ trợ" />
              </label>
              <Button type="submit" disabled={saving} className="w-fit">
                <Send />
                {saving ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu đã gửi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Đang tải yêu cầu...</p>
            ) : items.length ? (
              items.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-950 dark:text-white">{item.title}</p>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{item.content}</p>
                  <p className="mt-2 text-xs text-slate-400">{item.createdAt}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có yêu cầu hỗ trợ nào.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentSection>
  );
}

function StudentSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-5 pb-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            <Icon className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">{title}</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </header>
      {children}
      <Link href="/education/dashboard/student/notifications" className="w-fit text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300">
        Quay lại thông báo
      </Link>
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-52 flex-col items-center justify-center p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <Icon className="h-6 w-6" />
        </span>
        <p className="mt-4 font-semibold text-slate-950 dark:text-white">{title}</p>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-sm text-muted-foreground">{label}</CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950 dark:text-white">{value}</span>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}
