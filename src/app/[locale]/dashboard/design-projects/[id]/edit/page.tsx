import DesignProjectForm from "@/components/designer/DesignProjectForm";

export default async function EditDesignProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DesignProjectForm projectId={Number(id)} />;
}
