import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In | LadiPage",
  description: "Đăng nhập LadiPage",
};

export default function SignIn() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
