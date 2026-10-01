import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminSession, safeReturnPath } from "../../../lib/admin-auth";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Accesso | Top Edilizia Service",
  robots: { index: false, follow: false },
};
const errors: Record<string, string> = {
  invalid: "Password non corretta.",
  limit: "Troppi tentativi. Riprova tra un’ora.",
  unavailable: "Accesso temporaneamente non disponibile.",
};
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string; error?: string }>;
}) {
  const { return_to, error } = await searchParams;
  const returnTo = safeReturnPath(return_to);
  if (await isAdminSession()) redirect(returnTo);
  return (
    <main className="admin-shell admin-access">
      <Link href="/">Top Edilizia Service</Link>
      <h1>Area riservata</h1>
      <p>Accedi per consultare le richieste e preparare i preventivi.</p>
      <form method="post" action="/api/admin/login" className="admin-login">
        <input type="hidden" name="return_to" value={returnTo} />
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
        />
        {error && errors[error] && (
          <p className="admin-login-error" role="alert">
            {errors[error]}
          </p>
        )}
        <button type="submit" className="button">
          Accedi
        </button>
      </form>
      <Link href="/">Torna al sito</Link>
    </main>
  );
}
