import { company } from "../lib/company";
export default function Consultation() {
  return (
    <section id="consultation" className="section consultation">
      <div className="consultation-panel consultation-reference reveal">
        <svg
          className="contact-waves"
          viewBox="0 0 2146 733"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="contact-wave-peach" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="rgb(251, 188, 156)" />
              <stop offset="1" stopColor="rgb(255, 152, 48)" />
            </linearGradient>
            <linearGradient
              id="contact-wave-orange"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0" stopColor="rgb(251, 188, 156)" />
              <stop offset="0.55" stopColor="rgb(255, 152, 48)" />
              <stop offset="1" stopColor="rgb(241, 93, 46)" />
            </linearGradient>
            <linearGradient id="contact-wave-front" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="rgb(255, 152, 48)" />
              <stop offset="1" stopColor="rgb(241, 93, 46)" />
            </linearGradient>
          </defs>
          <g className="contact-wave-back">
            <path
              d="M-40 464 C230 452 470 538 740 520 S1120 412 1390 457 S1820 566 2186 492 L2186 773 H-40Z"
              fill="url(#contact-wave-peach)"
              opacity=".74"
            />
          </g>
          <g className="contact-wave-middle">
            <path
              d="M-40 558 C400 628 840 562 1230 568 S1740 557 2186 592 L2186 773 H-40Z"
              fill="url(#contact-wave-orange)"
              opacity=".28"
            />
          </g>
          <g className="contact-wave-front">
            <path
              d="M370 773 C460 625 900 571 1280 587 S1790 560 2186 727 V773Z"
              fill="url(#contact-wave-front)"
              opacity=".27"
            />
          </g>
        </svg>
        <div className="consultation-copy">
          <p className="eyebrow">Contatti · Top Edilizia Service</p>
          <h2>
            Trasforma la tua
            <br />
            idea in realtà
          </h2>
          <p>
            Costruiamo insieme soluzioni su misura per i tuoi spazi, seguendo
            ogni fase del progetto fino alla realizzazione. Contattaci per
            ricevere maggiori informazioni sui nostri servizi.
          </p>
          <ul>
            <li>Personale esperto</li>
            <li>Tecnologie all’avanguardia</li>
            <li>Cura dei dettagli</li>
          </ul>
          <p className="contact-address">
            {company.address}
            <br />
            {company.hours}
            <br />
            Sabato e domenica: chiuso
          </p>
        </div>
        <div className="booking-card">
          <strong>Parliamo del tuo progetto</strong>
          <p>Costruzioni, ristrutturazioni e restauri</p>
          <a className="button" href="#estimator">
            Richiedi preventivo →
          </a>
          <a className="phone" href={company.phoneHref}>
            {company.phone}
          </a>
          <a className="phone" href={company.mobileHref}>
            {company.mobile}
          </a>
          <a className="contact-email" href={`mailto:${company.email}`}>
            {company.email}
          </a>
          <a
            className="text-link"
            href={company.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            Scrivici su WhatsApp →
          </a>
        </div>
      </div>
    </section>
  );
}
