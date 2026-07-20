import { IAuthorRepository } from "../../domain/repositories/IAuthorRepository";
import { Author, UpdateAuthorInput } from "../../domain/entities/Author";
import { ConflictError, NotFoundError } from "../../shared/errors/AppError";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export class AuthorService {
  constructor(private readonly authorRepository: IAuthorRepository) {}

  async create(name: string, imageUrl?: string): Promise<Author> {
    const slug = slugify(name);
    const existing = await this.authorRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictError(`An author named "${name}" already exists`);
    }
    return this.authorRepository.create({ name, slug, imageUrl });
  }

  list(): Promise<Author[]> {
    return this.authorRepository.findAll();
  }

  async update(id: string, input: { name?: string; imageUrl?: string }): Promise<Author> {
    const existing = await this.authorRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Author not found");
    }

    const update: UpdateAuthorInput = { imageUrl: input.imageUrl };

    if (input.name && input.name !== existing.name) {
      const slug = slugify(input.name);
      const slugOwner = await this.authorRepository.findBySlug(slug);
      if (slugOwner && slugOwner.id !== id) {
        throw new ConflictError(`An author named "${input.name}" already exists`);
      }
      update.name = input.name;
      update.slug = slug;
    }

    const updated = await this.authorRepository.update(id, update);
    return updated!;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.authorRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Author not found");
    }
  }

  // Called whenever a book is saved with author names that may not exist
  // in the directory yet - creates a bare (name-only, no image) Author
  // record for each one so it starts showing up for admin management and
  // eventually the homepage carousel, without blocking the book save on
  // an admin having to pre-register every author first.
  async ensureAuthorsExist(names: string[]): Promise<void> {
    for (const rawName of names) {
      const name = rawName.trim();
      if (!name) continue;

      const existing = await this.authorRepository.findByName(name);
      if (existing) continue;

      const slug = slugify(name);
      const slugOwner = await this.authorRepository.findBySlug(slug);
      if (slugOwner) continue; // same slug already covers this name (e.g. casing/punctuation variant)

      await this.authorRepository.create({ name, slug });
    }
  }
}
