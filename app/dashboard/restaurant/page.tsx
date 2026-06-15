import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RestaurantDashboard } from "@/components/dashboard/RestaurantDashboard";

export default async function RestaurantDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  if (role !== "RESTAURANT_OWNER" && role !== "ADMIN") redirect("/");
  return <RestaurantDashboard />;
}
