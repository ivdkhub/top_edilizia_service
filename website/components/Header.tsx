"use client";
import { useEffect, useRef, useState } from "react";
export const navigation = [
  ["Home", "home"],
  ["Chi Siamo", "studio"],
  ["Servizi", "craft"],
  ["Progetti", "gallery"],
  ["Contatti", "consultation"],
];
export function Logo() {
  return (
    <a href="#home" className="logo" aria-label="Top Edilizia Service — Home">
      <img
        src="/media/logo.png"
        alt="Top Edilizia Service SRL"
        width="1500"
        height="1039"
      />
    </a>
  );
}
export default function Header() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const update = () => {
      const hero = document.getElementById("home");
      ref.current?.classList.toggle(
        "solid",
        !!hero && hero.getBoundingClientRect().bottom <= 80,
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header ref={ref} className={`header ${open ? "menu-open" : ""}`}>
      <Logo />
      <nav aria-label="Navigazione principale">
        {navigation.map(([label, id]) => (
          <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
      <a className="button quote" href="#consultation">
        Richiedi preventivo
      </a>
      <button
        className="menu-toggle"
        aria-label={open ? "Chiudi menu" : "Apri menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span />
        <span />
      </button>
    </header>
  );
}
