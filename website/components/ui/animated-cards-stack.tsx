"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
} from "motion/react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const cardVariants = cva("absolute will-change-transform", {
  variants: {
    variant: {
      dark: "flex size-full flex-col items-center justify-center gap-6 rounded-2xl border border-stone-700/50 bg-accent-foreground/80 p-6 backdrop-blur-md",
      light:
        "flex size-full flex-col items-center justify-center gap-6 rounded-2xl border bg-background/80 p-6 backdrop-blur-md",
    },
  },
  defaultVariants: { variant: "light" },
});
interface ReviewProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  maxRating?: number;
}
interface CardStickyProps
  extends HTMLMotionProps<"div">, VariantProps<typeof cardVariants> {
  arrayLength: number;
  index: number;
  incrementY?: number;
  incrementZ?: number;
  incrementRotation?: number;
}
interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>;
  reducedMotion: boolean;
}
const ContainerScrollContext = React.createContext<
  ContainerScrollContextValue | undefined
>(undefined);
function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext);
  if (!context)
    throw new Error("CardTransformed must be used inside ContainerScroll");
  return context;
}
export function ContainerScroll({
  children,
  style,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start center", "end end"],
  });
  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress, reducedMotion }}>
      <div
        ref={scrollRef}
        className={cn("relative min-h-svh w-full", className)}
        style={{ perspective: "1000px", ...style }}
        {...props}
      >
        {children}
      </div>
    </ContainerScrollContext.Provider>
  );
}
export function CardsContainer({
  children,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative", className)}
      style={{ perspective: "1000px", ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
export const CardTransformed = React.forwardRef<
  HTMLDivElement,
  CardStickyProps
>(
  (
    {
      arrayLength,
      index,
      incrementY = 10,
      incrementZ = 10,
      incrementRotation = -index + 90,
      className,
      variant = "light",
      style,
      ...props
    },
    ref,
  ) => {
    const { scrollYProgress, reducedMotion } = useContainerScrollContext();
    const start = index / (arrayLength + 1);
    const end = (index + 1) / (arrayLength + 1);
    const range = React.useMemo(() => [start, end], [start, end]);
    const rotateRange = React.useMemo(
      () => [range[0] - 1.5, range[1] / 1.5],
      [range],
    );
    const y = useTransform(scrollYProgress, range, ["0%", "-180%"]);
    const rotate = useTransform(scrollYProgress, rotateRange, [
      incrementRotation,
      0,
    ]);
    const transform = useMotionTemplate`translateZ(${index * incrementZ}px) translateY(${y}) rotate(${rotate}deg)`;
    const dx = useTransform(scrollYProgress, rotateRange, [4, 0]);
    const dy = useTransform(scrollYProgress, rotateRange, [4, 12]);
    const blur = useTransform(scrollYProgress, rotateRange, [2, 24]);
    const alpha = useTransform(scrollYProgress, rotateRange, [0.15, 0.2]);
    // Keep hook ordering stable when the card variant changes.
    const shadow = useMotionTemplate`drop-shadow(${dx}px ${dy}px ${blur}px rgba(0,0,0,${alpha}))`;
    return (
      <motion.div
        ref={ref}
        style={{
          top: reducedMotion ? undefined : index * incrementY,
          transform: reducedMotion ? "none" : transform,
          backfaceVisibility: "hidden",
          zIndex: (arrayLength - index) * incrementZ,
          filter: !reducedMotion && variant === "light" ? shadow : "none",
          ...style,
        }}
        className={cn(cardVariants({ variant, className }))}
        {...props}
      />
    );
  },
);
CardTransformed.displayName = "CardTransformed";
export const ReviewStars = React.forwardRef<HTMLDivElement, ReviewProps>(
  ({ rating, maxRating = 5, className, ...props }, ref) => {
    const count = Math.max(1, Math.floor(maxRating));
    const score = Math.max(0, Math.min(count, rating));
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        aria-label={`${score} / ${count}`}
        {...props}
      >
        <div className="flex items-center" aria-hidden="true">
          {Array.from({ length: count }, (_, index) => {
            const filled = Math.max(0, Math.min(1, score - index));
            return (
              <span className="relative inline-flex" key={index}>
                <Star
                  className="size-4 text-gray-300"
                  fill="currentColor"
                  strokeWidth={0}
                />
                <Star
                  className="absolute inset-0 size-4 text-inherit"
                  fill="currentColor"
                  strokeWidth={0}
                  style={{ clipPath: `inset(0 ${(1 - filled) * 100}% 0 0)` }}
                />
              </span>
            );
          })}
        </div>
      </div>
    );
  },
);
ReviewStars.displayName = "ReviewStars";
