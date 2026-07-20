import StarIcon from "./StarIcon";
import { RatingValue, ReviewSummary } from "@/types/review";

export default function ReviewSummaryCard({ summary }: { summary: ReviewSummary }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {summary.total === 0 ? (
        <p className="text-center text-gray-500 font-medium mb-5">Be the first to review</p>
      ) : (
        <div className="text-center mb-5">
          <p className="text-4xl font-bold text-ink">{summary.average.toFixed(1)}</p>
          <div className="flex justify-center gap-0.5 my-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= Math.round(summary.average)} className="w-4 h-4" />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {summary.total} review{summary.total === 1 ? "" : "s"}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        {([5, 4, 3, 2, 1] as RatingValue[]).map((star) => {
          const count = summary.breakdown[star];
          const pct = summary.total === 0 ? 0 : Math.round((count / summary.total) * 100);
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-gray-600">{star}</span>
              <StarIcon filled className="w-3.5 h-3.5" />
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-9 text-right text-gray-500 text-xs">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
