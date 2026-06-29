import type { Metadata } from "next";
import { SalesLandingPage } from "@/components/landing/SalesLandingPage";

export const metadata: Metadata = {
  title: "LadiPage Sales Kit",
  description: "Landing page bán hàng cho chủ shop và doanh nghiệp nhỏ cần tăng chuyển đổi.",
};

export default function Page() {
  return <SalesLandingPage />;
}
