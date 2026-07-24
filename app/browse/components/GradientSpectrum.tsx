// A descriptive spectrum: five labelled anchor points along a line, with a
// marker showing where the average review landed. There is deliberately no
// good/bad end and no colour-coding by value — this describes a position,
// it doesn't rank one. Visually this is a continuous line with a single
// marker, kept distinct from the discrete bar-per-score distributions used
// for the nine core questions below.
export default function GradientSpectrum({
  title,
  anchors,
  average,
}: {
  title: string;
  anchors: readonly string[];
  average: number;
}) {
  const percent = ((average - 1) / 4) * 100;

  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>

      <div className="relative mt-8 mr-6 ml-6">
        <div className="h-px bg-line" />
        <div className="absolute inset-x-0 top-0 flex justify-between">
          {anchors.map((_, i) => (
            <span key={i} className="h-2 w-px -translate-y-1/2 bg-line" />
          ))}
        </div>
        <div
          className="absolute top-0 flex -translate-x-1/2 -translate-y-full flex-col items-center pb-1.5"
          style={{ left: `${percent}%` }}
        >
          <span className="rounded-full bg-purple px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-white">
            {average.toFixed(1)}
          </span>
          <span
            aria-hidden="true"
            className="mt-1 h-2.5 w-2.5 rotate-45 rounded-[2px] bg-purple"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-between gap-1 text-xs text-ink-soft">
        {anchors.map((label, i) => (
          <span
            key={label}
            className={
              i === 0
                ? "text-left"
                : i === anchors.length - 1
                  ? "text-right"
                  : "text-center"
            }
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
