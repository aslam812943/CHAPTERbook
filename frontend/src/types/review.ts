export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  title: string;
  rating: RatingValue;
  body: string;
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  total: number;
  breakdown: Record<RatingValue, number>;
  reviews: Review[];
}
