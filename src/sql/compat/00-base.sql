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
-- Session NLS state. The engine writes it for ALTER SESSION SET NLS_DATE_LANGUAGE / NLS_LANGUAGE / NLS_DATE_FORMAT; the name
-- tables are in 40-formats. datefmt is the format DATE <-> text conversions use when none is given.
CREATE TABLE ora_session(lang text NOT NULL, datefmt text NOT NULL);
--;;
INSERT INTO ora_session VALUES ('AMERICAN', 'DD-MON-RR');
--;;
CREATE FUNCTION ora_lang() RETURNS text LANGUAGE sql STABLE AS $$ SELECT lang FROM ora_session LIMIT 1 $$;
--;;
CREATE FUNCTION ora_datefmt() RETURNS text LANGUAGE sql STABLE AS $$ SELECT datefmt FROM ora_session LIMIT 1 $$;
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
-- Oracle NUMBER -> VARCHAR2 (TO_CHAR(n), n || 'x', CAST(n AS VARCHAR2(k)) ...): the text the result grid shows for the number
-- (numberText in src/sql/engine/format.js, kept in step with it): no trailing zeros, no leading zero before the decimal point,
-- at most 40 characters: a longer value is rounded to fit, or written as d.ddd...E+nn when even that does not fit.
CREATE FUNCTION ora_n2t(n numeric) RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE t text; sgn text := ''; ip text; fp text; ipart text; fixed text; lead int; e int; k int; dig text; v numeric;
        carry boolean := false; head text; tail text; w int; mant text;
BEGIN
  IF n IS NULL THEN RETURN NULL; END IF;
  t := n::text;
  IF left(t, 1) = '-' THEN sgn := '-'; t := substr(t, 2); END IF;
  ip := ltrim(split_part(t, '.', 1), '0'); fp := rtrim(split_part(t, '.', 2), '0');
  IF ip = '' THEN ip := '0'; END IF;
  IF ip = '0' AND fp = '' THEN RETURN '0'; END IF;
  ipart := CASE WHEN ip = '0' THEN '' ELSE ip END;
  fixed := sgn || ipart || CASE WHEN fp <> '' THEN '.' || fp ELSE '' END;
  IF length(fixed) <= 40 THEN RETURN fixed; END IF;
  lead := CASE WHEN ip = '0' THEN length(fp) - length(ltrim(fp, '0')) ELSE 0 END;
  e := CASE WHEN ip = '0' THEN -lead - 1 ELSE length(ip) - 1 END;
  IF (ip <> '0' AND length(ip) < 40 - length(sgn)) OR (ip = '0' AND e >= -5) THEN
    -- fixed notation cut to 40 characters, rounded half away from zero
    k := length(ipart) + (40 - length(sgn) - 1 - length(ipart));
    dig := ipart || fp;
    IF length(dig) > k THEN
      v := left(dig, k)::numeric + CASE WHEN substr(dig, k + 1, 1) >= '5' THEN 1 ELSE 0 END;
      IF length(v::text) > k THEN carry := true; dig := left(v::text, k) || '0'; ELSE dig := lpad(v::text, k, '0'); END IF;
    END IF;
    head := left(dig, length(ipart) + CASE WHEN carry THEN 1 ELSE 0 END);
    tail := rtrim(substr(dig, length(head) + 1), '0');
    RETURN sgn || head || CASE WHEN tail <> '' THEN '.' || tail ELSE '' END;
  END IF;
  -- scientific notation with a 40-character field
  dig := CASE WHEN ip = '0' THEN substr(fp, lead + 1) ELSE ip || fp END;
  w := 40 - length(sgn) - 1 - (2 + greatest(2, length(abs(e)::text)));
  IF length(dig) > w THEN
    v := left(dig, w)::numeric + CASE WHEN substr(dig, w + 1, 1) >= '5' THEN 1 ELSE 0 END;
    IF length(v::text) > w THEN e := e + 1; dig := left(v::text, w); ELSE dig := lpad(v::text, w, '0'); END IF;
  END IF;
  mant := left(rpad(dig, w, '0'), w);
  RETURN sgn || left(mant, 1) || '.' || substr(mant, 2) || 'E' || CASE WHEN e < 0 THEN '-' ELSE '+' END || lpad(abs(e)::text, 2, '0');
END $$;
--;;
-- Oracle timestamp -> VARCHAR2 with default NLS_DATE_FORMAT DD-MON-RR (English month names here; 40-formats replaces it with the session language)
CREATE FUNCTION ora_d2t(d timestamp) RETURNS text LANGUAGE sql IMMUTABLE AS
$$ SELECT pg_catalog.to_char(d,'DD-MON-YY') $$;
--;;
