import { redirect } from "next/navigation";

export default function LandingPageTemplatesAdminPage() {
  redirect("/landing-pages?tab=templates");
}
