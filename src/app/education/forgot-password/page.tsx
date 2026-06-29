// TODO: Chuy?n d?i t? code AI Hosting
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/features/education/components/ui/button';
import { Input } from '@/features/education/components/ui/input';
import { Label } from '@/features/education/components/ui/label';
import { ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface FormErrors {
  email?: string;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    
    // TODO: Gọi API forgot password
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu</h1>
            <p className="text-sm text-muted-foreground">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                  placeholder="example@donga.edu.vn"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang gửi...
                  </span>
                ) : (
                  'Gửi yêu cầu'
                )}
              </Button>

              <Link href="/education/dashboard/admin/signin">
                <Button variant="ghost" className="w-full" type="button">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại đăng nhập
                </Button>
              </Link>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Kiểm tra email của bạn</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Không nhận được email? Kiểm tra thư mục spam hoặc thử lại sau vài phút.
                </p>
              </div>
              <Link href="/education/dashboard/admin/signin">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại đăng nhập
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}