import { Author, CreateAuthorInput, UpdateAuthorInput } from "../entities/Author";

export interface IAuthorRepository {
  create(input: CreateAuthorInput): Promise<Author>;
  findAll(): Promise<Author[]>;
  findById(id: string): Promise<Author | null>;
  findBySlug(slug: string): Promise<Author | null>;
  findByName(name: string): Promise<Author | null>;
  update(id: string, input: UpdateAuthorInput): Promise<Author | null>;
  delete(id: string): Promise<boolean>;
}
