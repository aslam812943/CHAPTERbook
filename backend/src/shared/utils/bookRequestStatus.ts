import { BookRequestStatus } from "../../domain/entities/BookRequest";

export const ALLOWED_BOOK_REQUEST_STATUS_TRANSITIONS: Record<BookRequestStatus, BookRequestStatus[]> = {
  pending: ["fulfilled", "rejected"],
  fulfilled: [],
  rejected: [],
};

export function isValidBookRequestStatusTransition(from: BookRequestStatus, to: BookRequestStatus): boolean {
  return ALLOWED_BOOK_REQUEST_STATUS_TRANSITIONS[from].includes(to);
}
