-- Remove duplicate and missing set numbers within each user's exercise/day group.
WITH ranked_records AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, exercise_id, (recorded_at AT TIME ZONE 'Asia/Tokyo')::DATE
      ORDER BY recorded_at, created_at, id
    ) AS normalized_set_order
  FROM training_records
)
UPDATE training_records AS records
SET
  set_order = ranked_records.normalized_set_order,
  updated_at = NOW()
FROM ranked_records
WHERE records.id = ranked_records.id
  AND records.set_order <> ranked_records.normalized_set_order;
