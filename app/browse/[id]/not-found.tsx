import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        We couldn&apos;t find that
      </h1>
      <p className="mt-3 text-ink-soft">
        This might have moved, or the link might be out of date.
      </p>
      <Link
        href="/browse"
        className="mt-8 rounded-md bg-teal-700 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Back to Browse
      </Link>
    </main>
  );
}
