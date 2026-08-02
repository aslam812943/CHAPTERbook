"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

// The full `motion` component bundles every framer-motion feature (drag,
// gestures, layout, exit animations) into each component instance. None of
// this app's animations use drag, so `domAnimation` (animations, exit
// animations via AnimatePresence, layout animation) is enough - paired with
// the lighter `m` component instead of `motion` everywhere, this is
// framer-motion's own documented way to cut its runtime bundle cost.
// `strict` throws if any descendant still imports the full `motion`
// component instead of `m`, so a future regression fails loudly in dev
// rather than silently re-inflating the bundle.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
