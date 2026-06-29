/**
 * Layout trống cho public landing pages tại /p/[slug]
 * Không có sidebar, header, hoặc bất kỳ wrapper nào của admin.
 * CSS từ root layout (globals.css) sẽ không được áp dụng.
 */
export default function PublicPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
