type WaitlistFormProps = {
  /** Used to build unique element ids, since this form appears twice on the page. */
  idPrefix: string;
  /** "light" for use on light backgrounds, "dark" for use on solid dark/teal backgrounds. */
  theme?: "light" | "dark";
};

// Plain HTML form that posts straight to Formspree — no JavaScript required,
// so it works even before any client-side code has loaded.
export default function WaitlistForm({ idPrefix, theme = "light" }: WaitlistFormProps) {
  const inputId = `${idPrefix}-email`;
  const isDark = theme === "dark";

  return (
    <form
      // Posts to the Locum Grapevine Formspree form. To point this at a
      // different Formspree form later, swap the ID in this URL (get it
      // from https://formspree.io -> your form -> the "Integration" tab).
      action="https://formspree.io/f/mlgyodgy"
      method="POST"
      className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <input
        id={inputId}
        type="email"
        name="email"
        required
        placeholder="you@hospital.com.au"
        autoComplete="email"
        className={`w-full min-w-0 rounded-md border px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          isDark
            ? "border-white/30 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white focus-visible:ring-offset-teal-800"
            : "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-teal-700 focus-visible:ring-offset-white"
        }`}
      />
      {/* Gives waitlist emails a readable subject line in your inbox. */}
      <input type="hidden" name="_subject" value="New Locum Grapevine waitlist signup" />
      <button
        type="submit"
        className={`shrink-0 rounded-md px-5 py-3 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          isDark
            ? "bg-white text-teal-900 hover:bg-teal-50 focus-visible:ring-white focus-visible:ring-offset-teal-800"
            : "bg-teal-700 text-white hover:bg-teal-800 focus-visible:ring-teal-700 focus-visible:ring-offset-white"
        }`}
      >
        Join the waitlist
      </button>
    </form>
  );
}
