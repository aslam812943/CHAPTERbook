'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface HeroVisibilityContextValue {
  headerVisible: boolean;
  setHeaderVisible: (visible: boolean) => void;
  // True while the header is overlaid directly on the hero's last frame
  // (the "welcome" moment), where the standard light/glass header has poor
  // contrast against a bright photo - lets the header switch to a dark
  // variant just for that window, then hand back to the normal light
  // header once the hero has scrolled out of view.
  heroDark: boolean;
  setHeroDark: (dark: boolean) => void;
}

// Lets a hero-style scroll animation (currently only CanvasSequence on the
// homepage) hide the fixed site header while it plays, then hand it back
// once the sequence finishes. Pages that never touch this (everything but
// "/") just see the default `true` and the header behaves as always.
const HeroVisibilityContext = createContext<HeroVisibilityContextValue>({
  headerVisible: true,
  setHeaderVisible: () => {},
  heroDark: false,
  setHeroDark: () => {},
});

export function HeroVisibilityProvider({ children }: { children: ReactNode }) {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [heroDark, setHeroDark] = useState(false);
  return (
    <HeroVisibilityContext.Provider value={{ headerVisible, setHeaderVisible, heroDark, setHeroDark }}>
      {children}
    </HeroVisibilityContext.Provider>
  );
}

export function useHeroVisibility() {
  return useContext(HeroVisibilityContext);
}
