import { services } from "../../lib/company";
import {
  serviceIds,
  workOptions,
  type SavedRequest,
} from "../../lib/quote-config";
export default function RequestDetails({ record }: { record: SavedRequest }) {
  const r = record.request;
  const details = [
    ["Servizio", services[serviceIds.indexOf(r.service)].title],
    ["Ambito", r.scope],
    ["Immobile", r.propertyType],
    ["Indirizzo", `${r.address}, ${r.postalCode} ${r.city}`],
    ["Superficie", r.area ? `${r.area} m²` : "Da verificare"],
    [
      "Piani / locali",
      `${r.floors || "Da verificare"} / ${r.rooms || "Da verificare"}`,
    ],
    ["Stato", r.condition],
    ["Occupazione", r.occupancy],
    ["Finiture", r.quality],
    ["Budget", r.budget],
    ["Inizio", r.timing],
    ["Scadenza", r.deadline || "Da concordare"],
    ["Progetto", r.design],
    ["Autorizzazioni", r.permits],
  ];
  return (
    <>
      <h2>La richiesta del cliente</h2>
      <p className="admin-reference">
        TES-{record.id.slice(0, 8).toUpperCase()} ·{" "}
        {new Date(record.createdAt).toLocaleDateString("it-IT")}
      </p>
      <h3>{r.name}</h3>
      <div className="admin-contact">
        <a href={`mailto:${r.email}`}>{r.email}</a>
        <a href={`tel:${r.phone.replace(/[^+\d]/g, "")}`}>{r.phone}</a>
        {r.company && <p>{r.company}</p>}
        {r.taxId && <p>CF / P.IVA: {r.taxId}</p>}
      </div>
      <dl className="admin-details">
        {details.map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <h3>Descrizione</h3>
      <p className="admin-long-text">{r.description}</p>
      {!!r.works.length && (
        <>
          <h3>Interventi e misure</h3>
          {r.works.map((work) => (
            <div className="request-work" key={work.id}>
              <strong>
                {workOptions.find((w) => w.id === work.id)?.title}
              </strong>
              <p>
                {work.quantity
                  ? `${work.quantity} ${work.unit}`
                  : "Misure da verificare"}
              </p>
              {work.details && (
                <p className="admin-long-text">{work.details}</p>
              )}
            </div>
          ))}
        </>
      )}
      {r.access && (
        <>
          <h3>Accesso e vincoli</h3>
          <p className="admin-long-text">{r.access}</p>
        </>
      )}
      {r.notes && (
        <>
          <h3>Note del cliente</h3>
          <p className="admin-long-text">{r.notes}</p>
        </>
      )}
      {r.documentsUrl && (
        <a
          className="admin-document-link"
          href={r.documentsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Apri foto / documenti condivisi
        </a>
      )}
    </>
  );
}
