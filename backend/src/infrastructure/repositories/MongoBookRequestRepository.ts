import { Types } from "mongoose";
import { IBookRequestRepository } from "../../domain/repositories/IBookRequestRepository";
import { BookRequest, BookRequestStatus, CreateBookRequestInput } from "../../domain/entities/BookRequest";
import { BookRequestDocument, BookRequestModel } from "../database/models/BookRequest.model";

function toDomain(doc: BookRequestDocument): BookRequest {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    requesterName: doc.requesterName,
    requesterEmail: doc.requesterEmail,
    bookTitle: doc.bookTitle,
    authorName: doc.authorName,
    note: doc.note,
    status: doc.status,
    adminNote: doc.adminNote,
    bookId: doc.bookId?.toString(),
    seen: doc.seen,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoBookRequestRepository implements IBookRequestRepository {
  async create(input: CreateBookRequestInput): Promise<BookRequest> {
    const doc = await BookRequestModel.create({
      userId: new Types.ObjectId(input.userId),
      requesterName: input.requesterName,
      requesterEmail: input.requesterEmail,
      bookTitle: input.bookTitle,
      authorName: input.authorName,
      note: input.note,
    });
    return toDomain(doc);
  }

  async findById(id: string): Promise<BookRequest | null> {
    const doc = await BookRequestModel.findById(id);
    return doc ? toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<BookRequest[]> {
    const docs = await BookRequestModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map(toDomain);
  }

  async findPendingByUserAndTitle(userId: string, bookTitle: string): Promise<BookRequest | null> {
    const doc = await BookRequestModel.findOne({
      userId,
      status: "pending",
      bookTitle: { $regex: `^${bookTitle.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    return doc ? toDomain(doc) : null;
  }

  async list(status?: BookRequestStatus): Promise<BookRequest[]> {
    const docs = await BookRequestModel.find(status ? { status } : {}).sort({ createdAt: -1 });
    return docs.map(toDomain);
  }

  async updateStatus(
    id: string,
    status: BookRequestStatus,
    adminNote?: string,
    bookId?: string
  ): Promise<BookRequest | null> {
    const doc = await BookRequestModel.findByIdAndUpdate(
      id,
      {
        status,
        ...(adminNote !== undefined ? { adminNote } : {}),
        ...(bookId !== undefined ? { bookId: new Types.ObjectId(bookId) } : {}),
        ...(status === "fulfilled" ? { seen: false } : {}),
      },
      { new: true }
    );
    return doc ? toDomain(doc) : null;
  }

  async findUnseenFulfilled(userId: string): Promise<BookRequest[]> {
    const docs = await BookRequestModel.find({ userId, status: "fulfilled", seen: false }).sort({
      createdAt: -1,
    });
    return docs.map(toDomain);
  }

  async markAllSeen(userId: string): Promise<void> {
    await BookRequestModel.updateMany({ userId, seen: false }, { seen: true });
  }
}
