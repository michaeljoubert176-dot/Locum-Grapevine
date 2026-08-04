-- ============================================================================
-- Migration: review_shifts — store shift times instead of hours
-- ============================================================================
--
-- Run this against the live Supabase database AFTER merging the PR that
-- updates supabase/schema.sql to match.
--
-- Replaces review_shifts.rostered_hours and .actual_hours (numeric) with
-- four time columns: rostered_start, rostered_finish, actual_start,
-- actual_finish. Hours are no longer stored as input — the app derives
-- them from these times where needed (e.g. for the hourly rate
-- calculation, or the Roster drill-in's displayed hours).
--
-- Existing rows are backfilled from their current rostered_hours/
-- actual_hours values (assuming an 08:00 start) so there's still sensible
-- data to display immediately — adjust the actual test values afterwards
-- as needed, same as the Build A backfill.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Add the new time columns (nullable for now, so existing rows can be
--    backfilled before they're made required)
-- ----------------------------------------------------------------------------

alter table review_shifts
  add column rostered_start time,
  add column rostered_finish time,
  add column actual_start time,
  add column actual_finish time;


-- ----------------------------------------------------------------------------
-- 2. Backfill from the existing hours columns
-- ----------------------------------------------------------------------------
-- Assumes an 08:00 start for both rostered and actual, then adds the
-- existing hours figure to get a finish time. This preserves whatever
-- "busier than advertised" signal already exists (actual_hours >
-- rostered_hours) as a start/finish gap instead. For example, a row with
-- rostered_hours = 8.5 and actual_hours = 11.5 backfills to rostered
-- 08:00-16:30 and actual 08:00-19:30.

update review_shifts
set
  rostered_start = time '08:00',
  rostered_finish = (time '08:00' + make_interval(mins => round(rostered_hours * 60)::int))::time,
  actual_start = time '08:00',
  actual_finish = (time '08:00' + make_interval(mins => round(actual_hours * 60)::int))::time;


-- ----------------------------------------------------------------------------
-- 3. Make the new columns required, drop the old hours columns
-- ----------------------------------------------------------------------------

alter table review_shifts
  alter column rostered_start set not null,
  alter column rostered_finish set not null,
  alter column actual_start set not null,
  alter column actual_finish set not null;

alter table review_shifts
  drop column rostered_hours,
  drop column actual_hours;
