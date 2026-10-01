"use client";
import { useState } from "react";
import { services } from "../lib/company";
import CompanyFAQ from "./CompanyFAQ";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
export default function Process() {
  const [active, setActive] = useState(0),
    [expanded, setExpanded] = useState(false);
  const service = services[active];
  return (
    <section id="process" className="section process">
      <div className="split-heading reveal">
        <div>
          <p className="eyebrow">Servizi specializzati</p>
          <h2>Ogni spazio, il suo progetto</h2>
        </div>
        <p>
          Dalle nuove costruzioni alle ristrutturazioni civili e industriali,
          fino ai restauri di edifici storici: soluzioni su misura per ogni
          tipologia di intervento.
        </p>
      </div>
      <div
        className="process-tabs reveal"
        role="tablist"
        aria-label="Scopri i nostri servizi"
      >
        {services.map((item, i) => (
          <button
            key={item.title}
            role="tab"
            aria-selected={i === active}
            aria-controls={`service-panel-${i}`}
            id={`service-${i}`}
            tabIndex={i === active ? 0 : -1}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                const next =
                  (active + (event.key === "ArrowRight" ? 1 : 3)) % 4;
                setActive(next);
                document.getElementById(`service-${next}`)?.focus();
              }
            }}
            onClick={() => setActive(i)}
          >
            <span className="phase-number">0{i + 1}</span>
            <strong>{item.title}</strong>
            <small>{item.subtitle}</small>
          </button>
        ))}
      </div>
      <div
        className="process-panel reveal"
        id={`service-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`service-${active}`}
      >
        <div className="phase-copy" key={`copy-${active}`}>
          <p className="phase-badge">
            ● 0{active + 1} / 04 · {service.subtitle}
          </p>
          <h3>{service.title} a Saronno</h3>
          <p>{service.body}</p>
          <h4>Di cosa ci occupiamo:</h4>
          <ul>
            {service.details.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <div className="phase-bottom">
            <button className="text-link" onClick={() => setExpanded(true)}>
              Approfondisci il servizio ↗
            </button>
            <button
              className="text-link"
              onClick={() => setActive((active + 1) % 4)}
            >
              Prossimo servizio →
            </button>
          </div>
        </div>
        <div className="phase-visual" key={`image-${active}`}>
          <img
            className="company-image"
            src={service.image}
            alt={`Immagine dalla galleria lavori — ${service.title}`}
            loading="lazy"
            decoding="async"
          />
          <span>● Top Edilizia Service · {service.title}</span>
        </div>
      </div>
      <CompanyFAQ />
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent
          className="estate-dialog service-dialog"
          showCloseButton={false}
        >
          <button
            className="dialog-close"
            aria-label="Chiudi dettagli servizio"
            onClick={() => setExpanded(false)}
          >
            ×
          </button>
          <DialogTitle asChild>
            <h2>{service.title} a Saronno</h2>
          </DialogTitle>
          <DialogDescription>{service.subtitle}</DialogDescription>
          <div className="service-full-text">
            {service.fullText.map((line, i) =>
              line.length < 150 ? (
                <h3 key={i}>{line}</h3>
              ) : (
                <p key={i}>{line}</p>
              ),
            )}
          </div>
          <a
            href="#consultation"
            className="button"
            onClick={() => setExpanded(false)}
          >
            Richiedi informazioni →
          </a>
        </DialogContent>
      </Dialog>
    </section>
  );
}
