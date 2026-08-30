export default function CustomerCareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[calc(100dvh-46px)] min-h-0 w-full overflow-hidden bg-[#f8fafc] dark:bg-[#0f1016]">
      {children}
    </div>
  );
}
