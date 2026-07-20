import { ICategoryRepository } from "../../domain/repositories/ICategoryRepository";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "../../domain/entities/Category";
import { CategoryDocument, CategoryModel } from "../database/models/Category.model";

function toDomain(doc: CategoryDocument): Category {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    imageUrl: doc.imageUrl,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoCategoryRepository implements ICategoryRepository {
  async create(input: CreateCategoryInput): Promise<Category> {
    const doc = await CategoryModel.create(input);
    return toDomain(doc);
  }

  async findAll(): Promise<Category[]> {
    const docs = await CategoryModel.find().sort({ name: 1 });
    return docs.map(toDomain);
  }

  async findById(id: string): Promise<Category | null> {
    const doc = await CategoryModel.findById(id);
    return doc ? toDomain(doc) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const doc = await CategoryModel.findOne({ slug });
    return doc ? toDomain(doc) : null;
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category | null> {
    const doc = await CategoryModel.findByIdAndUpdate(id, input, { new: true });
    return doc ? toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id);
    return result !== null;
  }
}
