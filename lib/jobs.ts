import { supabase } from "@/lib/supabase";

// A "job" is a specific combination of position + specialty + (optional
// subspecialty) + hospital — e.g. "Registrar, Cardiology, Royal Melbourne
// Hospital". This file fetches jobs from Supabase and flattens the lookup
// tables they reference (position/specialty/subspecialty/hospital/state
// names) so the rest of the app can work with plain, readable fields
// instead of chasing foreign keys around.

export type LookupRow = { id: string; name: string };
export type SubspecialtyRow = LookupRow & { specialtyId: string };
export type HospitalRow = LookupRow & { stateId: string };

export type JobRow = {
  id: string;
  positionId: string;
  specialtyId: string;
  subspecialtyId: string | null;
  hospitalId: string;
  stateId: string;
  positionName: string;
  specialtyName: string;
  subspecialtyName: string | null;
  hospitalName: string;
  stateName: string;
};

export type BrowseData = {
  jobs: JobRow[];
  positions: LookupRow[];
  specialties: LookupRow[];
  subspecialties: SubspecialtyRow[];
  states: LookupRow[];
  hospitals: HospitalRow[];
};

type RawJobRow = {
  id: string;
  position_id: string;
  specialty_id: string;
  subspecialty_id: string | null;
  hospital_id: string;
  positions: { name: string };
  specialties: { name: string };
  subspecialties: { name: string } | null;
  hospitals: { name: string; state_id: string; states: { name: string } };
};

type RawLookupRow = { id: string; name: string };
type RawSubspecialtyRow = { id: string; name: string; specialty_id: string };
type RawHospitalRow = { id: string; name: string; state_id: string };

// Every column needed to both identify a job and display it, in one call —
// pulling in each lookup table's name via Supabase's foreign-key embedding
// rather than a separate round trip per lookup.
const JOB_SELECT =
  "id, position_id, specialty_id, subspecialty_id, hospital_id, " +
  "positions(name), specialties(name), subspecialties(name), " +
  "hospitals(name, state_id, states(name))";

function toJobRow(row: RawJobRow): JobRow {
  return {
    id: row.id,
    positionId: row.position_id,
    specialtyId: row.specialty_id,
    subspecialtyId: row.subspecialty_id,
    hospitalId: row.hospital_id,
    stateId: row.hospitals.state_id,
    positionName: row.positions.name,
    specialtyName: row.specialties.name,
    subspecialtyName: row.subspecialties?.name ?? null,
    hospitalName: row.hospitals.name,
    stateName: row.hospitals.states.name,
  };
}

export type BrowseFetchResult =
  | { data: BrowseData; error: null }
  | { data: null; error: string };

// Fetches every job plus every lookup list needed to build the browse
// filters, in one batch of parallel requests. The whole point of doing
// this as one up-front fetch (rather than a request per filter change) is
// so filtering on the page can be instant, in-memory client-side work.
export async function fetchBrowseData(): Promise<BrowseFetchResult> {
  const [jobsRes, positionsRes, specialtiesRes, subspecialtiesRes, statesRes, hospitalsRes] =
    await Promise.all([
      supabase.from("jobs").select(JOB_SELECT),
      supabase.from("positions").select("id, name").order("name"),
      supabase.from("specialties").select("id, name").order("name"),
      supabase.from("subspecialties").select("id, name, specialty_id").order("name"),
      supabase.from("states").select("id, name").order("name"),
      supabase.from("hospitals").select("id, name, state_id").order("name"),
    ]);

  const firstError =
    jobsRes.error ??
    positionsRes.error ??
    specialtiesRes.error ??
    subspecialtiesRes.error ??
    statesRes.error ??
    hospitalsRes.error;

  if (firstError) {
    return { data: null, error: firstError.message };
  }

  const jobs = ((jobsRes.data ?? []) as unknown as RawJobRow[]).map(toJobRow);
  const positions = (positionsRes.data ?? []) as RawLookupRow[];
  const specialties = (specialtiesRes.data ?? []) as RawLookupRow[];
  const subspecialties = ((subspecialtiesRes.data ?? []) as RawSubspecialtyRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    specialtyId: row.specialty_id,
  }));
  const states = (statesRes.data ?? []) as RawLookupRow[];
  const hospitals = ((hospitalsRes.data ?? []) as RawHospitalRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    stateId: row.state_id,
  }));

  return { data: { jobs, positions, specialties, subspecialties, states, hospitals }, error: null };
}

export type JobFetchResult =
  | { data: JobRow | null; error: null }
  | { data: null; error: string };

export async function fetchJobById(id: string): Promise<JobFetchResult> {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data ? toJobRow(data as unknown as RawJobRow) : null, error: null };
}

// The job's display title, e.g. "Cardiology Registrar". The subspecialty
// (when a job has one) stands in for the specialty, since it's the more
// specific description of what the job actually is — a job is never shown
// with both at once.
export function jobTitle(
  job: Pick<JobRow, "positionName" | "specialtyName" | "subspecialtyName">
): string {
  return `${job.subspecialtyName ?? job.specialtyName} ${job.positionName}`;
}

export function jobLocation(job: Pick<JobRow, "hospitalName" | "stateName">): string {
  return `${job.hospitalName}, ${job.stateName}`;
}
