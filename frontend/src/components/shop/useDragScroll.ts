"use client";

import { useCallback, useEffect, useRef } from "react";

// Lets a mouse click-and-drag the row horizontally like a physical shelf,
// while leaving touch input alone (touch already gets native swipe-scroll
// via overflow-x-auto + snap, and hijacking it here would fight the
// browser's own momentum scrolling). Also swallows the click that would
// otherwise fire on the book the pointer lands on at the end of a drag.
//
// Tracks the drag via window-level mouse listeners rather than
// setPointerCapture: capturing the pointer on the row element retargets
// the browser's subsequent `click` event to the row itself instead of
// whatever book link is under the cursor, which silently breaks
// navigation on desktop while leaving touch (which never captures) fine.
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const state = useRef({ isDown: false, startX: 0, scrollLeft: 0, dragged: false });
  const stopDragRef = useRef<(() => void) | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;

    state.current.isDown = true;
    state.current.dragged = false;
    state.current.startX = e.clientX;
    state.current.scrollLeft = el.scrollLeft;

    function handleMouseMove(moveEvent: MouseEvent) {
      if (!state.current.isDown) return;
      const target = ref.current;
      if (!target) return;
      const dx = moveEvent.clientX - state.current.startX;
      if (Math.abs(dx) > 4) state.current.dragged = true;
      target.scrollLeft = state.current.scrollLeft - dx;
    }

    function handleMouseUp() {
      state.current.isDown = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      stopDragRef.current = null;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    stopDragRef.current = handleMouseUp;
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (state.current.dragged) {
      e.stopPropagation();
      e.preventDefault();
      state.current.dragged = false;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopDragRef.current?.();
    };
  }, []);

  return { ref, onPointerDown, onClickCapture };
}
