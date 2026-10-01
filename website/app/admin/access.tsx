import { redirect } from "next/navigation";
import { adminIdentity } from "../../lib/quote-server";
export async function adminAccess(returnTo = "/admin") {
  const identity = await adminIdentity();
  if (identity.allowed) return null;
  redirect(`/admin/login?return_to=${encodeURIComponent(returnTo)}`);
}
