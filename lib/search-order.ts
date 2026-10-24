// Default /search order: most complete profiles first.
// photos → approved reviews → newest → id (stable tie-breaker).

type Rankable = {
  id: string;
  created_at: string;
  portfolio_photos?: { count: number }[];
  reviews?: { status: string }[];
};

const hasPhotos = (p: Rankable) => (p.portfolio_photos?.[0]?.count ?? 0) > 0;

const hasApprovedReviews = (p: Rankable) =>
  p.reviews?.some((r) => r.status === 'approved') ?? false;

export function sortByCompleteness<T extends Rankable>(profiles: T[]): T[] {
  return [...profiles].sort(
    (a, b) =>
      Number(hasPhotos(b)) - Number(hasPhotos(a)) ||
      Number(hasApprovedReviews(b)) - Number(hasApprovedReviews(a)) ||
      Date.parse(b.created_at) - Date.parse(a.created_at) ||
      a.id.localeCompare(b.id)
  );
}
