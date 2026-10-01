import { adminIdentity } from "../../lib/quote-server";
import { chatGPTSignInPath } from "../chatgpt-auth";
export async function adminAccess(returnTo = "/admin") {
  const identity = await adminIdentity();
  if (identity.allowed) return null;
  return (
    <main className="admin-shell admin-access">
      <a href="/">Top Edilizia Service</a>
      <h1>Area riservata</h1>
      <p>
        {identity.authenticated
          ? "Questo account non è abilitato alla gestione dei preventivi."
          : "Accedi per consultare le richieste e preparare i preventivi."}
      </p>
      {!identity.authenticated && (
        <a className="button" href={chatGPTSignInPath(returnTo)} target="_top">
          Accedi all’area riservata
        </a>
      )}
      <a href="/">Torna al sito</a>
    </main>
  );
}
