-- ============================================================================
-- Locum Grapevine — Database Schema
-- ============================================================================
--
-- What is this file?
-- -------------------
-- This file describes the "shape" of the database: the tables, the columns
-- inside each table, and the rules about what kind of data each column can
-- hold. Think of each table as a spreadsheet — this file defines what
-- columns each spreadsheet has, and how the spreadsheets relate to each
-- other.
--
-- Why does this look different from the old schema?
-- ---------------------------------------------------
-- The old schema treated every job as one leaf at the bottom of a single
-- fixed tree: state -> hospital -> specialty -> subspecialty -> role. That
-- meant "Cardiology Registrar at Royal Melbourne Hospital" was one rigid
-- path with no other way to slice the data.
--
-- The new schema instead treats a job as the *combination* of several
-- independent, reusable choices:
--   - what position is it (RMO, Registrar, Fellow, Consultant, ...)
--   - what specialty (and, optionally, subspecialty)
--   - which hospital (and which state that hospital is in)
--
-- Each of those choices lives in its own small "lookup" table (a short,
-- controlled list — like a dropdown menu's options). A "job" is then just a
-- row that picks one option from each list. This is more flexible: it lets
-- the site filter and browse by any single attribute (e.g. "show me every
-- Registrar job", or "show me every Cardiology job", or "show me every job
-- at this hospital") instead of only being able to walk down one fixed path.
--
-- Tables in this file, roughly in the order they're defined:
--   Lookup (controlled list) tables:
--     1. positions      — job seniority/type, e.g. RMO, Registrar, Fellow.
--     2. specialties     — medical specialties, e.g. Medicine, Surgery.
--     3. subspecialties  — narrower specialties within a specialty.
--     4. states          — Australian states/territories.
--     5. hospitals        — hospitals, each in one state.
--     6. agencies         — locum agencies.
--     7. shift_types      — kinds of shift, e.g. Night, Weekend.
--     8. duties           — things a reviewer can tick as part of a shift.
--   Core tables:
--     9. jobs             — a specific combination of position + specialty
--                            (+ optional subspecialty) + hospital.
--    10. reviews          — a review a locum leaves about a job.
--    11. review_duties    — which (shift type, duty) pairs a review ticked.
--    12. bonus_answers    — optional extra question answers on a review.
--
-- This file only defines the *structure* of the database, and turns on
-- baseline security (Row Level Security with public read-only access — see
-- the notes near the bottom). It does not install or connect to anything by
-- itself; it's just a set of instructions ready to be run against a
-- Supabase/Postgres database.
-- ============================================================================


-- ============================================================================
-- 0. REMOVE THE OLD TABLES
-- ============================================================================
--
-- In plain language: before building the new structure, we clear away the
-- old one. `drop table if exists ... cascade` means "delete this table,
-- and also delete anything else that depends on it (like indexes or
-- policies) — but don't complain if the table doesn't exist."
--
-- This is destructive: any data currently sitting in these tables will be
-- permanently lost when this file is run. That's expected here, since this
-- file represents a full redesign of the database, not an incremental
-- change.
-- ============================================================================

drop table if exists bonus_answers cascade;
drop table if exists reviews cascade;
drop table if exists agencies cascade;
drop table if exists categories cascade;


-- ============================================================================
-- 1. POSITIONS — the flat list of job seniority/types
-- ============================================================================
--
-- In plain language: a short, controlled list of the "levels" a doctor's job
-- can be at, independent of specialty or hospital — e.g. RMO, Registrar,
-- Advanced Trainee, Fellow, Consultant. Every job picks exactly one of
-- these.
-- ============================================================================

create table positions (
  -- A unique internal ID for this position, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- The position's name, e.g. "Registrar". Must be unique so the same
  -- position can't accidentally be added twice.
  name text not null unique
);


-- ============================================================================
-- 2. SPECIALTIES — the list of medical specialties
-- ============================================================================
--
-- In plain language: a short, controlled list of medical specialties, e.g.
-- "Medicine", "Surgery", "Emergency". Every job picks exactly one.
-- ============================================================================

create table specialties (
  -- A unique internal ID for this specialty, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- The specialty's name, e.g. "Emergency Medicine". Must be unique.
  name text not null unique
);


-- ============================================================================
-- 3. SUBSPECIALTIES — narrower specialties within a specialty
-- ============================================================================
--
-- In plain language: some specialties break down further, e.g. "Medicine"
-- contains "Cardiology" and "Respiratory". Each subspecialty belongs to
-- exactly one parent specialty. Not every job has a subspecialty — it's
-- optional (see the `jobs` table below).
-- ============================================================================

create table subspecialties (
  -- A unique internal ID for this subspecialty, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- The subspecialty's name, e.g. "Cardiology".
  name text not null,

  -- Which specialty this subspecialty belongs to, e.g. "Cardiology"
  -- belongs to "Medicine". Required — every subspecialty must sit under
  -- exactly one specialty.
  specialty_id uuid not null references specialties (id),

  -- The same subspecialty name shouldn't be added twice under the same
  -- specialty (e.g. two "Cardiology" rows both under "Medicine").
  unique (specialty_id, name)
);

-- Speeds up "show me every subspecialty under this specialty" (e.g.
-- populating a subspecialty dropdown once a specialty has been chosen).
create index subspecialties_specialty_id_idx on subspecialties (specialty_id);


-- ============================================================================
-- 4. STATES — Australian states/territories
-- ============================================================================
--
-- In plain language: a short, controlled list of states, e.g. "Victoria",
-- "New South Wales". Every hospital belongs to exactly one state.
-- ============================================================================

create table states (
  -- A unique internal ID for this state, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- The state's name, e.g. "Victoria". Must be unique.
  name text not null unique
);


-- ============================================================================
-- 5. HOSPITALS — the list of hospitals
-- ============================================================================
--
-- In plain language: a short, controlled list of hospitals, each tagged
-- with the state it's in, so the site can, for example, list every
-- hospital in Victoria.
-- ============================================================================

create table hospitals (
  -- A unique internal ID for this hospital, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- The hospital's name, e.g. "Royal Melbourne Hospital".
  name text not null,

  -- Which state this hospital is in. Required — every hospital must sit
  -- under exactly one state.
  state_id uuid not null references states (id),

  -- The same hospital name shouldn't be added twice under the same state.
  unique (state_id, name)
);

-- Speeds up "show me every hospital in this state" (e.g. populating a
-- hospital dropdown once a state has been chosen).
create index hospitals_state_id_idx on hospitals (state_id);


-- ============================================================================
-- 6. AGENCIES — the list of locum agencies
-- ============================================================================
--
-- In plain language: a short, controlled list of locum agencies (the
-- companies that place doctors into locum jobs), so that when someone
-- leaves a review they pick an agency from a dropdown instead of typing
-- the name freehand. This keeps things consistent — it avoids ending up
-- with "Locum Co", "LocumCo", and "locum co." all being treated as
-- different agencies.
-- ============================================================================

create table agencies (
  -- A unique internal ID for this agency, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- The agency's name, e.g. "Omega Medical Locums". Must be unique.
  name text not null unique
);


-- ============================================================================
-- 7. SHIFT_TYPES — the kinds of shift a review can describe
-- ============================================================================
--
-- In plain language: a short, controlled list of shift kinds, e.g.
-- "Regular day", "Long day", "Evening", "Night", "Weekend", "On-call
-- off-site". A single review can describe several different shift types
-- (see `review_duties` below), since one job often involves a mix of
-- shifts.
-- ============================================================================

create table shift_types (
  -- A unique internal ID for this shift type, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- The shift type's name, e.g. "Night". Must be unique.
  name text not null unique
);


-- ============================================================================
-- 8. DUTIES — the list of duties a reviewer can tick off
-- ============================================================================
--
-- In plain language: a short, controlled list of duties/tasks that might
-- come up during a shift, e.g. "Cannulation", "Ward cover", "Code blue
-- response". Reviewers tick which duties applied to which shift type (see
-- `review_duties` below).
--
-- A duty can optionally be tagged with a specialty. This is purely a menu
-- convenience — it tells the review form "when someone is reviewing a
-- Cardiology job, show this duty near the top of the list" so the list of
-- duties on screen is shorter and more relevant. It is NOT a rule about
-- which duties are allowed for which jobs, and it is NOT a way for a duty
-- to "inherit" anything — a duty with no specialty tag (specialty_id is
-- null) is a general duty available to every job, and even a
-- specialty-tagged duty can still be selected on a review for a job in a
-- different specialty if needed.
-- ============================================================================

create table duties (
  -- A unique internal ID for this duty, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- The duty's name, e.g. "Cannulation".
  name text not null,

  -- Which specialty's review form this duty should be highlighted on, if
  -- any. Left empty (null) for general duties that aren't specific to one
  -- specialty. Again: this only affects which menu the duty is easy to
  -- find in — it does not restrict or imply anything else.
  specialty_id uuid references specialties (id)
);

-- Speeds up "show me the duties tagged for this specialty" when building
-- the review form's duty menu.
create index duties_specialty_id_idx on duties (specialty_id);


-- ============================================================================
-- 9. JOBS — a specific combination of position + specialty + hospital
-- ============================================================================
--
-- In plain language: a "job" is one specific combination of choices — for
-- example, "Registrar, Cardiology (under Medicine), at Royal Melbourne
-- Hospital". Reviews are always attached to a job, never directly to a
-- hospital or specialty on their own.
--
-- The same combination of position + specialty + subspecialty + hospital
-- should only ever exist as one row — otherwise reviews for what is really
-- the same job could end up split across two different "jobs" rows.
-- ============================================================================

create table jobs (
  -- A unique internal ID for this job, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- The seniority/type of this job, e.g. "Registrar". Required.
  position_id uuid not null references positions (id),

  -- The specialty this job is in, e.g. "Medicine". Required.
  specialty_id uuid not null references specialties (id),

  -- The subspecialty this job is in, e.g. "Cardiology", if applicable.
  -- Left empty (null) when the job doesn't have a subspecialty (e.g. a
  -- general Emergency Medicine job).
  subspecialty_id uuid references subspecialties (id),

  -- Which hospital this job is at. Required.
  hospital_id uuid not null references hospitals (id),

  -- When this job entry was first created. Filled in automatically.
  created_at timestamptz not null default now()
);

