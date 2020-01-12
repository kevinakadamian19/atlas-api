ALTER TABLE atlas_lifts
    DROP COLUMN competition;

ALTER TABLE atlas_athletes
    DROP COLUMN competition;

DROP TABLE IF EXISTS atlas_competitions;