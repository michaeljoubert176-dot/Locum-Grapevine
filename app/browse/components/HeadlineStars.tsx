// The headline rating: five stars, partially filled to the average score,
// plus the number in text and how many reviews it's drawn from.
export default function HeadlineStars({
  average,
  reviewCount,
}: {
  average: number;
  reviewCount: number;
}) {
  const fillPercent = Math.max(0, Math.min(1, average / 5)) * 100;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="relative inline-flex" aria-hidden="true">
        <StarRow className="text-teal-700/20" />
        <span
          className="absolute inset-0 top-0 left-0 overflow-hidden"
          style={{ width: `${fillPercent}%` }}
        >
          <StarRow className="text-gold-500" />
        </span>
      </span>
      <p className="text-ink">
        <span className="text-2xl font-semibold">{average.toFixed(1)}</span>
        <span className="text-ink-soft"> / 5</span>
        <span className="ml-2 text-sm text-ink-soft">
          based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </span>
      </p>
    </div>
  );
}

function StarRow({ className }: { className: string }) {
  return (
    <span className={`flex gap-1 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
          <path
            d="M12 3.5l2.47 5.24 5.53.63-4.13 3.9 1.1 5.63L12 15.9l-5 2.99 1.1-5.62-4.13-3.9 5.53-.63L12 3.5Z"
            fill="currentColor"
          />
        </svg>
      ))}
    </span>
  );
}
