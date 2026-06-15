import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DeliveryDashboard } from "@/components/dashboard/DeliveryDashboard";

export default async function DeliveryDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  if (role !== "DELIVERY_PARTNER" && role !== "ADMIN") redirect("/");
  return <DeliveryDashboard />;
}
