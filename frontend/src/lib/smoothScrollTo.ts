import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

/**
 * Slower, eased scroll than the browser's native `scrollTo({behavior:
 * "smooth"})` (which is a quick, fixed-speed glide) - used anywhere the
 * scroll itself should read as a deliberate transition rather than a snap.
 */
export function smoothScrollTo(target: number | string | HTMLElement, duration = 3.5): void {
  gsap.to(window, { duration, scrollTo: target, ease: "power2.inOut" });
}
