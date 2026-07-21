import { IBookRequestRepository } from "../../domain/repositories/IBookRequestRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import { BookRequest, BookRequestStatus } from "../../domain/entities/BookRequest";
import { ConflictError, NotFoundError, ValidationError } from "../../shared/errors/AppError";
import { isValidBookRequestStatusTransition } from "../../shared/utils/bookRequestStatus";
import { sendBookRequestFulfilledEmail } from "../../shared/utils/mailer";
import { env } from "../../config/env";

export class BookRequestService {
  constructor(
    private readonly bookRequestRepository: IBookRequestRepository,
    private readonly userRepository: IUserRepository,
    private readonly bookRepository: IBookRepository
  ) {}

  async create(userId: string, bookTitle: string, authorName?: string, note?: string): Promise<BookRequest> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    const existing = await this.bookRequestRepository.findPendingByUserAndTitle(userId, bookTitle);
    if (existing) {
      throw new ConflictError("You've already requested this book.");
    }

    return this.bookRequestRepository.create({
      userId,
      requesterName: user.name,
      requesterEmail: user.email,
      bookTitle: bookTitle.trim(),
      authorName: authorName?.trim() || undefined,
      note: note?.trim() || undefined,
    });
  }

  listMine(userId: string): Promise<BookRequest[]> {
    return this.bookRequestRepository.findByUserId(userId);
  }

  listAll(status?: BookRequestStatus): Promise<BookRequest[]> {
    return this.bookRequestRepository.list(status);
  }

  async updateStatus(
    id: string,
    status: BookRequestStatus,
    adminNote?: string,
    bookId?: string
  ): Promise<BookRequest> {
    const request = await this.bookRequestRepository.findById(id);
    if (!request) {
      throw new NotFoundError("Book request not found");
    }

    if (!isValidBookRequestStatusTransition(request.status, status)) {
      throw new ValidationError(`Cannot move a book request from "${request.status}" to "${status}"`);
    }

    if (bookId) {
      const book = await this.bookRepository.findById(bookId);
      if (!book) {
        throw new ValidationError("Book not found");
      }
    }

    const updated = await this.bookRequestRepository.updateStatus(id, status, adminNote, bookId);

    if (status === "fulfilled") {
      const bookUrl = bookId ? `${env.CORS_ORIGIN}/books/${bookId}` : undefined;
      // Best-effort: a missing/misconfigured mailer must never block the
      // admin's status update, which is the actual action being performed.
      sendBookRequestFulfilledEmail(updated!.requesterEmail, updated!.bookTitle, bookUrl).catch((err) => {
        console.error("Failed to send book request fulfilled email:", err);
      });
    }

    return updated!;
  }

  unseenFulfilled(userId: string): Promise<BookRequest[]> {
    return this.bookRequestRepository.findUnseenFulfilled(userId);
  }

  markSeen(userId: string): Promise<void> {
    return this.bookRequestRepository.markAllSeen(userId);
  }
}