-- The following indexes each speed up filtering jobs by a single
-- attribute, e.g. "show me every job that's a Registrar role", or "show me
-- every job at this hospital" — the kinds of filters the browse/search
-- pages need.
create index jobs_position_id_idx on jobs (position_id);
create index jobs_specialty_id_idx on jobs (specialty_id);
create index jobs_subspecialty_id_idx on jobs (subspecialty_id);
create index jobs_hospital_id_idx on jobs (hospital_id);

-- Prevents the exact same combination of position + specialty +
-- subspecialty + hospital being entered as two separate jobs — otherwise
-- reviews for what is really the same job could end up split across two
-- different "jobs" rows. A plain `unique` constraint wouldn't work here:
-- Postgres treats two nulls as *different* values, so two jobs that both
-- have no subspecialty (subspecialty_id = null) would slip past a plain
-- unique constraint and create duplicates. Wrapping subspecialty_id in
-- `coalesce(..., '00000000-0000-0000-0000-000000000000')` swaps a null
-- subspecialty for a fixed placeholder value, so two "no subspecialty"
-- jobs with the same position/specialty/hospital are correctly treated as
-- duplicates and rejected.
create unique index jobs_unique_combination_idx on jobs (
  position_id,
  specialty_id,
  hospital_id,
  coalesce(subspecialty_id, '00000000-0000-0000-0000-000000000000'::uuid)
);


