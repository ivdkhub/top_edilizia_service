"use client";
import { useState } from "react";
export default function Transformation() {
  const [position, setPosition] = useState(50);
  return (
    <section id="transformation" className="section transformation">
      <div className="split-heading reveal">
        <div>
          <p className="eyebrow">Dall’idea alla realtà</p>
          <h2>
            Costruiamo, ristrutturiamo,
            <br />
            valorizziamo
          </h2>
        </div>
        <p>
          Ogni progetto prende forma passo dopo passo. Trascina il cursore per
          esplorare la trasformazione, dalle fondamenta alla realizzazione
          finale.
        </p>
      </div>
      <div
        className="comparison reveal"
        style={{ "--split": `${position}%` } as React.CSSProperties}
      >
        <img
          loading="lazy"
          decoding="async"
          className="comparison-after"
          src="/media/completed.jpg"
          alt="Realizzazione finale della villa, dal video fornito"
        />
        <div className="comparison-before">
          <img
            loading="lazy"
            decoding="async"
            src="/media/fondamenta.webp"
            alt="Fondamenta prima della costruzione, immagine fornita"
          />
        </div>
        <span className="comparison-label before-label">Le fondamenta</span>
        <span className="comparison-label after-label">La realizzazione</span>
        <div className="comparison-line">
          <span>‹ ›</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label="Confronta prima e dopo la costruzione"
        />
      </div>
      <div className="guarantees reveal">
        {[
          [
            "01",
            "ORGANIZZAZIONE E RAPIDITÀ",
            "Efficienza e rispetto dei tempi concordati.",
          ],
          [
            "02",
            "TECNOLOGIE ALL’AVANGUARDIA",
            "Attrezzature moderne e soluzioni innovative.",
          ],
          [
            "03",
            "PERSONALE ESPERTO",
            "Professionalità e cura dei dettagli in ogni fase.",
          ],
        ].map(([number, title, body]) => (
          <div key={number}>
            <span>{number}</span>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
