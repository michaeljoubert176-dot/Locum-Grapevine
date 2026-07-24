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
-- There are four tables:
--   1. categories     — the state → hospital → specialty → subspecialty →
--                        role tree that everything else hangs off.
--   2. agencies       — the fixed list of locum agencies people can pick
--                        from when leaving a review.
--   3. reviews        — the actual reviews locums leave about a specific
--                        role.
--   4. bonus_answers  — answers to optional "bonus" questions attached to
--                        a review.
--
-- This file only defines the *structure* of the database. It does not turn
-- on any security rules (who is allowed to read/write what) — that will be
-- handled in a later phase. It also does not install or connect to
-- anything by itself; it's just a set of instructions ready to be run
-- against a Supabase/Postgres database when the team is ready.
-- ============================================================================


-- ============================================================================
-- 1. CATEGORIES — the browsing tree
-- ============================================================================
--
-- In plain language: this is one table that holds every "thing you can
-- browse to" on the site, arranged like a folder tree. For example:
--
--   Victoria (state)
--     └─ Royal Melbourne Hospital (hospital)
--          └─ Medicine (specialty)
--               └─ Cardiology (subspecialty)
--                    └─ Cardiology Registrar (role)
--
-- but also, in the same table:
--
--   Victoria (state)
--     └─ Royal Melbourne Hospital (hospital)
--          └─ Emergency (specialty)
--               └─ Emergency Registrar (role)     <- no subspecialty step!
--
-- Why one table instead of a separate table for states, a separate table
-- for hospitals, etc.? Because the real world isn't consistent — some
-- departments have a subspecialty step and some don't, and new levels or
-- exceptions will keep coming up. Rather than redesigning the database
-- every time reality doesn't fit a fixed number of layers, every row
-- simply points at its parent row, and the tree can bend however it needs
-- to. A row with no parent is a top-level "state".
--
-- Every row says what kind of thing it is (its "level"), and — except for
-- states, which sit at the very top — which row is "above" it in the tree
-- (its "parent"). Reviews always attach to a row where level = 'role',
-- i.e. the most specific, bottom-of-the-tree entry.
-- ============================================================================

create table categories (
  -- A unique internal ID for this row, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- The human-readable name of this entry, e.g. "Victoria",
  -- "Royal Melbourne Hospital", "Cardiology", "Cardiology Registrar".
  name text not null,

  -- Which row is this one "underneath" in the tree? For example, the
  -- "Cardiology" row's parent_id would point at the "Medicine" row.
  -- This is left empty (null) only for states, which are the top of the
  -- tree and have nothing above them.
  parent_id uuid references categories (id),

  -- What kind of entry this row represents. Every row must be exactly one
  -- of these five kinds, listed here in tree order from top to bottom.
  level text not null check (
    level in ('state', 'hospital', 'specialty', 'subspecialty', 'role')
  )
);

-- Speeds up the very common question "what are the children of this
-- category?" (e.g. "show me every hospital in Victoria", or "show me
-- every specialty at Royal Melbourne Hospital"). Without this index,
-- finding a row's children means scanning the whole table.
create index categories_parent_id_idx on categories (parent_id);


-- ============================================================================
-- 2. AGENCIES — the list of locum agencies
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

  -- The agency's name, e.g. "Omega Medical Locums". Names must be unique
  -- so the same agency can't accidentally be added twice.
  name text not null unique
);


-- ============================================================================
-- 3. REVIEWS — what locums actually say about a role
-- ============================================================================
--
-- In plain language: each row here is one review, written by one locum,
-- about one specific role (e.g. "Cardiology Registrar at Royal Melbourne
-- Hospital"). It covers three kinds of information:
--
--   a) Nine core "yes/no-ish" question scores (1 to 5, like a star
--      rating) — things like "would you work here again?" and "did you
--      feel safe?".
--   b) Two "gradient" scores (also 1 to 5) that describe *how much* of
--      something there was, rather than whether it was good or bad —
--      e.g. workload_intensity of 1 might mean very light, 5 very heavy.
--   c) Plain facts about the job — pay, roster type, shift times,
--      whether a car/accommodation/flights were provided, and so on.
--
-- Plus two optional free-text boxes for anything that doesn't fit into a
-- score or a fact, and a timestamp recording when the review was posted.
-- ============================================================================

