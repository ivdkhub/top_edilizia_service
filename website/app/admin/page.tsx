import AdminDashboard from "../../components/admin/AdminDashboard";
import { adminAccess } from "./access";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Richieste e preventivi | Top Edilizia Service",
  robots: { index: false, follow: false },
};
export default async function AdminPage() {
  const gate = await adminAccess();
  if (gate) return gate;
  return <AdminDashboard />;
}
