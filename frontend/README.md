# Chapter Book Store Scrollytelling Homepage

This is a complete, production-ready scrollytelling homepage built with Next.js 14, Tailwind CSS, Framer Motion, and GSAP.

## Getting Started

1. Navigate to this directory.
2. If dependencies are not installed, run:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Customizing Content

Search for `// TODO: replace with real data` inside the components to swap in your real database content:

- `components/GenreSection.tsx`: Update the `GENRES` and `BOOKS` arrays.
- `components/AuthorSpotlight.tsx`: Update the `AUTHORS` array.
- `components/ReaderVoices.tsx`: Update the `VOICES` array.
- `components/CtaSection.tsx`: Update the button link to match your actual `/shop` route if needed.

## Architecture & Performance

- **Canvas Sequence**: `components/CanvasSequence.tsx` handles the 192-frame image scrub using GSAP ScrollTrigger and a `<canvas>` element for maximum performance. Images are preloaded with a progress bar before the sequence begins.
- **Accessibility/Mobile**: On screens `< 768px`, only every 3rd frame is loaded to save bandwidth and CPU. For users with `prefers-reduced-motion` enabled, the sequence falls back to a static image and disables the scroll animations.
