import { Category, CreateCategoryInput, UpdateCategoryInput } from "../entities/Category";

export interface ICategoryRepository {
  create(input: CreateCategoryInput): Promise<Category>;
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  update(id: string, input: UpdateCategoryInput): Promise<Category | null>;
  delete(id: string): Promise<boolean>;
}