create table reviews (
  -- A unique internal ID for this review, generated automatically.
  id uuid primary key default gen_random_uuid(),

  -- Which role this review is about. This must point at a row in
  -- `categories` whose level is 'role' (e.g. "Cardiology Registrar") —
  -- reviews are never attached to a whole hospital or specialty directly,
  -- only to a specific role within it.
  role_id uuid not null references categories (id),

  -- --------------------------------------------------------------------
  -- Core question scores — nine questions, each answered on a 1–5 scale
  -- (1 = strongly disagree/worst, 5 = strongly agree/best).
  -- --------------------------------------------------------------------

  -- "Overall, was this a good job?"
  overall_good_job smallint not null check (overall_good_job between 1 and 5),

  -- "Would you work this role again?"
  would_work_again smallint not null check (would_work_again between 1 and 5),

  -- "Would you recommend this role to another locum?"
  would_recommend smallint not null check (would_recommend between 1 and 5),

  -- "How much supervision did you need?" (kept as a core question, even
  -- though it reads a bit like an intensity scale, per the site's fixed
  -- nine-question review format.)
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
  -- Descriptive gradient scores — these describe the *degree* of
  -- something (light-to-heavy), not whether it was good or bad.
  -- --------------------------------------------------------------------

  -- How intense/heavy the workload felt, from 1 (very light) to
  -- 5 (very heavy).
  workload_intensity smallint not null check (workload_intensity between 1 and 5),

  -- How much hands-on supervision was actually provided, from 1 (very
  -- little oversight, worked independently) to 5 (very closely
  -- supervised).
  supervision_intensity smallint not null check (supervision_intensity between 1 and 5),

  -- --------------------------------------------------------------------
  -- Facts about the job — plain, objective details rather than opinions.
  -- --------------------------------------------------------------------

  -- Whether the roster (shift schedule) was fixed (same shifts every
  -- week) or rotating (shifts change week to week).
  roster_type text not null check (roster_type in ('fixed', 'rotating')),

  -- The typical shift times, written as free text since rosters vary a
  -- lot between hospitals (e.g. "7am–5pm weekdays" or "10-hour rotating
  -- shifts including nights").
  shift_times text,

  -- What after-hours / on-call work looked like, as free text (e.g.
  -- "1 in 4 on-call weekends" or "no after-hours work required").
  after_hours text,

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

  -- Which agency placed the locum in this role, if any. Left empty
  -- (null) for direct-hire roles with no agency involved.
  agency_id uuid references agencies (id),

  -- Whether a car was provided as part of the placement.
  car_provided boolean not null default false,

  -- Whether accommodation was provided as part of the placement.
  accommodation_provided boolean not null default false,

  -- Whether flights were provided as part of the placement.
  flights_provided boolean not null default false,

  -- --------------------------------------------------------------------
  -- Free text — optional, open-ended fields.
  -- --------------------------------------------------------------------

  -- An optional field where the reviewer can note the ID of the person
  -- who orientated/inducted them, if they know it and want to give
  -- credit (e.g. "the registrar who did my induction, Sarah W.").
  wish_id_known text,

  -- Any other feedback that doesn't fit into the questions above.
  other_feedback text,

  -- --------------------------------------------------------------------
  -- Bookkeeping.
  -- --------------------------------------------------------------------

  -- When this review was submitted. Filled in automatically.
  created_at timestamptz not null default now()
);

-- Speeds up the very common question "show me all the reviews for this
-- role" (e.g. a role's page listing every review left about it). Without
-- this index, finding a role's reviews means scanning the whole table.
create index reviews_role_id_idx on reviews (role_id);


-- ============================================================================
-- 4. BONUS_ANSWERS — optional extra questions attached to a review
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
