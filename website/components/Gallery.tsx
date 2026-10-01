"use client";
import { useState } from "react";
import { InteractiveFolderGallery } from "./ui/interactive-folder-gallery";
import { gallery, featured } from "../lib/company";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
export default function Gallery() {
  const [selected, setSelected] = useState<number | null>(null),
    [overview, setOverview] = useState(false);
  const close = () => {
    setSelected(null);
    setOverview(false);
  };
  return (
    <>
      <section id="gallery" className="gallery folder-portfolio">
        <div className="gallery-heading">
          <div>
            <p className="eyebrow">Il nostro portfolio</p>
            <h2>I nostri progetti prendono forma</h2>
          </div>
          <button
            className="text-link gallery-all"
            onClick={() => setOverview(true)}
          >
            Tutte le foto ({gallery.length}) <span>↗</span>
          </button>
        </div>
        <InteractiveFolderGallery
          photos={featured
            .slice(0, 5)
            .map((index) => ({
              id: index,
              image: gallery[index].image,
              alt: gallery[index].alt,
            }))}
          folderName="Top Edilizia Service · Progetti"
          onPhotoSelect={(id) => setSelected(Number(id))}
        />
      </section>
      <Dialog
        open={selected !== null || overview}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent
          className={`estate-dialog ${overview ? "photo-archive" : ""}`}
          showCloseButton={false}
        >
          <button
            className="dialog-close"
            aria-label="Chiudi galleria"
            onClick={close}
          >
            ×
          </button>
          {overview ? (
            <>
              <DialogTitle asChild>
                <h2>La galleria dei nostri lavori</h2>
              </DialogTitle>
              <DialogDescription>
                {gallery.length} fotografie di costruzioni, ristrutturazioni e
                restauri.
              </DialogDescription>
              <div className="photo-grid">
                {gallery.map((photo, i) => (
                  <button
                    key={photo.image}
                    onClick={() => {
                      setOverview(false);
                      setSelected(i);
                    }}
                    aria-label={`Apri foto ${i + 1}`}
                  >
                    <img
                      src={photo.image}
                      width={photo.width}
                      height={photo.height}
                      alt={photo.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            </>
          ) : selected !== null ? (
            <>
              <div className="estate-dialog-video">
                <img
                  className="company-image detail-image"
                  src={gallery[selected].image}
                  width={gallery[selected].width}
                  height={gallery[selected].height}
                  alt={gallery[selected].alt}
                />
              </div>
              <p className="eyebrow">{gallery[selected].category}</p>
              <DialogTitle asChild>
                <h2>Il nostro lavoro, da vicino</h2>
              </DialogTitle>
              <DialogDescription>
                Una selezione di interventi realizzati da Top Edilizia Service,
                con cura dei dettagli e attenzione alla qualità.
              </DialogDescription>
              <div className="photo-controls">
                <button
                  aria-label="Foto precedente"
                  onClick={() =>
                    setSelected(
                      (selected + gallery.length - 1) % gallery.length,
                    )
                  }
                >
                  ←
                </button>
                <span>
                  Foto {selected + 1} / {gallery.length}
                </span>
                <button
                  aria-label="Foto successiva"
                  onClick={() => setSelected((selected + 1) % gallery.length)}
                >
                  →
                </button>
                <button onClick={() => setOverview(true)}>Tutte le foto</button>
              </div>
              <a href="#consultation" className="button" onClick={close}>
                Parliamo del tuo progetto →
              </a>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
