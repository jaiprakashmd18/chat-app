import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");
  return <AdminDashboard />;
}
