import Link from "next/link";
import { jobTitle, type JobRow } from "@/lib/jobs";

// A job has no ancestor pages of its own (there's no dedicated "hospital"
// or "state" page to link to), so state and hospital are shown as plain
// text steps — only "Browse" itself and the current job are real stops.
export default function Breadcrumb({ job }: { job: JobRow }) {
  const title = jobTitle(job);

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol role="list" className="flex flex-wrap items-center gap-1.5 text-ink-soft">
        <li className="flex items-center gap-1.5">
          <Link href="/browse" className="rounded-sm text-green hover:underline">
            Browse
          </Link>
          <span aria-hidden="true">/</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span>{job.stateName}</span>
          <span aria-hidden="true">/</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span>{job.hospitalName}</span>
          <span aria-hidden="true">/</span>
        </li>
        <li>
          <span aria-current="page" className="font-medium text-ink">
            {title}
          </span>
        </li>
      </ol>
    </nav>
  );
}
