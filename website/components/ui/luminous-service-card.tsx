"use client";

import { useId, useState } from "react";

interface LuminousServiceCardProps {
  title: string;
  description: string;
  href: string;
}

/** The supplied slit/lumen design, scoped to a real service article. */
export default function LuminousServiceCard({
  title,
  description,
  href,
}: LuminousServiceCardProps) {
  const [lit, setLit] = useState(false);
  const id = useId().replace(/:/g, "");
  return (
    <article
      className="craft-card luminous-service"
      aria-labelledby={`${id}-title`}
    >
      <div className="luminous-card" data-lit={lit}>
        <div className="luminous-light-layer" aria-hidden="true">
          <div className="luminous-slit" />
          <div className="luminous-lumen">
            <div className="luminous-min" />
            <div className="luminous-mid" />
            <div className="luminous-hi" />
          </div>
          <div className="luminous-darken">
            <div className="luminous-sl" />
            <div className="luminous-ll" />
            <div className="luminous-slt" />
            <div className="luminous-srt" />
          </div>
        </div>
        <div className="luminous-content">
          <div className="luminous-icon" aria-hidden="true">
            <svg viewBox="0 0 1024 1024">
              <path
                fill={`url(#${id}-gradient)`}
                filter={`url(#${id}-inner)`}
                d="M488.1 414.7V303.4L300.9 428l83.6 55.8zm254.1 137.7v-79.8l-59.8 39.9zM512 64C264.6 64 64 264.6 64 512s200.6 448 448 448s448-200.6 448-448S759.4 64 512 64m278 533c0 1.1-.1 2.1-.2 3.1c0 .4-.1.7-.2 1a14.2 14.2 0 0 1-.8 3.2c-.2.6-.4 1.2-.6 1.7c-.2.4-.4.8-.5 1.2c-.3.5-.5 1.1-.8 1.6c-.2.4-.4.7-.7 1.1c-.3.5-.7 1-1 1.5c-.3.4-.5.7-.8 1c-.4.4-.8.9-1.2 1.3c-.3.3-.6.6-1 .9c-.4.4-.9.8-1.4 1.1c-.4.3-.7.6-1.1.8c-.1.1-.3.2-.4.3L525.2 786c-4 2.7-8.6 4-13.2 4c-4.7 0-9.3-1.4-13.3-4L244.6 616.9c-.1-.1-.3-.2-.4-.3l-1.1-.8c-.5-.4-.9-.7-1.3-1.1c-.3-.3-.6-.6-1-.9c-.4-.4-.8-.8-1.2-1.3a7 7 0 0 1-.8-1c-.4-.5-.7-1-1-1.5c-.2-.4-.5-.7-.7-1.1c-.3-.5-.6-1.1-.8-1.6c-.2-.4-.4-.8-.5-1.2c-.2-.6-.4-1.2-.6-1.7c-.1-.4-.3-.8-.4-1.2c-.2-.7-.3-1.3-.4-2c-.1-.3-.1-.7-.2-1c-.1-1-.2-2.1-.2-3.1V427.9c0-1 .1-2.1.2-3.1c.1-.3.1-.7.2-1a14.2 14.2 0 0 1 .8-3.2c.2-.6.4-1.2.6-1.7c.2-.4.4-.8.5-1.2c.2-.5.5-1.1.8-1.6c.2-.4.4-.7.7-1.1c.6-.9 1.2-1.7 1.8-2.5c.4-.4.8-.9 1.2-1.3c.3-.3.6-.6 1-.9c.4-.4.9-.8 1.3-1.1s.7-.6 1.1-.8c.1-.1.3-.2.4-.3L498.7 239c8-5.3 18.5-5.3 26.5 0l254.1 169.1c.1.1.3.2.4.3l1.1.8l1.4 1.1c.3.3.6.6 1 .9c.4.4.8.8 1.2 1.3c.7.8 1.3 1.6 1.8 2.5c.2.4.5.7.7 1.1c.3.5.6 1 .8 1.6c.2.4.4.8.5 1.2c.2.6.4 1.2.6 1.7c.1.4.3.8.4 1.2c.2.7.3 1.3.4 2c.1.3.1.7.2 1c.1 1 .2 2.1.2 3.1zm-254.1 13.3v111.3L723.1 597l-83.6-55.8zM281.8 472.6v79.8l59.8-39.9zM512 456.1l-84.5 56.4l84.5 56.4l84.5-56.4zM723.1 428L535.9 303.4v111.3l103.6 69.1zM384.5 541.2L300.9 597l187.2 124.6V610.3z"
              />
              <defs>
                <linearGradient
                  id={`${id}-gradient`}
                  x1="0"
                  x2="0"
                  y1="-1"
                  y2="0.8"
                >
                  <stop offset="0%" stopColor="#bbb" />
                  <stop offset="100%" stopColor="#555" />
                </linearGradient>
                <filter id={`${id}-inner`}>
                  <feFlood floodColor="#ffffff22" />
                  <feComposite operator="out" in2="SourceGraphic" />
                  <feMorphology operator="dilate" radius="8" />
                  <feGaussianBlur stdDeviation="32" />
                  <feComposite operator="atop" in2="SourceGraphic" />
                </filter>
              </defs>
            </svg>
          </div>
          <div className="luminous-bottom">
            <h3 id={`${id}-title`} className="luminous-title">
              {title}
            </h3>
            <p className="luminous-description">{description}</p>
            <a href={href} className="luminous-service-link">
              Scopri il servizio <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              role="switch"
              aria-checked={lit}
              aria-label={`Illuminazione card ${title}`}
              className="luminous-toggle"
              onClick={() => setLit((value) => !value)}
            >
              <span className="luminous-handle" />
              <span className="luminous-toggle-label">
                {lit ? "Spegni la luce" : "Accendi la luce"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
