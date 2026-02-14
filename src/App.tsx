import { useRef, useState, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "motion/react";
import type { MotionValue } from "motion/react";
import { usePhotos } from "./hooks/usePhotos";
import type { Photo } from "./hooks/usePhotos";
import { AdminPanel } from "./components/AdminPanel";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/* ── Mobile detection via useSyncExternalStore ────────────────────────── */
const mobileQuery = "(max-width: 768px)";
function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia(mobileQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getSnapshotMobile() {
  return window.matchMedia(mobileQuery).matches;
}
function getServerSnapshotMobile() {
  return false;
}
function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    getSnapshotMobile,
    getServerSnapshotMobile,
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Floating Hearts ────────────────────────────────────────────────── */
function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: `${seededRandom(i + 1) * 100}%`,
        size: 10 + seededRandom(i + 50) * 18,
        opacity: 0.08 + seededRandom(i + 100) * 0.15,
        duration: `${6 + seededRandom(i + 150) * 8}s`,
        delay: `${seededRandom(i + 200) * 6}s`,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute animate-heart-float"
          style={{
            left: h.left,
            bottom: "-20px",
            fontSize: `${h.size}px`,
            opacity: h.opacity,
            animationDuration: h.duration,
            animationDelay: h.delay,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

/* ── Scroll Progress Bar ────────────────────────────────────────────── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed left-0 top-0 z-50 h-full w-[2px] origin-top bg-drift-rose/60"
      style={{ scaleY: scrollYProgress }}
    />
  );
}

/* ── Projector Reel SVG ─────────────────────────────────────────────── */
function ProjectorReel({ rotation }: { rotation: MotionValue<number> }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="h-20 w-20 sm:h-28 sm:w-28 text-white/20"
      style={{ rotate: rotation }}
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <circle
        cx="50"
        cy="50"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 12 * Math.cos(rad);
        const y1 = 50 + 12 * Math.sin(rad);
        const x2 = 50 + 38 * Math.cos(rad);
        const y2 = 50 + 38 * Math.sin(rad);
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.5"
          />
        );
      })}
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = ((angle + 30) * Math.PI) / 180;
        const cx = 50 + 26 * Math.cos(rad);
        const cy = 50 + 26 * Math.sin(rad);
        return (
          <circle
            key={`hole-${angle}`}
            cx={cx}
            cy={cy}
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        );
      })}
    </motion.svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 1 — HERO
   ═══════════════════════════════════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-drift-bg px-4">
      {/* Radial gradient overlays */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 60% 50% at 20% 50%, oklch(80% 0.12 350 / 0.12), transparent)",
            "radial-gradient(ellipse 50% 60% at 80% 30%, oklch(85% 0.08 10 / 0.10), transparent)",
            "radial-gradient(ellipse 70% 40% at 50% 80%, oklch(82% 0.10 340 / 0.08), transparent)",
          ].join(", "),
        }}
      />

      {/* Decorative heart */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
        className="mb-6 text-4xl text-drift-rose/60"
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
        className="relative z-10 text-center font-display text-5xl italic text-drift-text sm:text-7xl md:text-8xl"
      >
        Nasza Historia
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.8 }}
        className="relative z-10 mt-4 font-serif text-lg italic text-drift-text/60 sm:text-xl"
      >
        sierpień 2023 — luty 2026
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-10 flex flex-col items-center gap-2"
      >
        <span className="font-serif text-sm italic text-drift-text/40">
          przewiń w dół
        </span>
        <motion.svg
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-drift-text/40"
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 2 — POLAROID GALLERY
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Red Thread SVG ─────────────────────────────────────────────────── */
function RedThread({
  count,
  scrollYProgress,
}: {
  count: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const segmentH = 85;
  const viewBoxHeight = count * segmentH;
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const pathD = useMemo(() => {
    let d = `M 50 0`;
    for (let i = 0; i < count; i++) {
      const yStart = i * segmentH;
      const direction = i % 2 === 0 ? 1 : -1;
      const cpX = 50 + direction * 35;
      const midY = yStart + segmentH / 2;
      const endY = yStart + segmentH;
      d += ` C ${cpX} ${midY}, ${100 - cpX} ${midY}, 50 ${endY}`;
    }
    return d;
  }, [count]);

  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
      viewBox={`0 0 100 ${viewBoxHeight}`}
      style={{ width: "100px", height: "100%" }}
      preserveAspectRatio="none"
      fill="none"
    >
      <motion.path
        d={pathD}
        stroke="var(--color-drift-rose)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        style={{ pathLength }}
      />
    </svg>
  );
}

/* ── Single Polaroid Card ───────────────────────────────────────────── */
const cardVariants = {
  hidden: (custom: { rotation: number }) => ({
    opacity: 0,
    scale: 0.8,
    rotate: custom.rotation,
  }),
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 20 },
  },
};

const textContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const textChildVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 20 },
  },
};

