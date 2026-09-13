import { CustomerCareProviders } from "./_providers/CustomerCareProviders.client";

export default function CustomerCareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerCareProviders>
      <div className="h-[calc(100dvh-52px)] min-h-0 w-full overflow-hidden bg-[#f8fafc] dark:bg-[#0f1016]">
        {children}
      </div>
    </CustomerCareProviders>
  );
}
