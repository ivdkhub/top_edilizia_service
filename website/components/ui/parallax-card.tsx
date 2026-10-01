"use client";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { ReactNode, PointerEvent } from "react";

// Same entrance and magnetic tilt used by Beauty Dreamer; MotionValues avoid
// React updates for every pointer movement.
export function ParallaxCard({
  children,
  delay = 0,
  className = "",
  entrance = true,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  entrance?: boolean;
  as?: "div" | "span";
}) {
  const reduced = useReducedMotion();
  const rx = useMotionValue(0),
    ry = useMotionValue(0);
  const tx = useMotionValue(0),
    ty = useMotionValue(0);
  const spring = { stiffness: 200, damping: 28 };
  const rotateX = useSpring(rx, spring),
    rotateY = useSpring(ry, spring);
  const x = useSpring(tx, spring),
    y = useSpring(ty, spring);
  const Container = as === "span" ? motion.span : motion.div;
  return (
    <Container
      className={`faq-parallax ${className}`.trim()}
      initial={
        reduced || !entrance ? false : { opacity: 0, y: 45, scale: 0.97 }
      }
      whileInView={entrance ? { opacity: 1, y: 0, scale: 1 } : undefined}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: reduced ? 0 : 1.2,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      onPointerMove={(event: PointerEvent<HTMLElement>) => {
        if (reduced || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        const px =
          (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const py =
          (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        rx.set(-py * 4);
        ry.set(px * 4);
        tx.set(px * 4);
        ty.set(py * 4);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
        tx.set(0);
        ty.set(0);
      }}
    >
      <Container style={{ rotateX, rotateY, x, y, transformPerspective: 1000 }}>
        {children}
      </Container>
    </Container>
  );
}
