import { jobTitle, jobLocation, type JobRow } from "@/lib/jobs";

export default function JobHeader({ job }: { job: JobRow }) {
  return (
    <div className="mt-3">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        {jobTitle(job)}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{jobLocation(job)}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Tag>{job.positionName}</Tag>
        <Tag>{job.specialtyName}</Tag>
        {job.subspecialtyName && <Tag>{job.subspecialtyName}</Tag>}
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-soft">
      {children}
    </span>
  );
}
