"use client";

import { Book } from "@/types/book";
import BookSpine from "@/components/shop/BookSpine";

interface BookMarqueeProps {
  books: Book[];
  direction?: "left" | "right";
}

// A showcase marquee (not a browsing shelf - no drag/arrows) that loops
// continuously. The track renders the book list twice back to back and
// animates exactly one set-width, so the loop point is invisible; pausing
// on hover (via the CSS below) gives a moment to actually click a book
// instead of chasing a moving target. `direction="right"` plays the same
// keyframes backwards (CSS animation-direction: reverse) rather than
// needing a second set of keyframes.
export default function BookMarquee({ books, direction = "left" }: BookMarqueeProps) {
  const durationSeconds = books.length * 4.5;

  return (
    <div className="overflow-hidden">
      <div
        className="marquee-track flex items-end gap-6 sm:gap-8 w-max"
        style={{
          animationDuration: `${durationSeconds}s`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {books.map((book) => (
          <BookSpine key={book.id} book={book} />
        ))}
        {/* Second copy is purely visual, so the CSS loop (animates exactly
            one set-width) has no seam - inert keeps it out of the tab order
            and accessibility tree so keyboard/screen-reader users don't hit
            every book twice. */}
        <div className="flex items-end gap-6 sm:gap-8" inert aria-hidden="true">
          {books.map((book) => (
            <BookSpine key={`${book.id}-duplicate`} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}
