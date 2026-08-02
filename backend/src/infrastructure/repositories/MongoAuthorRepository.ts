import { IAuthorRepository } from "../../domain/repositories/IAuthorRepository";
import { Author, CreateAuthorInput, UpdateAuthorInput } from "../../domain/entities/Author";
import { AuthorDocument, AuthorModel } from "../database/models/Author.model";

function toDomain(doc: AuthorDocument): Author {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    imageUrl: doc.imageUrl,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class MongoAuthorRepository implements IAuthorRepository {
  async create(input: CreateAuthorInput): Promise<Author> {
    const doc = await AuthorModel.create(input);
    return toDomain(doc);
  }

  async findAll(): Promise<Author[]> {
    const docs = await AuthorModel.find().sort({ name: 1 }).lean<AuthorDocument[]>();
    return docs.map(toDomain);
  }

  async findById(id: string): Promise<Author | null> {
    const doc = await AuthorModel.findById(id).lean<AuthorDocument>();
    return doc ? toDomain(doc) : null;
  }

  async findBySlug(slug: string): Promise<Author | null> {
    const doc = await AuthorModel.findOne({ slug }).lean<AuthorDocument>();
    return doc ? toDomain(doc) : null;
  }

  async findByName(name: string): Promise<Author | null> {
    const doc = await AuthorModel.findOne({ name: new RegExp(`^${escapeRegex(name.trim())}$`, "i") }).lean<AuthorDocument>();
    return doc ? toDomain(doc) : null;
  }

  async update(id: string, input: UpdateAuthorInput): Promise<Author | null> {
    const doc = await AuthorModel.findByIdAndUpdate(id, input, { new: true }).lean<AuthorDocument>();
    return doc ? toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await AuthorModel.findByIdAndDelete(id);
    return result !== null;
  }
}