function PolaroidCard({ photo, index }: { photo: Photo; index: number }) {
  const rotation = (seededRandom(index + 500) - 0.5) * 16; // ±8°
  const xOffset = (seededRandom(index + 600) - 0.5) * 120; // alternate left/right

  return (
    <div
      className="flex min-h-[85vh] items-center justify-center"
      style={{ paddingLeft: `${xOffset}px` }}
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          custom={{ rotation }}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="cursor-pointer bg-white shadow-lg hover:shadow-xl"
          style={{ padding: "12px 12px 48px 12px" }}
        >
          <img
            src={photo.src}
            alt={photo.message}
            className="max-w-[280px] object-cover sm:max-w-[320px] md:max-w-[400px]"
            style={{
              aspectRatio: "4/5",
              filter: "sepia(0.08) saturate(1.1)",
            }}
            loading="lazy"
          />
        </motion.div>

        <motion.div
          variants={textContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="flex flex-col items-center gap-1 text-center"
        >
          <motion.span
            variants={textChildVariants}
            className="font-handwriting text-lg text-drift-gold"
          >
            {photo.date}
          </motion.span>
          <motion.p
            variants={textChildVariants}
            className="max-w-xs font-serif text-base italic text-drift-text"
          >
            {photo.message}
          </motion.p>
          {photo.added_by && photo.added_by !== "system" && (
            <motion.span
              variants={textChildVariants}
              className="font-typewriter text-xs text-drift-text/30"
            >
              dodane przez {photo.added_by}
            </motion.span>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function PolaroidSection({ photos }: { photos: Photo[] }) {
  const polaroidRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: polaroidRef });

  return (
    <section ref={polaroidRef} className="relative bg-drift-bg">
      <RedThread
        count={photos.length}
        scrollYProgress={scrollYProgress}
      />
      {photos.map((photo, i) => (
        <PolaroidCard key={photo.id ?? i} photo={photo} index={i} />
      ))}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 3 — TRANSITION
   ═══════════════════════════════════════════════════════════════════════ */

function TransitionSection() {
  return (
    <section
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4"
      style={{
        background:
          "linear-gradient(to bottom, var(--color-drift-bg), var(--color-film-strip))",
      }}
    >
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="text-center font-serif text-2xl italic text-white/70 sm:text-3xl"
      >
        To dopiero początek naszego filmu...
      </motion.p>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.3 }}
        className="h-[1px] w-32 bg-white/20"
      />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 4 — FILM REEL (Horizontal Scroll-Jacked)
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Film Grain Overlay ─────────────────────────────────────────────── */
function FilmGrainOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 animate-film-grain opacity-[0.03]">
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}

/* ── Sprocket Holes ─────────────────────────────────────────────────── */
function SprocketRow({ position }: { position: "top" | "bottom" }) {
  const holes = Array.from({ length: 80 }, (_, i) => i);
  return (
    <div
      className={`absolute left-0 z-20 flex w-[8000px] gap-[60px] ${
        position === "top" ? "top-2" : "bottom-2"
      }`}
    >
      {holes.map((i) => (
        <div
          key={i}
          className="h-3 w-5 flex-shrink-0 rounded-sm bg-film-sprocket/80"
        />
      ))}
    </div>
  );
}

/* ── Film Photo Frame ───────────────────────────────────────────────── */
function FilmFrame({
  photo,
  index,
  photoWidth,
  stripProgress,
  viewportWidth,
  totalPhotos,
}: {
  photo: Photo;
  index: number;
  photoWidth: number;
  stripProgress: number;
  viewportWidth: number;
  totalPhotos: number;
}) {
  const gap = 24;
  const frameLeft = index * (photoWidth + gap) + 40;
  const frameCenter = frameLeft + photoWidth / 2;
  const viewportCenter = viewportWidth / 2;

  const totalStripWidth =
    totalPhotos * (photoWidth + gap) - gap + 80;
  const maxTranslate = totalStripWidth - viewportWidth;
  const currentTranslate = stripProgress * Math.max(0, maxTranslate);

  const screenCenter = frameCenter - currentTranslate;
  const distFromCenter = Math.abs(screenCenter - viewportCenter);
  const maxDist = viewportWidth / 2;
  const normalizedDist = Math.min(distFromCenter / maxDist, 1);

  const sepia = normalizedDist;
  const contrast = 0.8 + 0.2 * (1 - normalizedDist);
  const brightness = 0.9 + 0.1 * (1 - normalizedDist);

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: `${photoWidth}px` }}
    >
      <div className="overflow-hidden border-4 border-white/90 bg-white/10 shadow-lg">
        <img
          src={photo.src}
          alt={photo.message}
          className="h-full w-full object-cover"
          style={{
            aspectRatio: "3/4",
            filter: `sepia(${sepia}) contrast(${contrast}) brightness(${brightness})`,
          }}
          loading="lazy"
        />
      </div>
    </div>
  );
}

/* ── Main Film Section ──────────────────────────────────────────────── */
function FilmReelSection({ photos }: { photos: Photo[] }) {
  const isMobile = useIsMobile();
  const filmRef = useRef<HTMLDivElement>(null);
  const photoWidth = isMobile ? 200 : 300;
  const gap = 24;
  const padding = 40;
  const totalStripWidth =
    photos.length * (photoWidth + gap) - gap + padding * 2;

  const sectionHeight = photos.length * 80; // 80vh per photo

  const { scrollYProgress } = useScroll({
    target: filmRef,
    offset: ["start start", "end end"],
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [stripProgress, setStripProgress] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  const translateX = useTransform(scrollYProgress, (v: number) => {
    const maxT = totalStripWidth - viewportWidth;
    return -(v * Math.max(0, maxT));
  });

  const reelRotation = useTransform(scrollYProgress, [0, 1], [0, 1080]);

  useMotionValueEvent(scrollYProgress, "change", (v: number) => {
    setStripProgress(v);
    const newIndex = Math.min(
      Math.round(v * (photos.length - 1)),
      photos.length - 1,
    );
    setActiveIndex((prev) => (prev !== newIndex ? newIndex : prev));
  });

  // Track viewport width
  useEffect(() => {
    const handler = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <section ref={filmRef} style={{ height: `${sectionHeight}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Sky area — 25vh */}
        <div
          className="relative flex items-center justify-between px-6 sm:px-12"
          style={{
            height: "25vh",
            background:
              "linear-gradient(to bottom, var(--color-film-sky-from), var(--color-film-sky-to))",
          }}
        >
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="font-display text-4xl italic text-drift-text sm:text-5xl md:text-6xl"
          >
            Nasz Film
          </motion.h2>
          <ProjectorReel rotation={reelRotation} />
        </div>

        {/* Film strip — 45vh */}
        <div
          className="relative overflow-hidden bg-film-strip"
          style={{ height: "45vh" }}
        >
          <FilmGrainOverlay />
          <SprocketRow position="top" />
          <SprocketRow position="bottom" />

          <motion.div
            className="absolute inset-y-0 flex items-center gap-6 px-10"
            style={{
              x: translateX,
              willChange: "transform",
            }}
          >
            {photos.map((photo, i) => (
              <FilmFrame
                key={photo.id ?? i}
                photo={photo}
                index={i}
                photoWidth={photoWidth}
                stripProgress={stripProgress}
                viewportWidth={viewportWidth}
                totalPhotos={photos.length}
              />
            ))}
          </motion.div>
        </div>

        {/* Indicators — 2vh */}
        <div
          className="flex items-center justify-center gap-2 bg-film-strip"
          style={{ height: "2vh" }}
        >
          {photos.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === activeIndex
                  ? "bg-white/90 scale-125"
                  : "bg-white/30"
              }`}
              style={{
                transition: "background-color 0.3s, transform 0.3s",
              }}
            />
          ))}
        </div>

        {/* Caption area — 28vh */}
        <div
          className="flex flex-col items-center justify-center bg-film-cream px-6"
          style={{ height: "28vh" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <span className="font-typewriter text-sm tracking-widest text-film-stamp uppercase">
                {photos[activeIndex]?.date}
              </span>
              <p className="max-w-md font-serif text-lg italic text-warm-text sm:text-xl">
                {photos[activeIndex]?.message}
              </p>
              {photos[activeIndex]?.added_by && photos[activeIndex]?.added_by !== "system" && (
                <span className="font-typewriter text-xs text-warm-text-muted/50">
                  dodane przez {photos[activeIndex]?.added_by}
                </span>
              )}
              <span className="font-typewriter text-xs text-warm-text-muted">
                {activeIndex + 1} / {photos.length}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 5 — FINALE
   ═══════════════════════════════════════════════════════════════════════ */

function FinaleSection() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-8 bg-drift-bg px-4">
      {/* Pulsing heart — CSS animation only */}
      <div className="animate-heart-pulse text-6xl text-pink-heart sm:text-7xl">
        ♥
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="text-center font-display text-4xl italic text-drift-text sm:text-5xl md:text-6xl"
      >
        Wszystkiego najlepszego
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.3 }}
        className="text-center font-display text-3xl italic text-pink-heart sm:text-4xl"
      >
        z okazji Walentynek
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.6 }}
        className="text-center font-serif text-lg italic text-drift-text/80"
      >
        Każda chwila z Tobą jest skarbem
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 1 }}
        className="font-handwriting text-2xl text-drift-gold"
      >
        — z całego serca ♥
      </motion.p>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════════════════ */

export default function App() {
  const { polaroidPhotos, filmPhotos, loading, refetch } = usePhotos();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-drift-bg">
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl text-pink-heart"
        >
          ♥
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <FloatingHearts />
      <ScrollProgress />
      <HeroSection />
      <PolaroidSection photos={polaroidPhotos} />
      <TransitionSection />
      <FilmReelSection photos={filmPhotos} />
      <FinaleSection />
      <AdminPanel onPhotosChange={refetch} />
    </div>
  );
}
