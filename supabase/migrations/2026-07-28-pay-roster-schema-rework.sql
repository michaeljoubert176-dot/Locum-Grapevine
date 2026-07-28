-- ============================================================================
-- Migration: Pay / Roster / Duties schema rework (Build A)
-- ============================================================================
--
-- Run this against the live Supabase database AFTER merging the PR that
-- updates supabase/schema.sql to match. It brings the live database in line
-- with the new schema:
--
--   1. Creates the new `review_shifts` table (per review, per shift type:
--      rate_amount, rostered_hours, actual_hours), with RLS enabled and an
--      unrestricted public read policy, matching every other table.
--   2. Backfills a `review_shifts` row for each existing review (test data
--      only), so nothing is left with zero shift rows.
--   3. Adds the new `reviews` columns: accommodation_hospital_available,
--      accommodation_private_available, weekends_required.
--   4. Backfills the new accommodation columns from the old
--      accommodation_provided flag as a starting point.
--   5. Drops the old `reviews` columns: pay_amount, pay_unit,
--      night_rate_differs, night_pay_amount, shift_times, after_hours,
--      accommodation_provided.
--
-- This uses ALTER TABLE (not drop-and-recreate) for the `reviews` table so
-- that the existing foreign keys from `review_duties` and `bonus_answers`
-- are left intact.
--
-- Per the spec: there's no real data to preserve here (test rows only), so
-- the backfilled review_shifts rows and accommodation booleans are just
-- sensible placeholders — adjust the actual test values afterwards as
-- needed.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. New table: review_shifts
-- ----------------------------------------------------------------------------

create table review_shifts (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews (id) on delete cascade,
  shift_type_id uuid not null references shift_types (id),
  rate_amount numeric(10, 2) not null,
  rostered_hours numeric(5, 2) not null,
  actual_hours numeric(5, 2) not null,
  unique (review_id, shift_type_id)
);

create index review_shifts_review_id_idx on review_shifts (review_id);
create index review_shifts_shift_type_id_idx on review_shifts (shift_type_id);

alter table review_shifts enable row level security;

create policy "Public can read review_shifts" on review_shifts
  for select using (true);


-- ----------------------------------------------------------------------------
-- 2. Backfill review_shifts for existing (test) reviews
-- ----------------------------------------------------------------------------
-- One row per existing review, using its old flat pay_amount as the
-- rate_amount, an 8-hour rostered/actual placeholder, and "Regular day" as
-- the shift type (falling back to whatever shift type sorts first if
-- "Regular day" isn't in shift_types). Skipped entirely if there are no
-- shift_types rows to attach to.

insert into review_shifts (review_id, shift_type_id, rate_amount, rostered_hours, actual_hours)
select
  r.id,
  coalesce(
    (select id from shift_types where name = 'Regular day' limit 1),
    (select id from shift_types order by name limit 1)
  ),
  coalesce(r.pay_amount, 0),
  8,
  8
from reviews r
where not exists (select 1 from review_shifts rs where rs.review_id = r.id)
  and exists (select 1 from shift_types);


-- ----------------------------------------------------------------------------
-- 3. Add new reviews columns
-- ----------------------------------------------------------------------------

alter table reviews
  add column accommodation_hospital_available boolean not null default false,
  add column accommodation_private_available boolean not null default false,
  add column weekends_required boolean not null default false;


-- ----------------------------------------------------------------------------
-- 4. Backfill the new accommodation booleans from the old flag
-- ----------------------------------------------------------------------------
-- Best-effort starting point: treat the old single "accommodation was
-- provided" flag as "hospital accommodation was available". Adjust manually
-- afterwards for any test rows where that's not accurate.

update reviews set accommodation_hospital_available = accommodation_provided;


-- ----------------------------------------------------------------------------
-- 5. Drop old reviews columns
-- ----------------------------------------------------------------------------

alter table reviews
  drop column pay_amount,
  drop column pay_unit,
  drop column night_rate_differs,
  drop column night_pay_amount,
  drop column shift_times,
  drop column after_hours,
  drop column accommodation_provided;
