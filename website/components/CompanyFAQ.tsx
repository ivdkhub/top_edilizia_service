"use client";
import { useState } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ParallaxCard } from "./ui/parallax-card";

const questions = [
  [
    "Realizzate sia interventi per privati che per aziende?",
    "Sì, operiamo sia per clienti privati sia per aziende, realizzando lavori su edifici residenziali, commerciali e industriali in base alle specifiche esigenze del progetto.",
  ],
  [
    "Quali lavori di ristrutturazione eseguite?",
    "Ci occupiamo di rifacimento tetti e coperture, impermeabilizzazione di terrazze, ristrutturazioni interne ed esterne e rifacimento delle facciate, garantendo lavorazioni accurate e materiali di qualità.",
  ],
  [
    "Vi occupate anche del restauro di edifici storici?",
    "Sì, eseguiamo interventi di restauro interno ed esterno su edifici storici e d’epoca, operando con particolare attenzione per preservarne le caratteristiche originali.",
  ],
  [
    "Quali sono i punti di forza di Top Edilizia Service?",
    "L’esperienza pluriennale, il personale qualificato, l’utilizzo di tecnologie all’avanguardia, la rapidità di esecuzione e la cura dei dettagli sono gli elementi che contraddistinguono ogni nostro intervento.",
  ],
];
export default function CompanyFAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="beauty-faq" id="faq">
      <div className="beauty-faq-heading">
        <span className="faq-help">
          <CircleHelp aria-hidden="true" size={24} />
        </span>
        <p className="eyebrow">Risposte alle vostre domande</p>
        <h2>Domande frequenti</h2>
        <p>Informazioni sui nostri servizi, per partire con le idee chiare.</p>
      </div>
      <div className="beauty-faq-list">
        {questions.map(([question, answer], index) => (
          <ParallaxCard key={question} delay={index * 0.05}>
            <div
              className={`beauty-faq-card ${open === index ? "is-open" : ""}`}
            >
              <h3>
                <button
                  id={`faq-question-${index}`}
                  aria-expanded={open === index}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpen(open === index ? null : index)}
                >
                  <span>{question}</span>
                  <span className="faq-chevron">
                    <ChevronDown size={20} aria-hidden="true" />
                  </span>
                </button>
              </h3>
              <div
                className="faq-answer"
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                inert={open !== index}
                onTransitionEnd={(event) => {
                  if (event.propertyName === "grid-template-rows")
                    ScrollTrigger.refresh();
                }}
              >
                <div>
                  <p>{answer}</p>
                </div>
              </div>
            </div>
          </ParallaxCard>
        ))}
      </div>
    </div>
  );
}
