import { getQuoteDatabase } from "../../../../db";
import { savedRequest, type RequestRow } from "../../../../lib/quote-server";
import { adminAccess } from "../../access";
import QuoteDocument from "../../../../components/admin/QuoteDocument";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Preventivo | Top Edilizia Service",
  robots: { index: false, follow: false },
};
export default async function QuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gate = await adminAccess(`/admin/quotes/${id}`);
  if (gate) return gate;
  try {
    const row = await getQuoteDatabase()
      .prepare("SELECT * FROM quote_requests WHERE id = ?")
      .bind(id)
      .first<RequestRow>();
    if (!row?.quote)
      return (
        <main className="admin-shell">
          <h1>Preventivo non disponibile</h1>
          <a href="/admin">Torna alle richieste</a>
        </main>
      );
    return <QuoteDocument record={savedRequest(row)} />;
  } catch (error) {
    console.error("Quote document unavailable", error);
    return (
      <main className="admin-shell">
        <h1>Documento temporaneamente non disponibile</h1>
        <a href="/admin">Torna alle richieste</a>
      </main>
    );
  }
}
