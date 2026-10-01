"use client";
import { useState } from "react";
import { Quote, X } from "lucide-react";
import { reviews } from "../lib/company";
import {
  CardTransformed,
  CardsContainer,
  ContainerScroll,
} from "@/components/ui/animated-cards-stack";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";
export default function Stories() {
  const [filter, setFilter] = useState("Tutte (4)");
  const [selected, setSelected] = useState<(typeof reviews)[number] | null>(
    null,
  );
  const visible = reviews.filter(
    (review) => filter.startsWith("Tutte") || review.category === filter,
  );
  return (
    <section id="stories" className="section stories stories-stack">
      <div className="testimonials-heading reveal">
        <p className="eyebrow">Le testimonianze</p>
        <h2>La fiducia dei nostri clienti</h2>
        <p className="testimonials-intro">
          Le opinioni dei nostri clienti raccontano il valore del nostro lavoro
          e l’attenzione che mettiamo in ogni progetto. La loro soddisfazione è
          per noi il risultato più importante.
        </p>
      </div>
      <div className="story-filters" aria-label="Filtra le testimonianze">
        {["Tutte (4)", "Ristrutturazioni", "Professionalità"].map((text) => (
          <button
            key={text}
            aria-pressed={filter === text}
            className={filter === text ? "active" : ""}
            onClick={() => setFilter(text)}
          >
            {text}
          </button>
        ))}
      </div>
      <ContainerScroll className="testimonials-scroll">
        <div className="testimonials-sticky">
          <CardsContainer className="testimonials-cards" key={filter}>
            {visible.map((review, index) => (
              <CardTransformed
                key={review.name}
                arrayLength={visible.length}
                index={index + 2}
                variant="light"
                className="testimonial-stack-card"
                role="article"
                aria-labelledby={`review-${review.initials}-name`}
                aria-describedby={`review-${review.initials}-excerpt`}
              >
                <Quote
                  className="testimonial-quote-icon"
                  aria-hidden="true"
                  strokeWidth={1.4}
                />
                <p className="testimonial-category">{review.category}</p>
                <blockquote id={`review-${review.initials}-excerpt`}>
                  “{review.excerpt}”
                </blockquote>
                <div className="testimonial-author">
                  <Avatar className="testimonial-avatar">
                    <AvatarFallback>{review.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <strong id={`review-${review.initials}-name`}>
                      {review.name}
                    </strong>
                    <span>Cliente · Top Edilizia Service</span>
                  </div>
                </div>
                <button
                  className="testimonial-read"
                  onClick={() => setSelected(review)}
                  aria-label={`Leggi la testimonianza di ${review.name}`}
                >
                  Leggi la testimonianza
                </button>
              </CardTransformed>
            ))}
          </CardsContainer>
          <p className="testimonials-scroll-hint">
            Scorri per leggere le testimonianze
          </p>
        </div>
      </ContainerScroll>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="testimonial-dialog" showCloseButton={false}>
          <button
            className="dialog-close"
            aria-label="Chiudi testimonianza"
            onClick={() => setSelected(null)}
          >
            <X size={20} aria-hidden="true" />
          </button>
          <p className="eyebrow">Le testimonianze</p>
          <DialogTitle asChild>
            <h2>{selected?.name}</h2>
          </DialogTitle>
          <DialogDescription>
            {selected?.category} · Cliente Top Edilizia Service
          </DialogDescription>
          <blockquote>{selected?.quote}</blockquote>
        </DialogContent>
      </Dialog>
    </section>
  );
}
