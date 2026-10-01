"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GalleryPhoto {
  id: string | number;
  image: string;
  alt?: string;
}
export interface InteractiveFolderGalleryProps {
  photos?: GalleryPhoto[];
  folderName?: string;
  dragHintText?: string;
  className?: string;
  onPhotoSelect?: (id: string | number) => void;
}
export function InteractiveFolderGallery({
  photos = [],
  folderName = "I nostri progetti",
  dragHintText = "Trascina una foto verso il basso per chiudere",
  className,
  onPhotoSelect,
}: InteractiveFolderGalleryProps) {
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [hoverFolder, setHoverFolder] = useState(false);
  const [width, setWidth] = useState(900);
  const stage = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!stage.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);
  const close = () => {
    setIsFolderOpen(false);
    setHoverFolder(false);
  };
  const count = photos.length;
  const gap = Math.min(
    130,
    Math.max(28, (width - (width < 540 ? 180 : 260)) / Math.max(1, count - 1)),
  );
  return (
    <div
      className={cn("folder-gallery", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <div className="folder-stage" ref={stage}>
        <div className="folder-object">
          <motion.div
            className="folder-back"
            animate={{
              opacity: isFolderOpen ? 0 : 1,
              scale: isFolderOpen ? 0.9 : 1,
            }}
          >
            <div className="folder-tab" />
            <div className="folder-back-body" />
          </motion.div>
          <div className="folder-photos">
            {photos.map((photo, i) => {
              const offset = i - (count - 1) / 2;
              const openScale = width < 540 ? 0.9 : 1.05;
              return (
                <motion.div
                  key={photo.id}
                  className={cn("folder-photo", isFolderOpen && "is-open")}
                  drag={isFolderOpen && !reduced}
                  dragSnapToOrigin
                  onDragStart={() => {
                    dragged.current = true;
                  }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 100) close();
                  }}
                  animate={
                    isFolderOpen
                      ? {
                          y: -130,
                          x: offset * gap,
                          rotate: 0,
                          scale: openScale,
                          zIndex: 50,
                        }
                      : {
                          y: hoverFolder ? offset * -10 - 40 : offset * -5,
                          x: hoverFolder
                            ? offset * Math.min(30, gap)
                            : offset * 3,
                          rotate: hoverFolder ? offset * 8 : offset * 3,
                          scale: 1 - Math.abs(offset) * 0.03,
                          zIndex: i + 10,
                        }
                  }
                  whileHover={
                    isFolderOpen ? { scale: openScale + 0.05, zIndex: 100 } : {}
                  }
                  whileDrag={{ scale: openScale + 0.1, rotate: 5, zIndex: 150 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 350, damping: 30 }
                  }
                >
                  <img
                    src={photo.image}
                    alt={photo.alt || "Progetto Top Edilizia Service"}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                  {onPhotoSelect && (
                    <button
                      className="folder-open-photo"
                      tabIndex={isFolderOpen ? 0 : -1}
                      aria-hidden={!isFolderOpen}
                      onPointerDown={() => {
                        dragged.current = false;
                      }}
                      onClick={() => {
                        if (!dragged.current) onPhotoSelect(photo.id);
                      }}
                      aria-label={`Ingrandisci foto ${i + 1}`}
                    >
                      <ZoomIn size={18} aria-hidden="true" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
          <motion.button
            type="button"
            className="folder-front"
            aria-label={`Apri cartella ${folderName}`}
            aria-expanded={isFolderOpen}
            tabIndex={isFolderOpen ? -1 : 0}
            animate={{
              opacity: isFolderOpen ? 0 : 1,
              rotateX: hoverFolder ? -25 : 0,
              y: hoverFolder ? 10 : 0,
            }}
            style={{ pointerEvents: isFolderOpen ? "none" : "auto" }}
            onMouseEnter={() => setHoverFolder(true)}
            onMouseLeave={() => setHoverFolder(false)}
            onClick={() => setIsFolderOpen(true)}
          >
            <span>{folderName}</span>
          </motion.button>
        </div>
        <motion.p
          className="folder-hint"
          aria-hidden={!isFolderOpen}
          animate={{ opacity: isFolderOpen ? 1 : 0, y: isFolderOpen ? 0 : 50 }}
          transition={{ duration: reduced ? 0 : 0.3 }}
        >
          {dragHintText}
        </motion.p>
      </div>
      {isFolderOpen && (
        <div className="folder-toolbar">
          {onPhotoSelect && (
            <div className="folder-mobile-photos">
              <span>Apri foto:</span>
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  aria-label={`Visualizza foto ${index + 1} della cartella`}
                  onClick={() => onPhotoSelect(photo.id)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
          <button type="button" onClick={close}>
            Chiudi cartella
          </button>
        </div>
      )}
    </div>
  );
}
export { InteractiveFolderGallery as Component };
