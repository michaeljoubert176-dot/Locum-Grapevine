// A clearly-marked placeholder for a future AI-generated summary of this
// job's reviews. Static text for now — no data feeds into this yet.
export default function AiSummaryPlaceholder() {
  return (
    <div className="rounded-2xl border border-dashed border-green/40 bg-green-soft/60 p-6">
      <p className="text-xs font-semibold tracking-wide text-green uppercase">
        AI summary — coming soon
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        This is where a short, AI-generated summary of everyone&apos;s reviews will appear,
        pulling out the recurring themes so you can get the gist in a few seconds. It&apos;s not
        live yet — for now, read the individual reviews below.
      </p>
    </div>
  );
}
