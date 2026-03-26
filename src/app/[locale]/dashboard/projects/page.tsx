import { redirect } from "next/navigation";
import { getRfqList } from "@/lib/data/rfq";
import ProjectsList from "./projects-list";

export default async function ProjectsPage() {
  const projects = await getRfqList();
  if (!projects) redirect("/login");

  return <ProjectsList projects={projects} />;
}

