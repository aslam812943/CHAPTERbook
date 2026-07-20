import StarIcon from "./StarIcon";
import { Review } from "@/types/review";

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 divide-y divide-gray-200">
      {reviews.map((review) => (
        <div key={review.id} className="py-5 first:pt-0 last:pb-0">
          <div className="flex items-center gap-1 mb-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= review.rating} className="w-4 h-4" />
            ))}
          </div>
          <p className="font-semibold text-ink">{review.title}</p>
          <p className="text-sm text-gray-500 mb-2">
            {review.userName} &middot; {new Date(review.createdAt).toLocaleDateString()}
          </p>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{review.body}</p>
        </div>
      ))}
    </div>
  );
}
