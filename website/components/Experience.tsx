"use client";
import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "./Header";
import Hero from "./Hero";
import Transformation from "./Transformation";
import Craft from "./Craft";
import Gallery from "./Gallery";
import Estimator from "./Estimator";
import Process from "./Process";
import Stories from "./Stories";
import Consultation from "./Consultation";
import Footer from "./Footer";
import { createSmoothScroll } from "../lib/smooth-scroll";
gsap.registerPlugin(ScrollTrigger);
export default function Experience() {
  useLayoutEffect(() => {
    const smoothScroll = createSmoothScroll();
    const context = gsap.context(() => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) =>
          gsap.from(element, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
          }),
        );
        gsap.from(".craft-card", {
          opacity: 0,
          y: 65,
          stagger: 0.12,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".craft-grid",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
        gsap.utils.toArray<HTMLElement>(".counter").forEach((element) => {
          const value = { amount: 0 };
          gsap.to(value, {
            amount: Number(element.dataset.value),
            duration: 1.65,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".stats",
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
            onUpdate: () => {
              element.textContent = `${Math.round(value.amount)}`;
            },
          });
        });
      } else
        document
          .querySelectorAll<HTMLElement>(".counter")
          .forEach((element) => {
            element.textContent = element.dataset.value || "0";
          });
    });
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
    const onAnchor = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!link) return;
      const target = document.querySelector<HTMLElement>(
        link.getAttribute("href")!,
      );
      if (!target) return;
      event.preventDefault();
      const destination = target.matches('[role="tab"]')
        ? target.closest<HTMLElement>("section") || target
        : target;
      if (target.matches('[role="tab"]')) target.click();
      const pin = ScrollTrigger.getAll().find(
          (trigger) => trigger.trigger === destination && trigger.pin,
        ),
        top = pin
          ? pin.start
          : destination.getBoundingClientRect().top + window.scrollY - 76;
      smoothScroll.scrollTo(
        Math.max(0, top),
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      history.replaceState(null, "", link.getAttribute("href"));
    };
    document.addEventListener("click", onAnchor);
    const onDisclosure = () => ScrollTrigger.refresh();
    document.addEventListener("toggle", onDisclosure, true);
    return () => {
      context.revert();
      smoothScroll.destroy();
      document.removeEventListener("click", onAnchor);
      document.removeEventListener("toggle", onDisclosure, true);
    };
  }, []);
  return (
    <>
      <a href="#transformation" className="skip-link">
        Salta l’introduzione animata
      </a>
      <Header />
      <main>
        <Hero />
        <Transformation />
        <Craft />
        <Gallery />
        <Estimator />
        <Process />
        <Stories />
        <Consultation />
      </main>
      <Footer />
    </>
  );
}
