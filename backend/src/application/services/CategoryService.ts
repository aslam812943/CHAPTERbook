import { ICategoryRepository } from "../../domain/repositories/ICategoryRepository";
import { Category, UpdateCategoryInput } from "../../domain/entities/Category";
import { ConflictError, NotFoundError } from "../../shared/errors/AppError";
import { slugify } from "../../shared/utils/slugify";

export class CategoryService {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async create(name: string, description?: string, imageUrl?: string): Promise<Category> {
    const slug = slugify(name);
    const existing = await this.categoryRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError(`A category named "${name}" already exists`);
    }
    return this.categoryRepository.create({ name, slug, description, imageUrl });
  }

  list(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async update(id: string, input: { name?: string; description?: string; imageUrl?: string }): Promise<Category> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Category not found");
    }

    const update: UpdateCategoryInput = {
      description: input.description,
      imageUrl: input.imageUrl,
    };

    if (input.name && input.name !== existing.name) {
      const slug = slugify(input.name);
      const slugOwner = await this.categoryRepository.findBySlug(slug);
      if (slugOwner && slugOwner.id !== id) {
        throw new ConflictError(`A category named "${input.name}" already exists`);
      }
      update.name = input.name;
      update.slug = slug;
    }

    const updated = await this.categoryRepository.update(id, update);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.categoryRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Category not found");
    }
  }
}
