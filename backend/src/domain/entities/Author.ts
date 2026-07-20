export interface Author {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAuthorInput {
  name: string;
  slug: string;
  imageUrl?: string;
}

export type UpdateAuthorInput = Partial<CreateAuthorInput>;
