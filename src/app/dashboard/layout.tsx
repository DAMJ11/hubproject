import { DashboardUserProvider } from "@/contexts/DashboardUserContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardUserProvider>
      <LanguageProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </LanguageProvider>
    </DashboardUserProvider>
  );
}
