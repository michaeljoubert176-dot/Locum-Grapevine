import { IconCheck, IconX } from "@/app/components/icons";

// A simple ticked/crossed pill for a single boolean fact, e.g. "Overtime
// paid" or "Weekends required". No hover detail — that's HoverStatChip,
// used for the facts that need a percentage breakdown instead.
export default function PresenceChip({ label, present }: { label: string; present: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${
        present ? "bg-green text-white" : "bg-muted-soft text-muted"
      }`}
    >
      {present ? <IconCheck className="h-3.5 w-3.5" /> : <IconX className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
