# Locum Grapevine

A website for locum doctors in Australia. It's a platform for honest,
crowd-sourced reviews of hospitals, departments and roles — so locums can
know what a job is actually like before they accept it, instead of relying
on word of mouth.

## What's on the homepage

The homepage (`app/page.tsx`) is a landing page with an email waitlist,
built from four sections, top to bottom:

1. **Hero** — states the core promise ("find out what a locum job is
   really like before you accept it") with an email signup form.
2. **Problem** — describes the pain locums feel today: accepting a job
   without knowing the workload, culture, or what "accommodation
   included" actually means.
3. **How we help** — explains how Locum Grapevine's crowd-sourced reviews
   solve that, covering ratings, practical details (travel/car/
   accommodation), and that reviews come from real locums, not agencies.
4. **Closing call to action** — a second, final chance to join the
   waitlist.

The email form (`app/components/WaitlistForm.tsx`) is a plain HTML form
that posts straight to [Formspree](https://formspree.io/), a service that
emails you form submissions without needing a backend. **Before this goes
live, open that file and replace `YOUR_FORMSPREE_ID` with your real
Formspree form ID** — there's a comment right above it in the code
explaining where to get it.

The site is built with [Next.js](https://nextjs.org/) (a React framework),
[TypeScript](https://www.typescriptlang.org/) (JavaScript with type
checking), and [Tailwind CSS](https://tailwindcss.com/) (a styling toolkit).
If you're new to any of these, don't worry — this README explains what
everything does.

## Getting started

You'll need [Node.js](https://nodejs.org/) installed (version 20 or later
is recommended).

1. Install the project's dependencies:

   ```bash
   npm install
   ```

2. Start the local development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
   You should see the "Locum Grapevine — coming soon" page. The page
   automatically refreshes whenever you save a change to a file.

## Useful commands

| Command           | What it does                                                        |
| ------------------ | -------------------------------------------------------------------- |
| `npm run dev`       | Starts the site locally for development, with live reload.          |
| `npm run build`     | Builds an optimized, production-ready version of the site.          |
| `npm run start`     | Runs the production build (run `npm run build` first).              |
| `npm run lint`      | Checks the code for common mistakes and style issues.               |

## Project structure

Here's what each folder and file is for:

```
Locum-Grapevine/
├── app/                    ← The pages of the website live here
│   ├── layout.tsx          ← Shared HTML shell wrapping every page
│   ├── page.tsx            ← The homepage ("/") — the landing page
│   ├── globals.css         ← Site-wide styles and Tailwind setup
│   ├── favicon.ico         ← The little icon shown in browser tabs
│   └── components/         ← Reusable pieces used by the homepage
│       ├── WaitlistForm.tsx  ← The email signup form (posts to Formspree)
│       └── icons.tsx         ← Small decorative icons used in the page
├── public/                ← Static files served as-is (images, etc.)
├── package.json            ← Lists the project's dependencies and scripts
├── package-lock.json       ← Exact versions of every dependency (auto-generated, don't edit by hand)
├── tsconfig.json           ← TypeScript configuration
├── next.config.ts           ← Next.js configuration
├── postcss.config.mjs       ← Configuration that lets Tailwind process our CSS
├── eslint.config.mjs        ← Linting rules (code style/quality checks)
└── .gitignore               ← Tells git which files/folders not to track
```

### `app/` — the pages

Next.js uses "file-based routing": the folder structure inside `app/`
defines the site's URLs. Right now there's only one page:

- **`app/page.tsx`** is the homepage, shown at `/`. This is the file to
  edit to change what visitors see when they land on the site. It's
  currently the landing page described above.
- **`app/layout.tsx`** wraps every page (including future ones). It sets
  up the `<html>` and `<body>` tags, loads fonts, and defines page
  metadata like the browser tab title.
- **`app/globals.css`** contains site-wide CSS, including the Tailwind
  CSS setup. Most day-to-day styling is done directly in components using
  Tailwind utility classes (e.g. `className="text-xl font-bold"`) rather
  than writing CSS here.
- **`app/components/`** holds small pieces of UI reused across the
  homepage — the waitlist form and the decorative icons — so the same
  code isn't copy-pasted in multiple places.

As the site grows, new pages are added by creating new folders inside
`app/` with their own `page.tsx` file — for example, `app/about/page.tsx`
would become the `/about` page.

### `public/` — static assets

Files placed here (images, PDFs, etc.) are served directly by the
website. For example, a file at `public/logo.png` would be available at
`yoursite.com/logo.png`.

### Configuration files

- **`package.json`** lists the project's dependencies (the libraries it
  relies on) and the `npm run ...` scripts described above.
- **`tsconfig.json`** configures TypeScript, which checks that your code
  uses consistent types and catches certain bugs before you even run the
  code.
- **`next.config.ts`** is where Next.js-specific settings would go if the
  site needs any (currently left at the defaults).
- **`postcss.config.mjs`** and the Tailwind setup in `globals.css` allow
  Tailwind's utility classes to be used throughout the site.
- **`eslint.config.mjs`** defines linting rules, run with `npm run lint`,
  to help catch mistakes and keep code style consistent.

## Deploying

Running `npm run build` produces an optimized, production-ready version
of the site and confirms there are no build errors. This project can be
deployed to any host that supports Next.js (such as
[Vercel](https://vercel.com/), the company behind Next.js).
