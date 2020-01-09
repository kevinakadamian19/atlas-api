ALTER TABLE atlas_lifts
    DROP COLUMN event_id;

ALTER TABLE atlas_athletes
    DROP COLUMN event_id;

DROP TABLE IF EXISTS atlas_events;