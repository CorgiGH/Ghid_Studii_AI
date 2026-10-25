-- 60-strings.sql : SUBSTR, INSTR, REPLACE, LPAD, RPAD, and the implicit NUMBER / DATE -> text of LIKE, SUBSTR and LENGTH.
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
  IF st = 0 THEN RETURN 0; END IF;        -- position 0 finds nothing (Oracle 11g answers 0, not an error)
  IF oc < 1 THEN RAISE EXCEPTION 'ORA-01428: argument ''%'' is out of range', oc USING ERRCODE='22023'; END IF;
  len := char_length(s); sl := char_length(sub);
  IF st > 0 THEN
    pos := st;
    FOR k IN 1..oc LOOP
      IF pos > len THEN RETURN 0; END IF;
      p := strpos(pg_catalog.substr(s, pos), sub);
      IF p = 0 THEN RETURN 0; END IF;
      found := pos + p - 1;
      pos := found + 1;       -- occurrences may overlap: INSTR('AAAA','AA',1,2) is 2 (measured on Oracle 11g)
    END LOOP;
    RETURN found;
  ELSE
    pos := len + st + 1;      -- last position where a match may START (measured on Oracle 11g)
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
-- LPAD / RPAD : accept NUMBER first argument / NUMBER length (Oracle converts implicitly). A VARCHAR2 holds at most 4000
-- characters, so the result stops there (LENGTH(RPAD('a', 5000, 'b')) is 4000).
CREATE FUNCTION lpad(s text, n numeric, f text) RETURNS text LANGUAGE sql IMMUTABLE AS
$$ SELECT nullif(pg_catalog.lpad(s, least(greatest(trunc(n), 0), 4000)::int, f), '') $$;
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
$$ SELECT nullif(pg_catalog.rpad(s, least(greatest(trunc(n), 0), 4000)::int, f), '') $$;
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
-- ---------------------------------------------------------------- implicit NUMBER / DATE -> text
CREATE FUNCTION substr(s timestamp, m numeric, n numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT substr(ora_d2t(s), m, n) $$;
--;;
CREATE FUNCTION substr(s timestamp, m numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT substr(ora_d2t(s), m) $$;
--;;
CREATE FUNCTION length(d timestamp) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT length(ora_d2t(d)) $$;
--;;
CREATE FUNCTION upper(d timestamp) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_d2t(d) $$;
--;;
CREATE FUNCTION lower(d timestamp) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT lower(ora_d2t(d)) $$;
--;;
-- x LIKE y with a NUMBER or DATE operand: the operand becomes text first. PostgreSQL's LIKE is the operator ~~ / !~~
-- (the pattern arrives already prepared by like_escape when the statement has ESCAPE).
CREATE FUNCTION ora_like_nt(a numeric, b text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(a) LIKE b $$;
--;;
CREATE FUNCTION ora_like_nn(a numeric, b numeric) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(a) LIKE ora_n2t(b) $$;
--;;
CREATE FUNCTION ora_like_tn(a text, b numeric) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT a LIKE ora_n2t(b) $$;
--;;
CREATE FUNCTION ora_like_dt(a timestamp, b text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT ora_d2t(a) LIKE b $$;
--;;
CREATE FUNCTION ora_nlike_nt(a numeric, b text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(a) NOT LIKE b $$;
--;;
CREATE FUNCTION ora_nlike_nn(a numeric, b numeric) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(a) NOT LIKE ora_n2t(b) $$;
--;;
CREATE FUNCTION ora_nlike_tn(a text, b numeric) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT a NOT LIKE ora_n2t(b) $$;
--;;
CREATE FUNCTION ora_nlike_dt(a timestamp, b text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT ora_d2t(a) NOT LIKE b $$;
--;;
CREATE OPERATOR ~~  (LEFTARG=numeric,   RIGHTARG=text,    FUNCTION=ora_like_nt);
--;;
CREATE OPERATOR ~~  (LEFTARG=numeric,   RIGHTARG=numeric, FUNCTION=ora_like_nn);
--;;
CREATE OPERATOR ~~  (LEFTARG=text,      RIGHTARG=numeric, FUNCTION=ora_like_tn);
--;;
CREATE OPERATOR ~~  (LEFTARG=timestamp, RIGHTARG=text,    FUNCTION=ora_like_dt);
--;;
CREATE OPERATOR !~~ (LEFTARG=numeric,   RIGHTARG=text,    FUNCTION=ora_nlike_nt);
--;;
CREATE OPERATOR !~~ (LEFTARG=numeric,   RIGHTARG=numeric, FUNCTION=ora_nlike_nn);
--;;
CREATE OPERATOR !~~ (LEFTARG=text,      RIGHTARG=numeric, FUNCTION=ora_nlike_tn);
--;;
CREATE OPERATOR !~~ (LEFTARG=timestamp, RIGHTARG=text,    FUNCTION=ora_nlike_dt);
--;;
--;;
-- ---------------------------------------------------------------- implicit conversions in function arguments
-- Oracle converts an argument to the type the function's parameter has: LPAD(bursa, 10, 0) pads the text of the number with the
-- text '0', INSTR(data_nastere, 'FEB') searches the date as DD-MON-RR text, LPAD(nume, '10', '*') reads the length '10' as a
-- number. The rewriter (pass-args.js) wraps such arguments: ora_t(x) = x as Oracle's text (TO_CHAR rules: a number as
-- ora_n2t, a DATE in the session date format, a CHAR with its padding), ora_n(x) = x as a NUMBER (a text that is not a number
-- is ORA-01722). A type with no overload here (a date as a length) is ORA-00932.
CREATE FUNCTION ora_t(v text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT v $$;
--;;
CREATE FUNCTION ora_t(v bpchar) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_p(v) $$;
--;;
CREATE FUNCTION ora_t(v numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(v) $$;
--;;
CREATE FUNCTION ora_t(v int2) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(v::numeric) $$;
--;;
CREATE FUNCTION ora_t(v int4) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(v::numeric) $$;
--;;
CREATE FUNCTION ora_t(v int8) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(v::numeric) $$;
--;;
CREATE FUNCTION ora_t(v float8) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(v::numeric) $$;
--;;
CREATE FUNCTION ora_t(v timestamp) RETURNS text LANGUAGE sql STABLE AS $$ SELECT ora_d2t(v) $$;
--;;
CREATE FUNCTION ora_t(v date) RETURNS text LANGUAGE sql STABLE AS $$ SELECT ora_d2t(v::timestamp) $$;
--;;
CREATE FUNCTION ora_n(v numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT v $$;
--;;
CREATE FUNCTION ora_n(v int2) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT v::numeric $$;
--;;
CREATE FUNCTION ora_n(v int4) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT v::numeric $$;
--;;
CREATE FUNCTION ora_n(v int8) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT v::numeric $$;
--;;
CREATE FUNCTION ora_n(v float8) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT v::numeric $$;
--;;
CREATE FUNCTION ora_n(v text) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT v::numeric $$;
--;;
CREATE FUNCTION ora_n(v bpchar) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT ora_p(v)::numeric $$;
--;;
-- INSTR with NUMBER positions (what ora_n gives): the integer part, as Oracle does
CREATE FUNCTION instr(s text, sub text, st numeric, oc numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS
$$ SELECT instr(s, sub, trunc(st)::int, trunc(oc)::int) $$;
--;;
CREATE FUNCTION instr(s text, sub text, st numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT instr(s, sub, trunc(st)::int, 1) $$;
--;;
-- ---------------------------------------------------------------- CAST(x AS VARCHAR2(n) | CHAR(n) | DATE)
-- The rewriter (pass-cast.js) turns CAST(x AS VARCHAR2(n)) into ora_cast_varchar(x, n) and CAST(x AS CHAR(n)) into
-- ora_cast_char(x, n): the text of x as Oracle writes it (a number as ora_n2t, a DATE in the session date format, a TIMESTAMP WITH
-- TIME ZONE in the session's timestamp format), cut to n characters when it is a text and an error when a number (ORA-25137) or
-- a date (ORA-01801) does not fit. CHAR(n) pads with blanks to n. CAST(x AS DATE) is ora_cast_date(x): a text goes through the
-- session date format (TO_DATE with one argument).
-- Oracle's text of a TIMESTAMP WITH TIME ZONE under the default NLS_TIMESTAMP_TZ_FORMAT 'DD-MON-RR HH.MI.SSXFF AM TZR'
CREATE FUNCTION ora_tstz2t(v timestamptz) RETURNS text LANGUAGE sql STABLE AS $$
  SELECT ora_to_char_date(v AT TIME ZONE 'UTC', 'DD-MON-RR HH.MI.SS', ora_lang()) || '.'
         || rpad(lpad((extract(microseconds FROM v)::bigint % 1000000)::text, 6, '0'), 9, '0') || ' '
         || ora_to_char_date(v AT TIME ZONE 'UTC', 'AM', ora_lang()) || ' +00:00' $$;
--;;
CREATE FUNCTION ora_t(v timestamptz) RETURNS text LANGUAGE sql STABLE AS $$ SELECT ora_tstz2t(v) $$;
--;;
CREATE FUNCTION ora_fit_text(t text, n int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT left(t, n) $$;
--;;
CREATE FUNCTION ora_fit_number(t text, n int) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF char_length(t) > n THEN RAISE EXCEPTION 'ORA-25137: Data value out of range' USING ERRCODE = '22001'; END IF;
  RETURN t;
END $$;
--;;
CREATE FUNCTION ora_fit_date(t text, n int) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF char_length(t) > n THEN RAISE EXCEPTION 'ORA-01801: date format is too long for internal buffer' USING ERRCODE = '22007'; END IF;
  RETURN t;
END $$;
--;;
CREATE FUNCTION ora_cast_varchar(v text, n int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_fit_text(v, n) $$;
--;;
CREATE FUNCTION ora_cast_varchar(v bpchar, n int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_fit_text(ora_p(v), n) $$;
--;;
CREATE FUNCTION ora_cast_varchar(v numeric, n int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_fit_number(ora_n2t(v), n) $$;
--;;
CREATE FUNCTION ora_cast_varchar(v int4, n int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_fit_number(ora_n2t(v::numeric), n) $$;
--;;
CREATE FUNCTION ora_cast_varchar(v int8, n int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_fit_number(ora_n2t(v::numeric), n) $$;
--;;
CREATE FUNCTION ora_cast_varchar(v float8, n int) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_fit_number(ora_n2t(v::numeric), n) $$;
--;;
CREATE FUNCTION ora_cast_varchar(v timestamp, n int) RETURNS text LANGUAGE sql STABLE AS $$ SELECT ora_fit_date(ora_d2t(v), n) $$;
--;;
CREATE FUNCTION ora_cast_varchar(v date, n int) RETURNS text LANGUAGE sql STABLE AS $$ SELECT ora_fit_date(ora_d2t(v::timestamp), n) $$;
--;;
CREATE FUNCTION ora_cast_varchar(v timestamptz, n int) RETURNS text LANGUAGE sql STABLE AS $$ SELECT ora_fit_date(ora_tstz2t(v), n) $$;
--;;
CREATE FUNCTION ora_cast_char(v text, n int) RETURNS bpchar LANGUAGE sql IMMUTABLE AS $$ SELECT rpad(ora_fit_text(v, n), n)::bpchar $$;
--;;
CREATE FUNCTION ora_cast_char(v bpchar, n int) RETURNS bpchar LANGUAGE sql IMMUTABLE AS $$ SELECT rpad(ora_fit_text(ora_p(v), n), n)::bpchar $$;
--;;
CREATE FUNCTION ora_cast_char(v numeric, n int) RETURNS bpchar LANGUAGE sql IMMUTABLE AS $$ SELECT rpad(ora_fit_number(ora_n2t(v), n), n)::bpchar $$;
--;;
CREATE FUNCTION ora_cast_char(v int4, n int) RETURNS bpchar LANGUAGE sql IMMUTABLE AS $$ SELECT rpad(ora_fit_number(ora_n2t(v::numeric), n), n)::bpchar $$;
--;;
CREATE FUNCTION ora_cast_char(v int8, n int) RETURNS bpchar LANGUAGE sql IMMUTABLE AS $$ SELECT rpad(ora_fit_number(ora_n2t(v::numeric), n), n)::bpchar $$;
--;;
CREATE FUNCTION ora_cast_char(v float8, n int) RETURNS bpchar LANGUAGE sql IMMUTABLE AS $$ SELECT rpad(ora_fit_number(ora_n2t(v::numeric), n), n)::bpchar $$;
--;;
CREATE FUNCTION ora_cast_char(v timestamp, n int) RETURNS bpchar LANGUAGE sql STABLE AS $$ SELECT rpad(ora_fit_date(ora_d2t(v), n), n)::bpchar $$;
--;;
CREATE FUNCTION ora_cast_char(v date, n int) RETURNS bpchar LANGUAGE sql STABLE AS $$ SELECT rpad(ora_fit_date(ora_d2t(v::timestamp), n), n)::bpchar $$;
--;;
CREATE FUNCTION ora_cast_char(v timestamptz, n int) RETURNS bpchar LANGUAGE sql STABLE AS $$ SELECT rpad(ora_fit_date(ora_tstz2t(v), n), n)::bpchar $$;
--;;
CREATE FUNCTION ora_cast_date(v text) RETURNS timestamp LANGUAGE sql STABLE AS $$ SELECT to_date(v) $$;
--;;
CREATE FUNCTION ora_cast_date(v bpchar) RETURNS timestamp LANGUAGE sql STABLE AS $$ SELECT to_date(ora_p(v)) $$;
--;;
CREATE FUNCTION ora_cast_date(v timestamp) RETURNS timestamp LANGUAGE sql IMMUTABLE AS $$ SELECT date_trunc('second', v) $$;
--;;
CREATE FUNCTION ora_cast_date(v date) RETURNS timestamp LANGUAGE sql IMMUTABLE AS $$ SELECT v::timestamp $$;
--;;
CREATE FUNCTION ora_cast_date(v timestamptz) RETURNS timestamp LANGUAGE sql IMMUTABLE AS $$ SELECT date_trunc('second', v AT TIME ZONE 'UTC') $$;
--;;
-- ---------------------------------------------------------------- CONVERT between character sets is not built
CREATE FUNCTION convert(s text, dest text) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RAISE EXCEPTION 'ORA-03001: unimplemented feature: CONVERT between character sets is not available in this practice database' USING ERRCODE = '0A000';
END $$;
--;;
CREATE FUNCTION convert(s text, dest text, src text) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RAISE EXCEPTION 'ORA-03001: unimplemented feature: CONVERT between character sets is not available in this practice database' USING ERRCODE = '0A000';
END $$;
