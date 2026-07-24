import type { ReviewRow } from "@/lib/reviews";
import { IconCheck, IconX } from "@/app/components/icons";

function formatMoney(amount: string): string {
  const value = Number(amount);
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

function Chip({
  children,
  variant = "amber",
}: {
  children: React.ReactNode;
  variant?: "amber" | "purple";
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-3.5 py-1.5 text-sm ${
        variant === "purple" ? "bg-purple-soft text-purple" : "bg-amber-soft text-amber"
      }`}
    >
      {children}
    </span>
  );
}

function PresenceChip({ label, present }: { label: string; present: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${
        present ? "bg-green text-white" : "bg-muted-soft text-muted"
      }`}
    >
      {present ? (
        <IconCheck className="h-3.5 w-3.5" />
      ) : (
        <IconX className="h-3.5 w-3.5" />
      )}
      {label}
    </span>
  );
}

// Small, scannable facts about the role, drawn from the most recently
// reported review (the freshest picture we have of what the job is like).
export default function FactChips({ review }: { review: ReviewRow }) {
  return (
    <div className="flex flex-wrap gap-2">
      {review.pay_unit === "day" ? (
        <Chip variant="purple">{formatMoney(review.pay_amount)} / day</Chip>
      ) : (
        <Chip variant="purple">
          {formatMoney(review.pay_amount)} / hour
          <span className="ml-1.5 text-xs text-purple/70">
            (day rate not shown — shift length unknown)
          </span>
        </Chip>
      )}

      <Chip>{review.roster_type === "fixed" ? "Fixed roster" : "Rotating roster"}</Chip>

      {review.shift_times && <Chip>Shift times: {review.shift_times}</Chip>}

      {review.after_hours && <Chip>After hours: {review.after_hours}</Chip>}

      <PresenceChip label="Car provided" present={review.car_provided} />
      <PresenceChip label="Accommodation provided" present={review.accommodation_provided} />
      <PresenceChip label="Flights provided" present={review.flights_provided} />
    </div>
  );
}
