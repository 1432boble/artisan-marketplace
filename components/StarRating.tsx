type StarRatingProps = {
  rating: number | null;
  count?: number;
  size?: string;
};

export default function StarRating({
  rating,
  count = 0,
  size = 'text-xl',
}: StarRatingProps) {
  const safeRating = Math.max(0, Math.min(5, rating || 0));
  const percentage = (safeRating / 5) * 100;

  if (!count || count === 0) {
    return (
      <p className="mt-2 text-sm font-semibold text-gray-400">
        Aucun avis
      </p>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className={`relative inline-block leading-none ${size}`}>
        <div className="text-gray-300">★★★★★</div>

        <div
          className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-amber-400"
          style={{ width: `${percentage}%` }}
        >
          ★★★★★
        </div>
      </div>

      <span className="text-sm font-semibold text-amber-600">
        {safeRating.toFixed(1)}/5 ({count} avis)
      </span>
    </div>
  );
}