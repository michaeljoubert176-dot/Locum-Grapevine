import WaitlistForm from "./components/WaitlistForm";

// -----------------------------------------------------------------------
// This is the Locum Grapevine landing page. It's built from four sections,
// top to bottom:
//   1. Hero        — the core promise, plus an email waitlist signup.
//   2. Problem      — the pain of choosing a placement blind, told as three
//                     substantial blocks rather than small icon cards.
//   3. Solution     — how honest, crowd-sourced reviews fix that.
//   4. Closing CTA  — a last chance to join the waitlist.
// A thin connecting line runs down the centre of the page with a node at
// the top of each section — a quiet nod to word-of-mouth passing from one
// locum to the next, without ever drawing a literal grapevine.
// The email form itself lives in app/components/WaitlistForm.tsx (see that
// file for where to put your Formspree ID) and is reused in sections 1 and 4.
// -----------------------------------------------------------------------

export default function Home() {
  return (
    <>
      <main className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-teal-700/20 to-transparent" />
        </div>

        {/* 1. Hero */}
        <section
          aria-labelledby="hero-heading"
          className="relative overflow-hidden px-6 pt-24 pb-20 sm:pt-32 sm:pb-28"
        >
          <Node className="bg-teal-700 ring-paper" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl"
          />

          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="font-display text-sm font-semibold tracking-wide text-teal-700">
              <span className="block">The Locum Grapevine</span>
              <span className="block">Australia</span>
            </p>

            <h1
              id="hero-heading"
              className="font-display mt-6 text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl md:text-6xl"
            >
              Find out what a locum job is really like, before you accept it.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              The Locum Grapevine is the word you can trust — an honest, crowd-sourced record of
              hospitals, departments and roles across Australia, written by the locums who’ve
              actually worked the shift.
            </p>

            <div className="mt-10 w-full">
              <WaitlistForm idPrefix="hero" />
              <p className="mt-3 text-sm text-ink-soft">
                Free to use. Learn what you need, leave what you know. No spam, ever.
              </p>
            </div>

            <div className="mt-14 w-full max-w-xl rounded-2xl border border-teal-700/15 bg-paper-warm px-7 py-6 text-left">
              <p className="font-display text-sm font-semibold text-teal-700">Sound familiar?</p>
              <p className="mt-2 leading-relaxed text-ink-soft italic">
                You accept the job weeks in advance but the roster only arrives the day before.
                Surprise, you’ll be solo on nights, about thirty admissions a shift. Good luck! Oh
                — and they’re still on paper notes.
              </p>
            </div>
          </div>
        </section>

        {/* 2. The Problem */}
        <section
          aria-labelledby="problem-heading"
          className="relative bg-paper-warm px-6 py-20 sm:py-28"
        >
          <Node className="bg-teal-700 ring-paper-warm" />
          <div className="mx-auto max-w-3xl">
            <h2
              id="problem-heading"
              className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
            >
              Right now, you’re choosing blind.
            </h2>

            <ol
              role="list"
              className="mt-14 space-y-14 border-l border-teal-700/20 pl-8 sm:pl-10"
            >
              <ProblemBlock
                title="Choosing where to work is one of the most stressful parts of locuming. It shouldn’t be."
                body="How do you choose a job when you know nothing about what it’s actually like? Every few weeks you’re weighing up another placement — location, roles, responsibilities, the unknown — and carrying that decision alone. It’s a quiet, recurring stress that comes with the job, and it doesn’t need to."
              />
              <ProblemBlock
                title="How do you know if it’s the right locum job for you — or that you’re the right locum for the job?"
                body="Hope isn’t a strategy. The best placement isn’t the one with the highest rate. It’s the one that matches the experience you want with the experience you have. Without honest information from people who’ve actually done the work, that’s almost impossible to judge in advance."
              />
              <ProblemBlock
                title="Everything you need to choose well is out there. Just not where you can reach it."
                body="Every locum who’s done a job knows something useful about it. On its own, that’s just one person’s experience. Collectively, it becomes something powerful: a detailed and honest record. The problem has never been that the information doesn’t exist — it’s that there’s been no way to bring it together."
              />
            </ol>
          </div>
        </section>

        {/* 3. The Solution */}
        <section
          aria-labelledby="solution-heading"
          className="relative bg-teal-900 px-6 py-20 sm:py-28"
        >
          <Node className="bg-gold-500 ring-teal-900" />
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <h2
                id="solution-heading"
                className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                Together, we have the answer.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-teal-100">
                Locum Grapevine is the word on every ward. It turns fragmented stories, heard by a
                lucky few, into a detailed, honest and searchable record of what a job is really
                like. Whether it’s a warning or a winner, every role, department and hospital has a
                story — told by the locums who went before you. And now you can hear it on the
                Locum Grapevine.
              </p>
            </div>

            <ul role="list" className="mt-14 grid gap-6 sm:grid-cols-3">
              <SolutionBox
                title="The information you actually care about"
                body="You know the frustration. Locum ads either have no information, or none that’s truly useful. The details that make or break a placement are the ones you can never find. Locum Grapevine covers what you need to take on a job with confidence: how the roster really works, what the culture and workload are like, the pay, accommodation options, and what you’ll be responsible for."
              />
              <SolutionBox
                title="Rated on what matters"
                body="Every placement scored on what actually shapes your experience — pay that lands on time, a workload you can manage, appropriate supervision, a team that has your back. Clear, comparable ratings from the locums who came before you, so you can size up a job at a glance. No more taking placements on blind faith — just the honest word of those who’ve been there, done that."
              />
              <SolutionBox
                title="Find the right locum for you"
                body="Get to what you’re looking for with ease. Locum Grapevine is built to be explored — compare one role across the country, or every role within a single hospital. However you get there, it leads to the same place: the right job, for you."
              />
            </ul>
          </div>
        </section>

        {/* 4. Closing CTA */}
        <section
          aria-labelledby="waitlist-heading"
          className="relative bg-teal-800 px-6 py-20 text-center sm:py-28"
        >
          <Node className="bg-gold-500 ring-teal-800" />
          <div className="mx-auto max-w-xl">
            <h2
              id="waitlist-heading"
              className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Sound like something you want to be a part of?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-teal-100">
              Join your community today and start spreading the word.
            </p>
            <div className="mt-9">
              <WaitlistForm idPrefix="footer" theme="dark" />
            </div>
            <p className="mt-4 text-sm text-teal-200">
              Locum Grapevine is launching soon. Join the waitlist and we’ll tell you the moment
              it’s live.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-teal-950 px-6 py-8 text-center text-sm text-teal-200">
        © {new Date().getFullYear()} Locum Grapevine. Australia.
      </footer>
    </>
  );
}

function Node({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute top-0 left-1/2 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 md:block ${className}`}
    />
  );
}

function ProblemBlock({ title, body }: { title: string; body: string }) {
  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className="absolute top-1 left-[-2.6rem] h-3 w-3 -translate-x-1/2 rounded-full bg-teal-700 ring-4 ring-paper-warm sm:left-[-3.1rem]"
      />
      <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-ink-soft">{body}</p>
    </li>
  );
}

function SolutionBox({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-2xl border border-white/10 bg-white/5 p-7">
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-teal-100">{body}</p>
    </li>
  );
}
