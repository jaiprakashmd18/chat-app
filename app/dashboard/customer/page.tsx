import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";

export default async function CustomerDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <CustomerDashboard />;
}
