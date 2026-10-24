-- 00-base.sql : Oracle-11g-compat layer for PGlite (PostgreSQL 18.6 in WASM), part 1 of 8.  No orafce needed.
-- The compat files 00-base .. 70-ddl are loaded in file-name order; a later file may use anything an earlier one defines.
-- Everything lives in schema public; the session MUST run with
--     SET search_path = public, pg_catalog;      (public FIRST, so our functions/operators shadow the builtins
--     SET TIME ZONE 'UTC';                        with identical signatures)
-- Statements are separated with the marker line "--;;" so a JS loader can split without a SQL parser.
-- Design notes:
--   DATE columns are timestamp(0).  Oracle DATE - DATE = NUMBER of days  -> operator override below.
--   Fixed "today" lives in table ora_clock (set by createEngine, default 2026-10-26 14:30:00); rewriter maps SYSDATE & co. to ora_sysdate().
--   CHAR(n) -> char(n).  Oracle keeps blank padding when CHAR flows into LENGTH/UPPER/||/etc.; PG strips it on
--   every bpchar->text cast, so bpchar overloads below restore it (helper ora_p).
--   '' = NULL (Oracle): handled in the REWRITER ('' literal -> NULL) and by nullif(...,'') in the string functions.

SET TIME ZONE 'UTC';
--;;
SET search_path = public, pg_catalog;
--;;
SET DateStyle = 'ISO, DMY';
--;;

-- ---------------------------------------------------------------- clock + DUAL
CREATE TABLE ora_clock(d timestamp NOT NULL);
--;;
INSERT INTO ora_clock VALUES (timestamp '2026-10-26 14:30:00');
--;;
CREATE FUNCTION ora_sysdate() RETURNS timestamp LANGUAGE sql STABLE AS $$ SELECT d FROM ora_clock LIMIT 1 $$;
--;;
CREATE FUNCTION ora_systimestamp() RETURNS timestamptz LANGUAGE sql STABLE AS $$ SELECT d AT TIME ZONE 'UTC' FROM ora_clock LIMIT 1 $$;
--;;
CREATE TABLE dual(dummy varchar(1));
--;;
INSERT INTO dual VALUES ('X');
--;;

-- ---------------------------------------------------------------- helpers
-- blank-padded text of a CHAR(n) value (what Oracle keeps)
CREATE FUNCTION ora_p(b bpchar) RETURNS text LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN b IS NULL THEN NULL
       ELSE pg_catalog.concat(b::text, repeat(' ', octet_length(b) - octet_length(b::text))) END $$;
--;;
-- Oracle NUMBER -> VARCHAR2 : no trailing zeros, no leading zero before the decimal point
CREATE FUNCTION ora_n2t(n numeric) RETURNS text LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN n IS NULL THEN NULL ELSE
     regexp_replace(
       CASE WHEN n::text LIKE '%.%' THEN rtrim(rtrim(n::text,'0'),'.') ELSE n::text END,
       '^(-?)0\.', '\1.') END $$;
--;;
-- Oracle timestamp -> VARCHAR2 with default NLS_DATE_FORMAT DD-MON-RR
CREATE FUNCTION ora_d2t(d timestamp) RETURNS text LANGUAGE sql IMMUTABLE AS
$$ SELECT pg_catalog.to_char(d,'DD-MON-YY') $$;
--;;
