import { FilterQuery } from "mongoose";
import { IBookRepository } from "../../domain/repositories/IBookRepository";
import {
  Book,
  BookFilter,
  CreateBookInput,
  PaginatedResult,
  Pagination,
  UpdateBookInput,
} from "../../domain/entities/Book";
import { BookDocument, BookModel } from "../database/models/Book.model";

function toDomain(doc: BookDocument): Book {
  return {
    id: doc._id.toString(),
    title: doc.title,
    authors: doc.authors,
    description: doc.description,
    isbn10: doc.isbn10,
    isbn13: doc.isbn13,
    publisher: doc.publisher,
    publishedDate: doc.publishedDate,
    pageCount: doc.pageCount,
    coverImageUrl: doc.coverImageUrl,
    price: doc.price,
    discountPercentage: doc.discountPercentage,
    finalPrice: doc.finalPrice,
    stock: doc.stock,
    categoryIds: doc.categoryIds.map((id) => id.toString()),
    language: doc.language,
    source: doc.source,
    sourceId: doc.sourceId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoBookRepository implements IBookRepository {
  async create(input: CreateBookInput): Promise<Book> {
    const doc = await BookModel.create(input);
    return toDomain(doc);
  }

  async findById(id: string): Promise<Book | null> {
    const doc = await BookModel.findById(id);
    return doc ? toDomain(doc) : null;
  }

  async findMany(filter: BookFilter, pagination: Pagination): Promise<PaginatedResult<Book>> {
    const query: FilterQuery<BookDocument> = {};

    if (filter.search) {
      query.$text = { $search: filter.search };
    }
    if (filter.categoryId) {
      query.categoryIds = filter.categoryId;
    }
    if (filter.language) {
      query.language = filter.language;
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [docs, total] = await Promise.all([
      BookModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit),
      BookModel.countDocuments(query),
    ]);

    return {
      items: docs.map(toDomain),
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async update(id: string, input: UpdateBookInput): Promise<Book | null> {
    const doc = await BookModel.findByIdAndUpdate(id, input, { new: true });
    return doc ? toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await BookModel.findByIdAndDelete(id);
    return result !== null;
  }
}
