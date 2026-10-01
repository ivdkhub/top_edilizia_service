"use client";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { company, services } from "../lib/company";
import {
  initialRequest,
  requestSchema,
  scopes,
  serviceIds,
  units,
  workOptions,
  type QuoteRequestDraft,
} from "../lib/quote-config";
const stepNames = ["Interventi", "Immobile", "Progetto", "Contatti"];
function Field({
  title,
  hint,
  wide,
  children,
}: {
  title: string;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`quote-field ${wide ? "wide" : ""}`}>
      <span>{title}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export default function Estimator() {
  const [form, setForm] = useState(initialRequest);
  const [step, setStep] = useState(0),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [sent, setSent] = useState("");
  const set = <K extends keyof QuoteRequestDraft>(
    key: K,
    value: QuoteRequestDraft[K],
  ) => setForm((previous) => ({ ...previous, [key]: value }));
  useEffect(() => {
    if (!form.id) set("id", crypto.randomUUID());
  }, [form.id]);
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [step, sent]);
  const text = (
    key: keyof QuoteRequestDraft,
    type = "text",
    required = false,
  ) => (
    <input
      type={type}
      value={String(form[key])}
      onChange={(e) => set(key, e.target.value as never)}
      required={required}
      maxLength={
        key === "phone" || key === "taxId"
          ? 40
          : key === "postalCode"
            ? 5
            : key === "documentsUrl"
              ? 2000
              : key === "name" || key === "city"
                ? 150
                : 250
      }
    />
  );
  const number = (key: "area" | "floors" | "rooms") => (
    <input
      type="text"
      inputMode="decimal"
      value={form[key]}
      onChange={(e) => set(key, e.target.value)}
      placeholder="Da verificare"
      maxLength={20}
    />
  );
  const select = (key: keyof QuoteRequestDraft, values: readonly string[]) => (
    <select
      value={String(form[key])}
      onChange={(e) => set(key, e.target.value as never)}
    >
      {values.map((value) => (
        <option key={value}>{value}</option>
      ))}
    </select>
  );
  const checkStep = (next: number) => {
    const fields =
      step === 1
        ? ["city", "address", "postalCode", "area", "floors", "rooms"]
        : step === 2
          ? ["description", "documentsUrl", "deadline", "works"]
          : [];
    const result = requestSchema.safeParse(form);
    const issue = result.success
      ? null
      : result.error.issues.find((i) => fields.includes(String(i.path[0])));
    if (issue) {
      setError(issue.message);
      return;
    }
    setError("");
    setStep(next);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (step !== 3) {
      checkStep(step + 1);
      return;
    }
    const result = requestSchema.safeParse(form);
    if (!result.success) {
      const issue = result.error.issues[0];
      const key = String(issue.path[0]);
      if (
        ["city", "address", "postalCode", "area", "floors", "rooms"].includes(
          key,
        )
      )
        setStep(1);
      else if (
        ["description", "documentsUrl", "deadline", "works"].includes(key)
      )
        setStep(2);
      setError(issue.message);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = (await response.json()) as {
        error?: string;
        reference: string;
      };
      if (!response.ok)
        throw new Error(
          data.error || "Non è stato possibile salvare la richiesta. Riprova.",
        );
      setSent(data.reference);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Invio non riuscito. I dati sono ancora disponibili: riprova.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section id="estimator" className="section estimator">
      <div className="center-heading reveal">
        <p className="eyebrow">Il tuo prossimo progetto</p>
        <h2>Una soluzione costruita su di te</h2>
        <p>
          Raccontaci l’intervento, l’immobile e le tue esigenze.
          <br />I dettagli ci aiuteranno a preparare un preventivo su misura.
        </p>
      </div>
      <div className="estimator-layout">
        {sent ? (
          <div className="quote-success">
            <h3>Abbiamo ricevuto la tua richiesta</h3>
            <p>
              Riferimento: <strong>{sent}</strong>
            </p>
            <p>
              Il team valuterà le informazioni e ti contatterà ai recapiti
              indicati per gli approfondimenti e l’eventuale sopralluogo.
            </p>
            <button
              className="button"
              onClick={() => {
                setForm({ ...initialRequest(), id: crypto.randomUUID() });
                setSent("");
                setStep(0);
              }}
            >
              Nuova richiesta
            </button>
          </div>
        ) : (
          <form className="estimator-options" onSubmit={submit}>
            <ol className="quote-steps" aria-label="Passaggi del configuratore">
              {stepNames.map((name, index) => (
                <li key={name}>
                  <button
                    type="button"
                    aria-current={step === index ? "step" : undefined}
                    onClick={() =>
                      index < step
                        ? (setError(""), setStep(index))
                        : checkStep(index)
                    }
                  >
                    {index + 1}. {name}
                  </button>
                </li>
              ))}
            </ol>
            {step === 0 && (
              <>
                <fieldset>
                  <legend>Di quale servizio hai bisogno?</legend>
                  <div className="architecture-options">
                    {services.map((item, i) => (
                      <button
                        type="button"
                        key={item.title}
                        className={`option ${form.service === serviceIds[i] ? "selected" : ""}`}
                        aria-pressed={form.service === serviceIds[i]}
                        onClick={() => set("service", serviceIds[i])}
                      >
                        <strong>{item.title}</strong>
                        <span>{item.subtitle}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>In quale ambito?</legend>
                  <div className="size-options">
                    {scopes.map((scope) => (
                      <button
                        type="button"
                        key={scope}
                        className={`option ${form.scope === scope ? "selected" : ""}`}
                        aria-pressed={form.scope === scope}
                        onClick={() => set("scope", scope)}
                      >
                        <strong>{scope}</strong>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Quali interventi vuoi valutare?</legend>
                  <div className="addition-options">
                    {workOptions.map((work) => (
                      <button
                        type="button"
                        key={work.id}
                        className={`addition ${form.works.some((w) => w.id === work.id) ? "selected" : ""}`}
                        aria-pressed={form.works.some((w) => w.id === work.id)}
                        onClick={() =>
                          set(
                            "works",
                            form.works.some((w) => w.id === work.id)
                              ? form.works.filter((w) => w.id !== work.id)
                              : [
                                  ...form.works,
                                  {
                                    id: work.id,
                                    quantity: "",
                                    unit: "m²",
                                    details: "",
                                  },
                                ],
                          )
                        }
                      >
                        <span>
                          <strong>{work.title}</strong>
                          <small>{work.description}</small>
                        </span>
                        <b aria-hidden="true">
                          {form.works.some((w) => w.id === work.id) ? "✓" : "+"}
                        </b>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            {step === 1 && (
              <fieldset>
                <legend>Le caratteristiche dell’immobile</legend>
                <div className="quote-fields">
                  <Field title="Tipo di immobile">
                    {select("propertyType", [
                      "Appartamento",
                      "Casa / villa",
                      "Condominio",
                      "Negozio / ufficio",
                      "Capannone",
                      "Altro",
                    ])}
                  </Field>
                  <Field title="Comune *">{text("city", "text", true)}</Field>
                  <Field title="Indirizzo *" wide>
                    {text("address", "text", true)}
                  </Field>
                  <Field title="CAP">{text("postalCode")}</Field>
                  <Field title="Superficie indicativa (m²)">
                    {number("area")}
                  </Field>
                  <Field title="Numero di piani">{number("floors")}</Field>
                  <Field title="Numero di locali">{number("rooms")}</Field>
                  <Field title="Stato attuale">
                    {select("condition", [
                      "Da valutare",
                      "Da ristrutturare",
                      "Parzialmente ristrutturato",
                      "Grezzo",
                      "Nuova costruzione",
                    ])}
                  </Field>
                  <Field title="Immobile durante i lavori">
                    {select("occupancy", [
                      "Libero",
                      "Abitato / in uso",
                      "Da definire",
                    ])}
                  </Field>
                  <Field
                    title="Accesso e vincoli del cantiere"
                    wide
                    hint="Piano, ascensore, accesso mezzi, spazi di deposito, vincoli condominiali o altre condizioni."
                  >
                    <textarea
                      value={form.access}
                      onChange={(e) => set("access", e.target.value)}
                      maxLength={1000}
                    />
                  </Field>
                </div>
              </fieldset>
            )}
            {step === 2 && (
              <>
                <fieldset>
                  <legend>Misure e lavorazioni</legend>
                  {form.works.length ? (
                    form.works.map((work, index) => (
                      <div className="quote-work-detail" key={work.id}>
                        <h4>
                          {workOptions.find((w) => w.id === work.id)?.title}
                        </h4>
                        <div className="quote-fields">
                          <Field title="Quantità indicativa">
                            <input
                              inputMode="decimal"
                              value={work.quantity}
                              maxLength={20}
                              placeholder="Da verificare"
                              onChange={(e) =>
                                set(
                                  "works",
                                  form.works.map((w, i) =>
                                    i === index
                                      ? { ...w, quantity: e.target.value }
                                      : w,
                                  ),
                                )
                              }
                            />
                          </Field>
                          <Field title="Unità di misura">
                            <select
                              value={work.unit}
                              onChange={(e) =>
                                set(
                                  "works",
                                  form.works.map((w, i) =>
                                    i === index
                                      ? {
                                          ...w,
                                          unit: e.target
                                            .value as typeof work.unit,
                                        }
                                      : w,
                                  ),
                                )
                              }
                            >
                              {units.map((unit) => (
                                <option key={unit}>{unit}</option>
                              ))}
                            </select>
                          </Field>
                          <Field title="Dettagli della lavorazione" wide>
                            <textarea
                              value={work.details}
                              maxLength={600}
                              placeholder="Materiali, problemi attuali e risultato desiderato"
                              onChange={(e) =>
                                set(
                                  "works",
                                  form.works.map((w, i) =>
                                    i === index
                                      ? { ...w, details: e.target.value }
                                      : w,
                                  ),
                                )
                              }
                            />
                          </Field>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="estimate-note">
                      Puoi descrivere gli interventi qui sotto, anche se non
                      conosci ancora le misure.
                    </p>
                  )}
                </fieldset>
                <fieldset>
                  <legend>Esigenze e tempi</legend>
                  <div className="quote-fields">
                    <Field title="Descrizione del progetto *" wide>
                      <textarea
                        required
                        value={form.description}
                        maxLength={5000}
                        placeholder="Descrivi lo stato attuale e cosa vorresti realizzare"
                        onChange={(e) => set("description", e.target.value)}
                      />
                    </Field>
                    <Field title="Livello delle finiture">
                      {select("quality", [
                        "Da valutare insieme",
                        "Essenziale",
                        "Intermedia",
                        "Alta gamma",
                      ])}
                    </Field>
                    <Field title="Budget indicativo">
                      {select("budget", [
                        "Da valutare insieme",
                        "Fino a 20.000 €",
                        "20.000 – 50.000 €",
                        "50.000 – 100.000 €",
                        "100.000 – 250.000 €",
                        "Oltre 250.000 €",
                      ])}
                    </Field>
                    <Field title="Quando vorresti iniziare?">
                      {select("timing", [
                        "Da concordare",
                        "Entro 3 mesi",
                        "Tra 3 e 6 mesi",
                        "Tra 6 e 12 mesi",
                        "Oltre 12 mesi",
                      ])}
                    </Field>
                    <Field title="Eventuale scadenza dei lavori">
                      {text("deadline", "date")}
                    </Field>
                    <Field title="Progetto tecnico">
                      {select("design", [
                        "Da definire",
                        "Non ancora disponibile",
                        "In corso",
                        "Progetto disponibile",
                      ])}
                    </Field>
                    <Field title="Pratiche e autorizzazioni">
                      {select("permits", [
                        "Da verificare",
                        "Da richiedere",
                        "In corso",
                        "Già disponibili",
                      ])}
                    </Field>
                    <Field
                      title="Link a foto e planimetrie"
                      wide
                      hint="Facoltativo: puoi inserire un link condiviso ai documenti utili per la valutazione."
                    >
                      {text("documentsUrl", "url")}
                    </Field>
                  </div>
                </fieldset>
              </>
            )}
            {step === 3 && (
              <fieldset>
                <legend>I tuoi recapiti</legend>
                <div className="quote-fields">
                  <Field title="Nome e cognome *" wide>
                    {text("name", "text", true)}
                  </Field>
                  <Field title="Email *">{text("email", "email", true)}</Field>
                  <Field title="Telefono *">{text("phone", "tel", true)}</Field>
                  <Field title="Azienda / ragione sociale">
                    {text("company")}
                  </Field>
                  <Field title="Codice fiscale / partita IVA">
                    {text("taxId")}
                  </Field>
                  <Field title="Altre informazioni" wide>
                    <textarea
                      value={form.notes}
                      maxLength={3000}
                      onChange={(e) => set("notes", e.target.value)}
                    />
                  </Field>
                </div>
                <label className="quote-consent">
                  <input
                    type="checkbox"
                    checked={form.consent === true}
                    required
                    onChange={(e) => set("consent", e.target.checked as true)}
                  />
                  <span>
                    Ho letto l’
                    <a
                      href={company.privacy}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      informativa privacy
                    </a>{" "}
                    e richiedo di essere ricontattato per questo progetto.
                  </span>
                </label>
                <label className="quote-honeypot" aria-hidden="true">
                  Sito web
                  <input
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                  />
                </label>
              </fieldset>
            )}
            {error && (
              <p className="quote-feedback error" role="alert">
                {error}
              </p>
            )}
            <div className="quote-actions">
              <button
                type="button"
                className="quote-back"
                disabled={step === 0 || busy}
                onClick={() => {
                  setStep(step - 1);
                  setError("");
                }}
              >
                Indietro
              </button>
              <button className="button" type="submit" disabled={busy}>
                {busy
                  ? "Invio in corso…"
                  : step === 3
                    ? "Invia richiesta"
                    : "Continua"}
              </button>
            </div>
          </form>
        )}
        <aside className="estimate">
          <p className="eyebrow">Riepilogo della richiesta</p>
          <p className="estimate-label">Ogni progetto è unico</p>
          <output>
            Preventivo
            <br />
            su misura
          </output>
          <dl>
            <div>
              <dt>Servizio</dt>
              <dd>{services[serviceIds.indexOf(form.service)].title}</dd>
            </div>
            <div>
              <dt>Ambito</dt>
              <dd>{form.scope}</dd>
            </div>
            <div>
              <dt>Interventi</dt>
              <dd>
                {form.works.length
                  ? form.works
                      .map((w) => workOptions.find((o) => o.id === w.id)?.title)
                      .join(", ")
                  : "Da definire insieme"}
              </dd>
            </div>
            {form.city && (
              <div>
                <dt>Immobile</dt>
                <dd>
                  {form.address}, {form.city}
                </dd>
              </div>
            )}
            {form.area && (
              <div>
                <dt>Superficie</dt>
                <dd>{form.area} m²</dd>
              </div>
            )}
            <div>
              <dt>Budget</dt>
              <dd>{form.budget}</dd>
            </div>
            <div>
              <dt>Inizio</dt>
              <dd>{form.timing}</dd>
            </div>
          </dl>
          <p className="estimate-note">
            La richiesta viene salvata per il nostro team. Importi, lavorazioni
            e tempi saranno definiti dopo la valutazione dei dettagli e
            l’eventuale sopralluogo.
          </p>
        </aside>
      </div>
    </section>
  );
}
