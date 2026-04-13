import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DesignDetailClient from "@/components/designer/DesignDetailClient";

export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = Number(id);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <DesignDetailClient itemId={itemId} />
      <Footer />
    </main>
  );
}
