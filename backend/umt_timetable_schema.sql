-- UMT Sialkot Campus Timetable Schema
-- Run this FIRST in pgAdmin, then run your full data SQL file

DROP TABLE IF EXISTS iqbal_campus_timetable;
CREATE TABLE iqbal_campus_timetable (
    id               SERIAL PRIMARY KEY,
    group_header     TEXT,
    program          TEXT,
    merged_programs  TEXT,
    course_code      TEXT,
    course_title     TEXT,
    credit_hours     TEXT,
    section          TEXT,
    batch            TEXT,
    strength         TEXT,
    resource_person  TEXT,
    classroom        TEXT,
    mon              TEXT,
    tue              TEXT,
    wed              TEXT,
    thu              TEXT,
    fri              TEXT,
    sat              TEXT,
    sun              TEXT,
    created_at       TIMESTAMP DEFAULT NOW()
);

DROP TABLE IF EXISTS city_campus_timetable;
CREATE TABLE city_campus_timetable (
    id               SERIAL PRIMARY KEY,
    group_header     TEXT,
    program          TEXT,
    merged_programs  TEXT,
    course_code      TEXT,
    course_title     TEXT,
    credit_hours     TEXT,
    section          TEXT,
    batch            TEXT,
    strength         TEXT,
    resource_person  TEXT,
    classroom        TEXT,
    mon              TEXT,
    tue              TEXT,
    wed              TEXT,
    thu              TEXT,
    fri              TEXT,
    sat              TEXT,
    sun              TEXT,
    created_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iqbal_course_code ON iqbal_campus_timetable (course_code);
CREATE INDEX IF NOT EXISTS idx_iqbal_program ON iqbal_campus_timetable (program);
CREATE INDEX IF NOT EXISTS idx_iqbal_resource_person ON iqbal_campus_timetable (resource_person);

CREATE INDEX IF NOT EXISTS idx_city_course_code ON city_campus_timetable (course_code);
CREATE INDEX IF NOT EXISTS idx_city_program ON city_campus_timetable (program);
CREATE INDEX IF NOT EXISTS idx_city_resource_person ON city_campus_timetable (resource_person);
