'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedText from './AnimatedText';
import { useHeroVisibility } from './layout/HeroVisibilityContext';
import { smoothScrollTo } from '@/lib/smoothScrollTo';

gsap.registerPlugin(ScrollTrigger);

// Address-bar show/hide on mobile browsers fires a `resize`, which by
// default makes ScrollTrigger re-measure every pin on the page mid-scroll -
// this is GSAP's own recommended flag to ignore those non-intentional
// mobile viewport-height jiggles instead of fighting the pin every time.
ScrollTrigger.config({ ignoreMobileResize: true });

// Separate frame sets per device - phones get a lighter, portrait-oriented
// set (~7MB / 262 WebP frames) instead of the desktop landscape set (~12MB /
// 270 frames), which is both heavier and awkwardly cropped on a tall narrow
// viewport. Frames are WebP (q75) rather than the original raw PNGs, which
// were 188MB/122MB respectively and made first load take minutes.
const FRAME_SETS = {
  mobile: { folder: 'new1', count: 262, extension: 'webp' },
  desktop: { folder: 'good', count: 255, extension: 'webp' },
} as const;

// Module-scope, not component state - persists across client-side
// navigations away from and back to "/" within the same page session (a
// full page reload still starts empty). Without this, revisiting the
// homepage re-ran the entire ~250-frame load and progress bar every time,
// even though the browser's own HTTP cache already had the files.
const frameCache: Partial<Record<keyof typeof FRAME_SETS, HTMLImageElement[]>> = {};

function getInitialMatch(query: string): boolean {
  return typeof window !== 'undefined' && window.matchMedia(query).matches;
}

