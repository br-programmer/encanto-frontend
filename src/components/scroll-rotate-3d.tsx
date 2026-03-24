"use client";

import { useEffect, useState, useRef } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ScrollRotate3DProps {
  /**
   * Total number of frames in the sequence
   * Images should be named: frame_001.webp, frame_002.webp, etc.
   * Place them in: public/models/bouquet-sequence/
   */
  totalFrames?: number;
  /**
   * Base path for the image sequence
   */
  basePath?: string;
  /**
   * Image format (webp recommended for smaller size)
   */
  imageFormat?: "webp" | "png" | "jpg";
}

// Demo mode with placeholder images from Unsplash (different flower angles)
const DEMO_MODE = true;

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=80",
  "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=80",
  "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80",
  "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80",
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80",
  "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=600&q=80",
  "https://images.unsplash.com/photo-1462275646964-a0e3571f4f5f?w=600&q=80",
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&q=80",
  "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&q=80",
  "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600&q=80",
  "https://images.unsplash.com/photo-1548094990-c16ca90f1f0d?w=600&q=80",
];

export function ScrollRotate3D({
  totalFrames = 36,
  basePath = "/models/bouquet-sequence",
  imageFormat = "webp",
}: ScrollRotate3DProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload images for smooth animation
  useEffect(() => {
    if (DEMO_MODE) {
      // Preload demo images
      const preloadPromises = DEMO_IMAGES.map((src) => {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        });
      });
      Promise.all(preloadPromises).then(() => setImagesLoaded(true));
    } else {
      // Preload sequence images
      const preloadPromises = Array.from({ length: totalFrames }, (_, i) => {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = `${basePath}/frame_${String(i + 1).padStart(3, "0")}.${imageFormat}`;
        });
      });
      Promise.all(preloadPromises).then(() => setImagesLoaded(true));
    }
  }, [totalFrames, basePath, imageFormat]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = sectionRef.current.offsetHeight;

      const start = windowHeight;
      const end = -sectionHeight;
      const current = rect.top;

      const progress = Math.max(0, Math.min(1, (start - current) / (start - end)));
      setScrollProgress(progress);

      // Calculate current frame based on scroll progress
      const frameCount = DEMO_MODE ? DEMO_IMAGES.length : totalFrames;
      const frame = Math.min(Math.floor(progress * frameCount), frameCount - 1);
      setCurrentFrame(frame);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalFrames]);

  // Get current image URL
  const getCurrentImageUrl = () => {
    if (DEMO_MODE) {
      return DEMO_IMAGES[currentFrame] || DEMO_IMAGES[0];
    }
    return `${basePath}/frame_${String(currentFrame + 1).padStart(3, "0")}.${imageFormat}`;
  };

  // Text visibility
  const introOpacity = scrollProgress < 0.15 ? 1 - scrollProgress * 6 : 0;
  const middleOpacity =
    scrollProgress > 0.3 && scrollProgress < 0.7
      ? Math.min((scrollProgress - 0.3) * 5, 1, (0.7 - scrollProgress) * 5)
      : 0;
  const outroOpacity = scrollProgress > 0.8 ? (scrollProgress - 0.8) * 5 : 0;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[300vh] bg-gradient-to-b from-background via-secondary/20 to-background"
    >
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Background glow effect */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl transition-opacity duration-500"
          style={{
            background: "radial-gradient(circle, rgba(170,144,131,0.3) 0%, transparent 70%)",
            opacity: 0.5 + scrollProgress * 0.5,
          }}
        />

        {/* Image Container */}
        <div className="relative z-10 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px]">
          {/* Loading state */}
          {!imagesLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Main rotating image */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden shadow-2xl transition-transform duration-100"
            style={{
              transform: `scale(${0.8 + scrollProgress * 0.3})`,
              boxShadow: `0 25px 80px -20px rgba(0, 0, 0, 0.4), 0 0 60px rgba(170, 144, 131, ${0.2 + scrollProgress * 0.3})`,
              opacity: imagesLoaded ? 1 : 0,
            }}
          >
            <SafeImage
              src={getCurrentImageUrl()}
              alt={`Ramo de flores - Vista ${currentFrame + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, 450px"
              priority
            />
          </div>

          {/* Decorative ring */}
          <div
            className="absolute inset-[-15px] rounded-full border-2 border-primary/20 pointer-events-none"
            style={{
              transform: `rotate(${scrollProgress * 360}deg)`,
            }}
          />

          {/* Frame indicator dots */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
            {Array.from({ length: DEMO_MODE ? DEMO_IMAGES.length : Math.min(totalFrames, 12) }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  i === currentFrame ? "bg-primary scale-125" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Text Overlays */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center px-4 max-w-4xl">
            {/* Intro Text */}
            <div
              className="transition-all duration-300"
              style={{
                opacity: introOpacity,
                transform: `translateY(${(1 - introOpacity) * -30}px)`,
              }}
            >
              <p className="text-primary font-normal text-sm uppercase tracking-[0.3em] mb-4">
                Vista 360°
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground mb-4">
                Cada ángulo es perfecto
              </h2>
              <p className="text-foreground-secondary text-lg">
                Haz scroll para girar el arreglo
              </p>
            </div>

            {/* Middle Text */}
            <div
              className="absolute inset-0 flex items-end justify-center pb-32 transition-all duration-300"
              style={{
                opacity: middleOpacity,
                transform: `translateY(${(1 - middleOpacity) * 20}px)`,
              }}
            >
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground mb-2">
                  Detalle artesanal
                </h3>
                <p className="text-foreground-secondary">
                  Flores frescas seleccionadas cada mañana
                </p>
              </div>
            </div>

            {/* Outro CTA */}
            <div
              className="transition-all duration-300 pointer-events-auto"
              style={{
                opacity: outroOpacity,
                transform: `translateY(${(1 - outroOpacity) * 30}px)`,
              }}
            >
              <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground mb-6">
                Encuentra el tuyo
              </h3>
              <Button size="lg" className="h-14 px-10 rounded-full text-lg" asChild>
                <Link href="/productos">Ver colección completa</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-75"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
          <span className="text-foreground-secondary text-sm font-normal tabular-nums">
            {String(currentFrame + 1).padStart(2, "0")}/{DEMO_MODE ? DEMO_IMAGES.length : totalFrames}
          </span>
        </div>

        {/* Scroll hint */}
        {scrollProgress < 0.1 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-20">
            <svg
              className="w-6 h-6 text-foreground-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