-- ============================================================================
-- 10. REVIEWS — what locums actually say about a job
-- ============================================================================
--
-- In plain language: each row here is one review, written by one locum,
-- about one specific job (e.g. "Cardiology Registrar at Royal Melbourne
-- Hospital"). It covers:
--
--   a) Nine core question scores (1 to 5, like a star rating) — things
--      like "would you work here again?" and "did you feel safe?".
--   b) Pay details — the rate, whether nights pay differently, whether
--      it's hourly or a fixed shift rate, and whether overtime is paid.
--   c) Plain facts about the job — whether a car/accommodation/flights
--      were provided, what the shift times and after-hours load were
--      like, what systems the hospital uses for notes and medication
--      charts, and the dates worked.
--   d) Two optional free-text boxes for anything that doesn't fit into a
--      score or a fact.
-- ============================================================================

create table reviews (
  -- A unique internal ID for this review, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- Which job this review is about.
  job_id uuid not null references jobs (id),

  -- When this review was submitted. Filled in automatically.
  created_at timestamptz not null default now(),

  -- --------------------------------------------------------------------
  -- Core question scores — nine questions, each answered on a 1–5 scale
  -- (1 = strongly disagree/worst, 5 = strongly agree/best).
  -- --------------------------------------------------------------------

  -- "Overall, was this a good job?"
  overall_good_job smallint not null check (overall_good_job between 1 and 5),

  -- "Would you work this job again?"
  would_work_again smallint not null check (would_work_again between 1 and 5),

  -- "Would you recommend this job to another locum?"
  would_recommend smallint not null check (would_recommend between 1 and 5),

  -- "I received the supervision I needed" — agree/disagree, from
  -- 1 (strongly disagree) to 5 (strongly agree).
  supervision_needed smallint not null check (supervision_needed between 1 and 5),

  -- "Did you feel safe doing this job?"
  felt_safe smallint not null check (felt_safe between 1 and 5),

  -- "Was the workload manageable?"
  workload_manageable smallint not null check (workload_manageable between 1 and 5),

  -- "Was the information you were given beforehand accurate?"
  information_accurate smallint not null check (information_accurate between 1 and 5),

  -- "Did the team make you feel welcome?"
  felt_welcome smallint not null check (felt_welcome between 1 and 5),

  -- "Were you paid correctly and on time?"
  paid_correctly smallint not null check (paid_correctly between 1 and 5),

  -- --------------------------------------------------------------------
  -- Pay details.
  -- --------------------------------------------------------------------

  -- The pay rate. Paired with pay_unit below to say whether this is a
  -- rate "per hour" or "per day". Uses a decimal-friendly type so cents
  -- aren't lost.
  pay_amount numeric(10, 2) not null,

  -- Whether pay_amount is a rate per hour or per day.
  pay_unit text not null check (pay_unit in ('hour', 'day')),

  -- Whether the pay rate is different for night shifts.
  night_rate_differs boolean not null default false,

  -- The night-shift pay rate, if it differs from the standard rate. Left
  -- empty (null) when night_rate_differs is false, or when it's simply
  -- not known.
  night_pay_amount numeric(10, 2),

  -- Whether pay is worked out hourly, or as a fixed rate per shift
  -- regardless of how long the shift runs.
  rate_type text not null check (rate_type in ('hourly', 'fixed_shift_rate')),

  -- Whether overtime worked beyond the rostered shift was paid.
  overtime_paid boolean not null default false,

  -- Which agency placed the locum in this job, if any. Left empty (null)
  -- for direct-hire jobs with no agency involved.
  agency_id uuid references agencies (id),

  -- --------------------------------------------------------------------
  -- Facts about the job — plain, objective details rather than opinions.
  -- --------------------------------------------------------------------

  -- Whether a car was provided as part of the placement.
  car_provided boolean not null default false,

  -- Whether accommodation was provided as part of the placement.
  accommodation_provided boolean not null default false,

  -- Whether flights were provided as part of the placement.
  flights_provided boolean not null default false,

  -- How good the provided accommodation was, from 1 (poor) to 5
  -- (excellent). Only meaningful — and only expected to be filled in —
  -- when accommodation_provided is true; left empty (null) otherwise.
  accommodation_quality smallint check (accommodation_quality between 1 and 5),

  -- The typical shift times, written as free text since rosters vary a
  -- lot between hospitals (e.g. "7am–5pm weekdays" or "10-hour rotating
  -- shifts including nights").
  shift_times text,

  -- What after-hours / on-call work looked like, as free text (e.g.
  -- "1 in 4 on-call weekends" or "no after-hours work required").
  after_hours text,

  -- What system the hospital uses for clinical notes — fully on paper,
  -- a fully electronic medical record (iEMR), or a mix of both. Left
  -- empty (null) if the reviewer doesn't know or skips this fact.
  notes_system text check (notes_system in ('paper', 'iemr', 'hybrid')),

  -- What system the hospital uses for medication charts — paper,
  -- electronic, or a hybrid of both. Left empty (null) if the reviewer
  -- doesn't know or skips this fact.
  med_charts text check (med_charts in ('paper', 'electronic', 'hybrid')),

  -- The date the locum's placement in this job started. Left empty
  -- (null) if not provided.
  worked_from date,

  -- The date the locum's placement in this job ended. Left empty (null)
  -- for placements that are still ongoing, or simply not provided.
  worked_to date,

  -- --------------------------------------------------------------------
  -- Free text — optional, open-ended fields.
  -- --------------------------------------------------------------------

  -- Answer to "What do you wish you'd known about this job before you
  -- accepted it?" — optional.
  wish_youd_known text,

  -- Any other feedback that doesn't fit into the questions above.
  other_feedback text
);

-- Speeds up the very common question "show me all the reviews for this
-- job" (e.g. a job's page listing every review left about it). Without
-- this index, finding a job's reviews means scanning the whole table.
create index reviews_job_id_idx on reviews (job_id);

-- Speeds up "which agency was used for this review" style lookups, e.g.
-- when showing agency-level statistics.
create index reviews_agency_id_idx on reviews (agency_id);


-- ============================================================================
-- 11. REVIEW_DUTIES — which (shift type, duty) pairs a review ticked
-- ============================================================================
--
-- In plain language: while filling in a review, a locum can say "on Night
-- shifts, I did Cannulation and Ward cover; on Weekend shifts, I did Ward
-- cover and Code blue response". Each of those individual pairings — one
-- shift type plus one duty — becomes its own row here, all linked back to
-- the same review. A single review can have many rows, since it can cover
-- many shift types and many duties per shift type.
-- ============================================================================

create table review_duties (
  -- A unique internal ID for this row, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- Which review this duty entry belongs to. If the review is deleted,
  -- its duty entries are deleted along with it.
  review_id uuid not null references reviews (id) on delete cascade,

  -- Which shift type this duty was performed on, e.g. "Night".
  shift_type_id uuid not null references shift_types (id),

  -- Which duty was performed, e.g. "Cannulation".
  duty_id uuid not null references duties (id)
);

-- Speeds up "show me all the ticked (shift type, duty) pairs for this
-- review" (e.g. when displaying a full review).
create index review_duties_review_id_idx on review_duties (review_id);

-- Speeds up statistics questions like "how often is this duty ticked
-- across all reviews" or "how often does this shift type come up".
create index review_duties_shift_type_id_idx on review_duties (shift_type_id);
create index review_duties_duty_id_idx on review_duties (duty_id);


-- ============================================================================
-- 12. BONUS_ANSWERS — optional extra questions attached to a review
-- ============================================================================
--
-- In plain language: besides the fixed set of questions every review
-- answers, the site sometimes shows a locum a few extra "bonus"
-- questions — for example, ones specific to a particular specialty, or
-- new questions the team wants to try out. Rather than adding a new
-- database column every single time a new bonus question is dreamed up
-- (which would mean changing this schema file and the database every
-- time), each bonus answer is just stored as a "question key + answer"
-- pair pointing back at the review it belongs to.
--
-- For example, a review might have two rows here:
--   question_key = "handover_quality",   answer_value = "4"
--   question_key = "parking_available",  answer_value = "true"
--
-- This means brand-new bonus questions can be introduced at any time
-- just by using a new question_key — no schema changes required.
-- ============================================================================

create table bonus_answers (
  -- A unique internal ID for this answer, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- Which review this bonus answer belongs to. If the review is deleted,
  -- its bonus answers are deleted along with it.
  review_id uuid not null references reviews (id) on delete cascade,

  -- Which bonus question this is answering, e.g. "handover_quality".
  -- This is free text (not a fixed list) precisely so new questions can
  -- be added without changing the database structure.
  question_key text not null,

  -- The answer given, stored as text so it can hold whatever shape of
  -- answer that particular bonus question needs (a number, a word like
  -- "true"/"false", a short sentence, etc.).
  answer_value text
);

-- Speeds up "show me all the bonus answers for this review" (e.g. when
-- displaying a full review, including its bonus question answers).
create index bonus_answers_review_id_idx on bonus_answers (review_id);


-- ============================================================================
-- ROW LEVEL SECURITY — who is allowed to read/write what
-- ============================================================================
--
-- In plain language: "Row Level Security" (RLS) is a Postgres feature that
-- lets us control, table by table, who can read or write which rows. Until
-- RLS is turned on for a table, Supabase locks it down by default so
-- nobody (other than an admin) can touch it.
--
-- Here, we turn RLS on for every table, then add one policy per table that
-- allows anyone (including anonymous website visitors) to *read* (select)
-- all rows — this is what lets the public site display positions,
-- specialties, hospitals, jobs, reviews, and so on.
--
-- We deliberately do NOT add any policies for inserting, updating, or
-- deleting rows yet. That means, for now, only requests made with a
-- privileged Supabase key (not the public site) can write data. Write
-- access will be designed and added in a later phase, once it's clear
-- exactly who should be allowed to submit what.
-- ============================================================================

alter table positions enable row level security;
alter table specialties enable row level security;
alter table subspecialties enable row level security;
alter table states enable row level security;
alter table hospitals enable row level security;
alter table agencies enable row level security;
alter table shift_types enable row level security;
alter table duties enable row level security;
alter table jobs enable row level security;
alter table reviews enable row level security;
alter table review_duties enable row level security;
alter table bonus_answers enable row level security;

create policy "Public can read positions" on positions
  for select using (true);

create policy "Public can read specialties" on specialties
  for select using (true);

create policy "Public can read subspecialties" on subspecialties
  for select using (true);

create policy "Public can read states" on states
  for select using (true);

create policy "Public can read hospitals" on hospitals
  for select using (true);

create policy "Public can read agencies" on agencies
  for select using (true);

create policy "Public can read shift_types" on shift_types
  for select using (true);

create policy "Public can read duties" on duties
  for select using (true);

create policy "Public can read jobs" on jobs
  for select using (true);

create policy "Public can read reviews" on reviews
  for select using (true);

create policy "Public can read review_duties" on review_duties
  for select using (true);

create policy "Public can read bonus_answers" on bonus_answers
  for select using (true);
