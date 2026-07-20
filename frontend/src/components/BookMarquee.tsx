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
  const track = [...books, ...books];
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
        {track.map((book, i) => (
          <BookSpine key={`${book.id}-${i}`} book={book} />
        ))}
      </div>
    </div>
  );
}
