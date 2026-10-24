-- 60-strings.sql : SUBSTR, INSTR, REPLACE, LPAD, RPAD.
-- SUBSTR : Oracle semantics (start 0 = 1, negative start counts from the END, length<1 -> NULL, ''=NULL)
CREATE FUNCTION substr(s text, m numeric, n numeric) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE len int; st int; ln int;
BEGIN
  IF s IS NULL OR m IS NULL OR n IS NULL THEN RETURN NULL; END IF;
  len := char_length(s); st := trunc(m)::int; ln := trunc(n)::int;
  IF ln < 1 THEN RETURN NULL; END IF;
  IF st = 0 THEN st := 1; ELSIF st < 0 THEN st := len + st + 1; END IF;
  IF st < 1 THEN RETURN NULL; END IF;   -- INFERRED: start before the first char -> NULL (real Oracle check)
  RETURN nullif(pg_catalog.substr(s, st, ln), '');
END $$;
--;;
CREATE FUNCTION substr(s text, m numeric) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE len int; st int;
BEGIN
  IF s IS NULL OR m IS NULL THEN RETURN NULL; END IF;
  len := char_length(s); st := trunc(m)::int;
  IF st = 0 THEN st := 1; ELSIF st < 0 THEN st := len + st + 1; END IF;
  IF st < 1 THEN RETURN NULL; END IF;
  RETURN nullif(pg_catalog.substr(s, st), '');
END $$;
--;;
CREATE FUNCTION substr(s text, m int, n int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT substr(s, m::numeric, n::numeric) $$;
--;;
CREATE FUNCTION substr(s text, m int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT substr(s, m::numeric) $$;
--;;
CREATE FUNCTION substr(s bpchar, m int, n int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT substr(ora_p(s), m::numeric, n::numeric) $$;
--;;
CREATE FUNCTION substr(s bpchar, m int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT substr(ora_p(s), m::numeric) $$;
--;;
CREATE FUNCTION substr(s bpchar, m numeric, n numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT substr(ora_p(s), m, n) $$;
--;;
CREATE FUNCTION substr(s numeric, m numeric, n numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT substr(ora_n2t(s), m, n) $$;
--;;
CREATE FUNCTION substr(s numeric, m numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT substr(ora_n2t(s), m) $$;
--;;
-- INSTR(s, sub [, start [, occurrence]]) : negative start searches backwards; 0 = not found
CREATE FUNCTION instr(s text, sub text, st int, oc int) RETURNS numeric LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE len int; sl int; pos int; found int := 0; k int; p int; i int; hits int := 0;
BEGIN
  IF s IS NULL OR sub IS NULL OR st IS NULL OR oc IS NULL OR sub = '' THEN RETURN NULL; END IF;
  IF st = 0 THEN RAISE EXCEPTION 'ORA-14412: INSTR position must not be 0' USING ERRCODE='22023'; END IF;
  IF oc < 1 THEN RAISE EXCEPTION 'ORA-14412: INSTR occurrence must be positive' USING ERRCODE='22023'; END IF;
  len := char_length(s); sl := char_length(sub);
  IF st > 0 THEN
    pos := st;
    FOR k IN 1..oc LOOP
      IF pos > len THEN RETURN 0; END IF;
      p := strpos(pg_catalog.substr(s, pos), sub);
      IF p = 0 THEN RETURN 0; END IF;
      found := pos + p - 1;
      pos := found + sl;      -- INFERRED: occurrences do not overlap (real Oracle check)
    END LOOP;
    RETURN found;
  ELSE
    pos := len + st + 1;      -- last position where a match may START (INFERRED, real Oracle check)
    FOR i IN REVERSE LEAST(pos, len - sl + 1)..1 LOOP
      IF pg_catalog.substr(s, i, sl) = sub THEN
        hits := hits + 1;
        IF hits = oc THEN RETURN i; END IF;
      END IF;
    END LOOP;
    RETURN 0;
  END IF;
END $$;
--;;
CREATE FUNCTION instr(s text, sub text, st int) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT instr(s, sub, st, 1) $$;
--;;
CREATE FUNCTION instr(s text, sub text) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT instr(s, sub, 1, 1) $$;
--;;
CREATE FUNCTION instr(s bpchar, sub text, st int, oc int) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT instr(ora_p(s), sub, st, oc) $$;
--;;
CREATE FUNCTION instr(s bpchar, sub text, st int) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT instr(ora_p(s), sub, st, 1) $$;
--;;
CREATE FUNCTION instr(s bpchar, sub text) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT instr(ora_p(s), sub, 1, 1) $$;
--;;
-- REPLACE : NULL replacement deletes; empty result = NULL; NULL search = unchanged
CREATE FUNCTION replace(s text, f text, t text) RETURNS text LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN s IS NULL THEN NULL WHEN f IS NULL OR f = '' THEN s
               ELSE nullif(pg_catalog.replace(s, f, coalesce(t,'')), '') END $$;
--;;
CREATE FUNCTION replace(s text, f text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT replace(s, f, NULL::text) $$;
--;;
CREATE FUNCTION replace(s bpchar, f text, t text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT replace(ora_p(s), f, t) $$;
--;;
-- LPAD / RPAD : accept NUMBER first argument / NUMBER length (Oracle converts implicitly)
CREATE FUNCTION lpad(s text, n numeric, f text) RETURNS text LANGUAGE sql IMMUTABLE AS
$$ SELECT nullif(pg_catalog.lpad(s, greatest(trunc(n)::int,0), f), '') $$;
--;;
CREATE FUNCTION lpad(s text, n numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT lpad(s, n, ' ') $$;
--;;
CREATE FUNCTION lpad(s numeric, n numeric, f text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT lpad(ora_n2t(s), n, f) $$;
--;;
CREATE FUNCTION lpad(s numeric, n numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT lpad(ora_n2t(s), n, ' ') $$;
--;;
CREATE FUNCTION lpad(s text, n int, f text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT lpad(s, n::numeric, f) $$;
--;;
CREATE FUNCTION lpad(s text, n int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT lpad(s, n::numeric, ' ') $$;
--;;
CREATE FUNCTION rpad(s text, n numeric, f text) RETURNS text LANGUAGE sql IMMUTABLE AS
$$ SELECT nullif(pg_catalog.rpad(s, greatest(trunc(n)::int,0), f), '') $$;
--;;
CREATE FUNCTION rpad(s text, n numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT rpad(s, n, ' ') $$;
--;;
CREATE FUNCTION rpad(s numeric, n numeric, f text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT rpad(ora_n2t(s), n, f) $$;
--;;
CREATE FUNCTION rpad(s numeric, n numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT rpad(ora_n2t(s), n, ' ') $$;
--;;
CREATE FUNCTION rpad(s text, n int, f text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT rpad(s, n::numeric, f) $$;
--;;
CREATE FUNCTION rpad(s text, n int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT rpad(s, n::numeric, ' ') $$;
--;;