export default function CanvasSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  // Safety net, distinct from reducedMotion (an accessibility preference) -
  // this just means the load gave up, not that the user asked for less motion.
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  // Read synchronously on first render instead of defaulting to false and
  // correcting in an effect - otherwise a phone briefly starts the desktop
  // (unskipped, full-resolution) frame load before the mobile branch takes
  // over a moment later, wasting bandwidth on a load that gets cancelled.
  const [reducedMotion, setReducedMotion] = useState(() => getInitialMatch('(prefers-reduced-motion: reduce)'));
  const [isMobile, setIsMobile] = useState(() => getInitialMatch('(max-width: 768px)'));
  const [showEndText, setShowEndText] = useState(false);
  const frameSet = isMobile ? FRAME_SETS.mobile : FRAME_SETS.desktop;

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrame = useRef(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const endTextShownRef = useRef(false);

  const { setHeaderVisible, setHeroDark } = useHeroVisibility();

  // Desktop: keep the header out of the way while the sequence plays, and
  // reveal it once the sequence nears completion (tied to the same
  // threshold as the welcome text below). Phone: header stays visible the
  // whole time - on a small screen the animation is already the sole focus,
  // and hiding/revealing chrome on top of a heavy scroll-pinned sequence is
  // more disorienting than helpful. useLayoutEffect so the desktop hide
  // commits before the browser paints, avoiding a flash of the header.
  useLayoutEffect(() => {
    if (reducedMotion || isMobile) {
      setHeaderVisible(true);
      return;
    }
    setHeaderVisible(false);
    return () => setHeaderVisible(true);
  }, [reducedMotion, isMobile, setHeaderVisible]);

  useEffect(() => {
    // Initial values already come from the lazy useState initializers above -
    // these listeners only need to react to later changes (e.g. rotating a
    // tablet across the breakpoint, or toggling reduced-motion in OS settings).
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionListener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionListener);

    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const mobileListener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mobileQuery.addEventListener('change', mobileListener);

    return () => {
      motionQuery.removeEventListener('change', motionListener);
      mobileQuery.removeEventListener('change', mobileListener);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setIsLoaded(true);
      return;
    }

    const cacheKey = isMobile ? 'mobile' : 'desktop';
    const cached = frameCache[cacheKey];
    if (cached && cached.length === frameSet.count) {
      imagesRef.current = cached;
      setIsLoaded(true);
      return;
    }

    let cancelled = false;
    setLoadTimedOut(false);

    // Safety net for slow/throttled connections: a real visitor should never
    // be scroll-locked behind the loader indefinitely - give up after 20s and
    // fall back to the same static hero reduced-motion users already get.
    // Generous on purpose: this only exists to bound a genuinely broken
    // connection, not to interrupt a normal (even somewhat slow) load that's
    // still actively making progress.
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      cancelled = true;
      setLoadTimedOut(true);
    }, 20000);

    const loadImages = async () => {
      // No frame-skipping needed anymore - the mobile set is already sized
      // (and compressed) for phones, so it loads every frame in full.
      const frameNumbers: number[] = [];
      for (let i = 1; i <= frameSet.count; i++) frameNumbers.push(i);

      const framesToLoad = frameNumbers.length;
      const images: HTMLImageElement[] = new Array(framesToLoad);
      let loaded = 0;

      const loadOne = (position: number) =>
        new Promise<void>((resolve) => {
          const indexStr = frameNumbers[position].toString().padStart(3, '0');
          const img = new window.Image();
          img.src = `/${frameSet.folder}/ezgif-frame-${indexStr}.${frameSet.extension}`;
          const finish = () => {
            images[position] = img;
            loaded++;
            setLoadingProgress(Math.round((loaded / framesToLoad) * 100));
            resolve();
          };
          img.onload = finish;
          img.onerror = finish; // count and move on rather than stalling the whole sequence
        });

      // Load with bounded concurrency instead of one-at-a-time - the frame
      // set is ~300 large PNGs, and loading them fully sequentially made the
      // "Entering the Library" wait (and the scroll-lock below) far longer
      // than necessary.
      const CONCURRENCY = 12;
      let cursor = 0;
      const worker = async () => {
        while (cursor < framesToLoad) {
          const position = cursor++;
          await loadOne(position);
        }
      };
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, framesToLoad) }, worker));

      if (cancelled) return;
      imagesRef.current = images;
      frameCache[cacheKey] = images;
      window.clearTimeout(timeoutId);
      setIsLoaded(true);
    };

    loadImages();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [reducedMotion, isMobile]);

  // Block scrolling until every frame is loaded, so the pinned scroll
  // sequence below is guaranteed to be the first thing a user can scroll
  // into - otherwise a scroll during the load window skips straight past
  // the hero into the rest of the page before GSAP has even registered it.
  useEffect(() => {
    if (reducedMotion || isLoaded || loadTimedOut) return;

    const { overflow: htmlOverflow } = document.documentElement.style;
    const { overflow: bodyOverflow } = document.body.style;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, [isLoaded, reducedMotion, loadTimedOut]);

  useEffect(() => {
    if (!isLoaded || reducedMotion || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution
    const updateCanvasSize = () => {
      const width = Math.min(window.innerWidth, 1826);
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      renderFrame(currentFrame.current);
    };

    const renderFrame = (index: number) => {
      const img = imagesRef.current[index];
      if (!img) return;

      const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
      const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

      // Cover scaling logic so the image fills the screen
      const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
      const x = (canvasWidth / 2) - (img.width /2) * scale;
      const y = (canvasHeight / 2) - (img.height / 2) * scale;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    // Debounced - mobile browsers fire `resize` repeatedly while the
    // address bar animates in/out during scroll, and redrawing the canvas
    // on every single one of those events is unnecessary jank.
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCanvasSize, 150);
    };

    window.addEventListener('resize', handleResize);
    updateCanvasSize();

    // GSAP ScrollTrigger
    const totalImages = imagesRef.current.length - 1;

    // Welcome text fades in only once the sequence is nearly done playing
    // (last 6% of frames), so it reads as the payoff at the end of the
    // animation rather than competing with it.
    const endTextThreshold = Math.round(totalImages * 0.94);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        // Scroll distance scales with the frame count so the scroll-per-frame
        // pacing stays consistent regardless of how many frames are in the set.
        end: `+=${Math.round((isMobile ? 3000 : 6000) * (frameSet.count / 201))}`,
        // scrub: true (no smoothing lag) instead of a numeric delay - with a
        // delay, a fast scroll to the bottom of the pinned range can release
        // the pin before the eased timeline has actually caught up to the
        // final frame, showing the next section before the sequence finishes.
        scrub: true,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          // Render based on progress
          const frameIndex = Math.floor(self.progress * totalImages);
          if (frameIndex !== currentFrame.current) {
            currentFrame.current = frameIndex;
            requestAnimationFrame(() => renderFrame(frameIndex));

            const shouldShowEndText = frameIndex >= endTextThreshold;
            if (shouldShowEndText !== endTextShownRef.current) {
              endTextShownRef.current = shouldShowEndText;
              setShowEndText(shouldShowEndText);
              // While the welcome text is showing, the header is sitting
              // directly on top of the hero's bright last frame - switch it
              // to a dark variant for contrast (see the IntersectionObserver
              // effect below for when this gets handed back to the normal
              // light header).
              setHeroDark(shouldShowEndText);
              // Header is already visible throughout on mobile (see the
              // useLayoutEffect above) - don't let this fight that by
              // hiding it again before the threshold.
              if (!isMobile) setHeaderVisible(shouldShowEndText);
            }
          }

          // Guarantee the very last frame is painted before the pin can
          // release, even if onUpdate's index check above missed it.
          if (self.progress >= 1 && currentFrame.current !== totalImages) {
            currentFrame.current = totalImages;
            renderFrame(totalImages);
          }
        }
      }
    });

    scrollTriggerRef.current = tl.scrollTrigger ?? null;

    // Force GSAP to recalculate every ScrollTrigger's position now that this
    // pin's spacer has been added asynchronously (after image loading), which
    // pushes every section below it further down the document. Any other
    // GSAP-pinned section that mounts and measures itself before this
    // component's 300 frames finish loading would otherwise cache a "start"
    // position from back when the document was still short, causing it to
    // fire too early. Deferred two frames so the browser has actually laid
    // out the new pin-spacer before ScrollTrigger re-measures everything -
    // calling refresh() synchronously in this same tick reads stale
    // (pre-layout) measurements and doesn't fix anything.
    let refreshFrame = requestAnimationFrame(() => {
      refreshFrame = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelAnimationFrame(refreshFrame);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
      scrollTriggerRef.current = null;
      endTextShownRef.current = false;
      setShowEndText(false);
      setHeroDark(false);
    };
  }, [isLoaded, reducedMotion]);

  // "Skip" control for the pinned scroll sequence - jumps straight to the
  // scroll position where the pin releases (GSAP's own `end`, which already
  // accounts for the pin spacer) instead of making impatient visitors scroll
  // through ~250 frames by hand to reach the rest of the page.
  const handleSkipToEnd = () => {
    const trigger = scrollTriggerRef.current;
    if (!trigger) return;
    smoothScrollTo(trigger.end);
  };

  // The GSAP timeline's onUpdate above only fires while this section is
  // actively pinned/scrubbing - once the pin releases and the hero scrolls
  // fully out of view above the rest of the page, nothing else tells the
  // header to leave dark mode. This watches for that and hands it back to
  // the normal light header once the hero itself is no longer on screen.
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setHeroDark(false);
      },
      { threshold: 0 }
    );
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [setHeroDark]);

  if (reducedMotion || loadTimedOut) {
    return (
      <div className="w-full h-screen relative flex items-center mt-10 justify-center bg-[#F4F3EE]">
        <Image
          src="/hero.png"
          alt="Library"
          fill
          priority
          quality={100}
          style={{
            objectFit: "cover",
          }}
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold text-white text-center">Chapter Book Store</h1>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-paper">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper z-50 text-ink px-4">
          <div className="text-lg sm:text-2xl font-semibold mb-4 text-center">Entering the Library...</div>
          <div className="w-48 sm:w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">{loadingProgress}%</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      {isLoaded && !showEndText && (
        <button
          type="button"
          onClick={handleSkipToEnd}
          aria-label="Skip to end of intro animation"
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/90 hover:text-white transition-colors animate-bounce"
        >
          <span className="text-xs sm:text-sm font-medium drop-shadow-md tracking-wide">Scroll</span>
          <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      {showEndText && (
        <div className="absolute inset-0 top-16 left-4 right-4 md:top-30 md:left-30 md:right-25 pointer-events-none flex flex-col px-6 sm:px-12 md:px-20 pb-32 pt-4 md:pb-12 md:pt-8">
          <div className="flex-1 flex flex-col items-start justify-center">
            <p className="text-white/90 text-base sm:text-lg md:text-xl font-light mb-2 drop-shadow-md">
              <AnimatedText text="Welcome to" />
            </p>

            <h1 className="flex flex-wrap items-center justify-start gap-x-3 text-white text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-5 drop-shadow-2xl">
              {isMobile ? (
                <>
                  <AnimatedText text="Explore Your" />
                  <span className="text-accent">
                    <AnimatedText text="Book" />
                  </span>
                  <AnimatedText text="World" />
                </>
              ) : (
                <>
                  <AnimatedText text="Chapter" />
                  <span className="text-accent">
                    <AnimatedText text="Book" />
                  </span>
                  <AnimatedText text="Store" />
                </>
              )}
            </h1>

            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 sm:w-16 bg-accent/70" />
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              <span className="h-px w-10 sm:w-16 bg-accent/70" />
            </div>

            <p className="text-[#F4F3EE] text-base sm:text-lg md:text-2xl max-w-2xl font-light drop-shadow-md mb-8">
              <AnimatedText
                text={
                  isMobile
                    ? 'Discover stories made for you.'
                    : 'Your library, waiting to be explored. Thousands of books. Infinite stories.'
                }
              />
            </p>

            <div className="pointer-events-auto flex flex-wrap items-center justify-start gap-3 sm:gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-accent text-[#111] font-semibold px-5 sm:px-6 py-3 rounded-full hover:brightness-110 transition-all"
              >
                Explore Books &rarr;
              </Link>
              <Link
                href="/#new-arrivals"
                className="inline-flex items-center gap-2 border border-white/70 text-white font-semibold px-5 sm:px-6 py-3 rounded-full hover:bg-white/10 transition-colors"
              >
                New Arrivals &rarr;
              </Link>
            </div>
          </div>

          <div className="pointer-events-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 sm:px-8 py-4 sm:py-5 max-w-4xl w-full">
            <div className="flex items-center gap-3 text-left">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-accent flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              <div>
                <p className="text-white text-sm font-semibold">Wide Collection</p>
                <p className="text-white/60 text-xs">Books for every reader</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-accent flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-white text-sm font-semibold">Best Quality</p>
                <p className="text-white/60 text-xs">Carefully selected</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-accent flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m9-3.348-9 0"
                />
              </svg>
              <div>
                <p className="text-white text-sm font-semibold">Fast Delivery</p>
                <p className="text-white/60 text-xs">To your doorstep</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-accent flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
                />
              </svg>
              <div>
                <p className="text-white text-sm font-semibold">Loved by Readers</p>
                <p className="text-white/60 text-xs">Join thousands</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
