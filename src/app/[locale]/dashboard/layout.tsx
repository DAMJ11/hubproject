import { DashboardUserProvider } from "@/contexts/DashboardUserContext";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardUserProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardUserProvider>
  );
}
