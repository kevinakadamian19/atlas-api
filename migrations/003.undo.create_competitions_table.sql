ALTER TABLE atlas_athletes
    DROP COLUMN competition_id;

ALTER TABLE atlas_lifts
    DROP COLUMN competition_id;

DROP TABLE IF EXISTS atlas_competitions;