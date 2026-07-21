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
  createdAt: string;
  updatedAt: string;
}
