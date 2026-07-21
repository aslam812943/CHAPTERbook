import { BookRequest, BookRequestStatus, CreateBookRequestInput } from "../entities/BookRequest";

export interface IBookRequestRepository {
  create(input: CreateBookRequestInput): Promise<BookRequest>;
  findById(id: string): Promise<BookRequest | null>;
  findByUserId(userId: string): Promise<BookRequest[]>;
  findPendingByUserAndTitle(userId: string, bookTitle: string): Promise<BookRequest | null>;
  list(status?: BookRequestStatus): Promise<BookRequest[]>;
  updateStatus(
    id: string,
    status: BookRequestStatus,
    adminNote?: string,
    bookId?: string
  ): Promise<BookRequest | null>;
  findUnseenFulfilled(userId: string): Promise<BookRequest[]>;
  markAllSeen(userId: string): Promise<void>;
}
