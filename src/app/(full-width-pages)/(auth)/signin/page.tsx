import SignInForm from "@/components/auth/SignInForm";
import { ContentSkeleton } from "@/components/ui/skeleton/ContentSkeleton";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In | LadiPage",
  description: "Đăng nhập LadiPage",
};

export default function SignIn() {
  return (
    <Suspense fallback={<ContentSkeleton variant="form" label="Loading" className="p-10" />}>
      <SignInForm />
    </Suspense>
  );
}
