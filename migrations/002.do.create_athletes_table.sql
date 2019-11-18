CREATE TABLE atlas_athletes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    weight INTEGER NOT NULL,
    event INTEGER REFERENCES atlas_events(id) NOT NULL
)