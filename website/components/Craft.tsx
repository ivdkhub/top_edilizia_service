"use client";
import LuminousServiceCard from "@/components/ui/luminous-service-card";
import { services, studioImage } from "../lib/company";
export default function Craft() {
  return (
    <>
      <section id="craft" className="section craft">
        <div className="reveal">
          <p className="eyebrow">I nostri servizi</p>
          <h2>
            Dalla progettazione
            <br />
            alla realizzazione
          </h2>
        </div>
        <div className="craft-grid">
          {services.map((service, index) => (
            <LuminousServiceCard
              key={service.title}
              title={service.title}
              description={service.body.split(/(?<=\.)\s/)[0]}
              href={`#service-${index}`}
            />
          ))}
        </div>
      </section>
      <section id="studio" className="section studio">
        <div className="studio-copy reveal">
          <p className="eyebrow">Chi siamo · Saronno, Lombardia</p>
          <h2>
            L’esperienza che
            <br />
            costruisce valore
          </h2>
          <p className="body-copy">
            Top Edilizia Service S.r.l. è un’impresa edile di Saronno
            specializzata in costruzioni, ristrutturazioni e restauri civili e
            industriali. Grazie a un’esperienza pluriennale e a uno staff
            qualificato, realizziamo interventi con professionalità, precisione
            e materiali di qualità, operando in tutta la Lombardia.
          </p>
          <p className="eyebrow materials-heading">
            Soluzioni per ogni esigenza
          </p>
          <div className="material-tags">
            {[
              "Residenziale",
              "Commerciale",
              "Industriale",
              "Edifici storici",
            ].map((text) => (
              <span key={text}>{text}</span>
            ))}
          </div>
          <details className="company-values">
            <summary>
              La nostra filosofia, missione e valori <span>＋</span>
            </summary>
            <h4>Filosofia</h4>
            <p>
              Affrontiamo ogni progetto con un approccio pratico e orientato al
              risultato, senza trascurare l’aspetto estetico e funzionale. Ogni
              intervento viene studiato per rispondere in modo concreto alle
              esigenze del cliente, con soluzioni personalizzate. Per noi
              costruire significa creare valore nel tempo.
            </p>
            <h4>Missione</h4>
            <p>
              Offrire soluzioni edilizie affidabili e su misura, seguendo ogni
              progetto con attenzione e professionalità. L’obiettivo è
              trasformare ogni esigenza in un intervento efficace e duraturo.
            </p>
            <h4>Valori</h4>
            <p>
              Crediamo nella serietà, nella trasparenza e nella cura dei
              dettagli come basi fondamentali del nostro lavoro. Operiamo con
              responsabilità, utilizzando materiali di qualità e affidandoci a
              un team qualificato. La fiducia del cliente è per noi un valore
              centrale, costruito giorno dopo giorno.
            </p>
          </details>
          <a href="#consultation" className="text-link">
            Parliamo del tuo progetto <span>→</span>
          </a>
        </div>
        <div className="studio-visual reveal">
          <img
            className="company-image"
            src={studioImage}
            alt="Intervento edilizio pubblicato da Top Edilizia Service"
            loading="lazy"
            decoding="async"
          />
          <div className="stats">
            {[
              ["25", "Anni di", "esperienza"],
              ["4", "Servizi", "specializzati"],
              ["3", "Ambiti", "operativi"],
            ].map(([number, line1, line2]) => (
              <div key={number}>
                <strong>
                  <span className="counter" data-value={number}>
                    {number}
                  </span>
                </strong>
                <span>
                  {line1}
                  <br />
                  {line2}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
