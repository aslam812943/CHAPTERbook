export type BookRequestStatus = "pending" | "fulfilled" | "rejected";

export interface BookRequest {
  id: string;
  userId: string;
  requesterName: string;
  requesterEmail: string;
  bookTitle: string;
  authorName?: string;
  note?: string;
  status: BookRequestStatus;
  adminNote?: string;
  bookId?: string;
  // Whether the user has viewed this request since it last became fulfilled.
  // Starts true (a fresh request isn't "news" to its own creator) and is
  // flipped false when it transitions to fulfilled, driving the header's
  // notification badge.
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookRequestInput {
  userId: string;
  requesterName: string;
  requesterEmail: string;
  bookTitle: string;
  authorName?: string;
  note?: string;
}
