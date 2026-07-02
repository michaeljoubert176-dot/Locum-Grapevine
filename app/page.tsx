import WaitlistForm from "./components/WaitlistForm";
import { IconClipboard, IconClock, IconHome, IconMapPin, IconStar, IconUsers } from "./components/icons";

// -----------------------------------------------------------------------
// This is the Locum Grapevine landing page. It's built from four sections,
// top to bottom:
//   1. Hero        — the core promise, plus an email waitlist signup.
//   2. Problem      — the pain locums feel today (deciding on faith).
//   3. How we help  — how honest, crowd-sourced reviews fix that.
//   4. Closing CTA  — a last chance to join the waitlist.
// The email form itself lives in app/components/WaitlistForm.tsx (see that
// file for where to put your Formspree ID) and is reused in sections 1 and 4.
// -----------------------------------------------------------------------

export default function Home() {
  return (
    <>
      <main>
        {/* 1. Hero */}
        <section
          aria-labelledby="hero-heading"
          className="bg-white px-6 py-20 dark:bg-zinc-950 sm:py-28"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="text-sm font-semibold tracking-wide text-teal-700 uppercase dark:text-teal-400">
              For locum doctors — Australia
            </p>
            <h1
              id="hero-heading"
              className="mt-4 text-4xl font-bold tracking-tight text-balance text-zinc-900 dark:text-white sm:text-5xl"
            >
              Find out what a locum job is really like — before you accept it.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
              Locum Grapevine is honest, crowd-sourced reviews of hospitals, departments and
              roles across Australia — written by the locums who&rsquo;ve actually worked the
              shift.
            </p>

            <div className="mt-8 w-full">
              <WaitlistForm idPrefix="hero" />
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                Free while we&rsquo;re building. No spam, ever.
              </p>
            </div>

            <div className="mt-12 w-full max-w-xl rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-5 text-left dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Sound familiar?
              </p>
              <p className="mt-2 leading-relaxed text-zinc-600 italic dark:text-zinc-400">
                You accept the job. Only once you arrive do you find out about the hour-long
                drive to the nearest supermarket, or that &ldquo;accommodation included&rdquo;
                means a shared donga with no aircon.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Problem */}
        <section
          aria-labelledby="problem-heading"
          className="bg-zinc-50 px-6 py-20 dark:bg-zinc-900 sm:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <h2
                id="problem-heading"
                className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white"
              >
                You&rsquo;re taking the job on faith
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
                Right now, the only reliable intel on a locum job comes from someone you happen
                to know who&rsquo;s already done it — an actual grapevine, one conversation at a
                time. Everyone else accepts the position and finds out on day one.
              </p>
            </div>

            <ul role="list" className="mt-12 grid gap-8 sm:grid-cols-3">
              <ProblemCard
                icon={<IconClipboard className="h-6 w-6" />}
                title="The ad tells you the pay. Not the ward."
                description="Rosters, workload, supervision, culture — the things that decide whether a placement is manageable are rarely in the job description."
              />
              <ProblemCard
                icon={<IconHome className="h-6 w-6" />}
                title={'"Accommodation included" could mean anything.'}
                description="A private unit five minutes from the hospital, or a shared donga with no aircon an hour's drive away. You won't know until you arrive."
              />
              <ProblemCard
                icon={<IconClock className="h-6 w-6" />}
                title="One bad placement, and you're stuck."
                description="Locum contracts are short, but a miserable four-to-six-week placement in the wrong department is still four to six weeks."
              />
            </ul>
          </div>
        </section>

        {/* 3. How we help */}
        <section
          aria-labelledby="help-heading"
          className="bg-teal-900 px-6 py-20 text-white sm:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <h2 id="help-heading" className="text-3xl font-bold tracking-tight">
                The grapevine, organised
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-teal-100">
                Locum Grapevine turns the informal warnings and tips locums already trade into a
                searchable record — honest ratings and reviews of every hospital, department and
                role, written by locums who&rsquo;ve been there.
              </p>
            </div>

            <ul role="list" className="mt-12 grid gap-8 sm:grid-cols-3">
              <FeatureItem
                icon={<IconStar className="h-6 w-6" />}
                title="Ratings that matter to locums"
                description="Workload, supervision, culture, orientation — rated by people who did the shift, not written as marketing copy."
              />
              <FeatureItem
                icon={<IconMapPin className="h-6 w-6" />}
                title="The practical details, spelled out"
                description="Whether travel, a car and accommodation are included — and what that accommodation is actually like."
              />
              <FeatureItem
                icon={<IconUsers className="h-6 w-6" />}
                title="Crowd-sourced, not curated"
                description="Every review comes from a locum who worked the role, not an agency with a shift to fill."
              />
            </ul>

            <p className="mt-12 max-w-2xl text-sm text-teal-200 italic">
              Reviews come first. Further down the track, we&rsquo;re also building a secure
              document vault for your credentials and one-click sign-up across agencies.
            </p>
          </div>
        </section>

        {/* 4. Closing CTA */}
        <section
          aria-labelledby="waitlist-heading"
          className="bg-teal-700 px-6 py-20 text-center text-white sm:py-24"
        >
          <div className="mx-auto max-w-xl">
            <h2 id="waitlist-heading" className="text-3xl font-bold tracking-tight">
              Get in before your next locum job
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-teal-50">
              Join the waitlist and we&rsquo;ll let you know the moment Locum Grapevine is live.
            </p>
            <div className="mt-8">
              <WaitlistForm idPrefix="footer" theme="dark" />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-950 px-6 py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Locum Grapevine. Australia.
      </footer>
    </>
  );
}

function ProblemCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </li>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li>
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-teal-100">{description}</p>
    </li>
  );
}
