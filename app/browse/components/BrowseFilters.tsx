"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { jobTitle, jobLocation, type BrowseData, type LookupRow } from "@/lib/jobs";
import { IconChevronRight } from "@/app/components/icons";

type Filters = {
  positionId: string;
  specialtyId: string;
  subspecialtyId: string;
  stateId: string;
  hospitalId: string;
};

const EMPTY_FILTERS: Filters = {
  positionId: "",
  specialtyId: "",
  subspecialtyId: "",
  stateId: "",
  hospitalId: "",
};

// All the data needed to render the filters and results is fetched once,
// server-side, and handed to this client component. Filtering itself is
// plain in-memory array work, so picking a filter feels instant — there's
// no round trip to Supabase (and no full page navigation) per change.
export default function BrowseFilters({ data }: { data: BrowseData }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const visibleSubspecialties = useMemo(
    () =>
      filters.specialtyId
        ? data.subspecialties.filter((row) => row.specialtyId === filters.specialtyId)
        : data.subspecialties,
    [data.subspecialties, filters.specialtyId]
  );

  const visibleHospitals = useMemo(
    () =>
      filters.stateId
        ? data.hospitals.filter((row) => row.stateId === filters.stateId)
        : data.hospitals,
    [data.hospitals, filters.stateId]
  );

  const filteredJobs = useMemo(
    () =>
      data.jobs.filter((job) => {
        if (filters.positionId && job.positionId !== filters.positionId) return false;
        if (filters.specialtyId && job.specialtyId !== filters.specialtyId) return false;
        if (filters.subspecialtyId && job.subspecialtyId !== filters.subspecialtyId) return false;
        if (filters.stateId && job.stateId !== filters.stateId) return false;
        if (filters.hospitalId && job.hospitalId !== filters.hospitalId) return false;
        return true;
      }),
    [data.jobs, filters]
  );

  function updateFilter<K extends keyof Filters>(key: K, value: string) {
    setFilters((current) => {
      const next = { ...current, [key]: value };

      // Clear a dependent filter the moment it stops matching its parent,
      // so the combination shown on screen can never become contradictory
      // (e.g. a subspecialty left selected after switching away from its
      // specialty).
      if (key === "specialtyId") {
        const stillValid = data.subspecialties.some(
          (row) => row.id === current.subspecialtyId && row.specialtyId === value
        );
        if (!stillValid) next.subspecialtyId = "";
      }
      if (key === "stateId") {
        const stillValid = data.hospitals.some(
          (row) => row.id === current.hospitalId && row.stateId === value
        );
        if (!stillValid) next.hospitalId = "";
      }

      return next;
    });
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          label="Position"
          value={filters.positionId}
          onChange={(value) => updateFilter("positionId", value)}
          options={data.positions}
        />
        <FilterSelect
          label="Specialty"
          value={filters.specialtyId}
          onChange={(value) => updateFilter("specialtyId", value)}
          options={data.specialties}
        />
        <FilterSelect
          label="Subspecialty"
          value={filters.subspecialtyId}
          onChange={(value) => updateFilter("subspecialtyId", value)}
          options={visibleSubspecialties}
        />
        <FilterSelect
          label="State"
          value={filters.stateId}
          onChange={(value) => updateFilter("stateId", value)}
          options={data.states}
        />
        <FilterSelect
          label="Hospital"
          value={filters.hospitalId}
          onChange={(value) => updateFilter("hospitalId", value)}
          options={visibleHospitals}
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="rounded-full px-1 py-2 text-sm font-medium text-green underline underline-offset-2 hover:opacity-80"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="mt-6 text-sm text-ink-soft">
        {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} match
        {hasActiveFilters ? " these filters" : ""}
      </p>

      <div className="mt-4">
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-6 text-sm text-ink-soft">
            No jobs match this combination of filters. Try loosening one.
          </div>
        ) : (
          <ul role="list" className="grid gap-3 sm:grid-cols-2">
            {filteredJobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/browse/${job.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 hover:border-green/35 hover:bg-green-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">{jobTitle(job)}</span>
                    <span className="block truncate text-xs text-ink-soft">
                      {jobLocation(job)}
                    </span>
                  </span>
                  <IconChevronRight className="h-5 w-5 shrink-0 text-green/50" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: LookupRow[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-full border border-line bg-white px-3.5 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
