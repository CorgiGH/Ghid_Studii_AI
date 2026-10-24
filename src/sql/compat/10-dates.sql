-- 10-dates.sql : DATE arithmetic, TO_DATE (formats, defaults, implicit text -> DATE), TO_CHAR(date) with RR, ADD_MONTHS, MONTHS_BETWEEN, LAST_DAY, NEXT_DAY, TRUNC/ROUND of dates.
CREATE FUNCTION to_char(d timestamp) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_d2t(d) $$;
--;;
-- ---------------------------------------------------------------- DATE arithmetic (days as NUMBER)
CREATE FUNCTION ora_dsub(a timestamp, b timestamp) RETURNS numeric LANGUAGE sql IMMUTABLE AS
$$ SELECT (extract(epoch FROM a) - extract(epoch FROM b)) / 86400 $$;
--;;
CREATE FUNCTION ora_dadd(a timestamp, n numeric) RETURNS timestamp LANGUAGE sql IMMUTABLE AS
$$ SELECT a OPERATOR(pg_catalog.+) (n * interval '1 day') $$;
--;;
CREATE FUNCTION ora_dsubn(a timestamp, n numeric) RETURNS timestamp LANGUAGE sql IMMUTABLE AS
$$ SELECT a OPERATOR(pg_catalog.-) (n * interval '1 day') $$;
--;;
CREATE FUNCTION ora_dadd2(n numeric, a timestamp) RETURNS timestamp LANGUAGE sql IMMUTABLE AS $$ SELECT ora_dadd(a, n) $$;
--;;
CREATE OPERATOR - (LEFTARG=timestamp, RIGHTARG=timestamp, FUNCTION=ora_dsub);
--;;
CREATE OPERATOR - (LEFTARG=timestamp, RIGHTARG=numeric,   FUNCTION=ora_dsubn);
--;;
CREATE OPERATOR + (LEFTARG=timestamp, RIGHTARG=numeric,   FUNCTION=ora_dadd);
--;;
CREATE OPERATOR + (LEFTARG=numeric,   RIGHTARG=timestamp, FUNCTION=ora_dadd2);
--;;
-- ---------------------------------------------------------------- dates
-- TO_CHAR(date, fmt) lives in 40-formats.sql (it needs the format-model parser and the NLS name tables).
--;;
-- Two-digit year -> Oracle RR: against the clock year, 00-49 and 50-99 land in the current century when the clock
-- year is 00-49 (20xx / 19xx) and one century later / in the current century when it is 50-99.
CREATE FUNCTION ora_rr(y int) RETURNS int LANGUAGE sql STABLE AS $$
  SELECT CASE WHEN y >= 100 THEN y
              ELSE (c.cy - c.cy % 100) + y + CASE WHEN y < 50 AND c.cy % 100 >= 50 THEN 100
                                                 WHEN y >= 50 AND c.cy % 100 < 50 THEN -100 ELSE 0 END END
  FROM (SELECT extract(year FROM ora_sysdate())::int AS cy) c $$;
--;;
-- TO_DATE returns a timestamp (PG's returns date).
-- PG cannot PARSE the RR format element (it silently yields year 0001) and reads YY as 70-99=19xx / 00-69=20xx.
-- Oracle: RR / RRRR -> a year of one or two digits goes through the RR pivot, a longer one is taken as it is;
-- YY -> always the current century (20xx). Fields the format does not mention default to the clock's year and month and
-- to day 1 (PG defaults to 0001-01-01): the missing fields are appended to both the input and the format.
CREATE FUNCTION ora_to_date_en(s text, f text) RETURNS timestamp LANGUAGE plpgsql STABLE AS $$
DECLARE r timestamp; clk timestamp := ora_sysdate(); body text := regexp_replace(f, '"[^"]*"', '', 'g');
        tk text[]; fx text; sx text := s; rr boolean; yy boolean; y int;
BEGIN
  IF s IS NULL OR f IS NULL THEN RETURN NULL; END IF;
  SELECT coalesce(array_agg(upper(m[1])), ARRAY[]::text[]) INTO tk FROM regexp_matches(body,
    '(SYEAR|YEAR|SYYYY|YYYY|YYY|YY|Y|RRRR|RR|MONTH|MON|MM|RM|DDD|DD|DAY|DY|D|J|HH24|HH12|HH|MI|SSSSS|SS|FF[1-9]?|AM|PM|TZH|TZM|TZR|IW|WW|W|Q)', 'gi') m;
  rr := tk && ARRAY['RR', 'RRRR'];
  yy := tk && ARRAY['YY'];
  fx := regexp_replace(f, 'RRRR|RR', 'YYYY', 'gi');
  IF NOT (tk && ARRAY['SYEAR','YEAR','SYYYY','YYYY','YYY','YY','Y','RRRR','RR','J']) THEN
    sx := sx || ' ' || extract(year FROM clk)::int::text; fx := fx || ' YYYY';
  END IF;
  IF NOT (tk && ARRAY['MONTH','MON','MM','RM','DDD','J']) THEN
    sx := sx || ' ' || extract(month FROM clk)::int::text; fx := fx || ' MM';
  END IF;
  IF NOT (tk && ARRAY['DD','DDD','J']) THEN
    sx := sx || ' 1'; fx := fx || ' DD';
  END IF;
  r := pg_catalog.to_timestamp(sx, fx) AT TIME ZONE 'UTC';
  y := extract(year FROM r)::int;
  IF rr AND y < 100 THEN r := r + (ora_rr(y) - y) * interval '1 year';
  ELSIF yy AND y BETWEEN 1970 AND 1999 THEN r := r + interval '100 years'; END IF;
  RETURN r;
END $$;
--;;
-- TO_DATE(text, format): month and day names are read in the session language (ALTER SESSION SET NLS_DATE_LANGUAGE)
CREATE FUNCTION to_date(s text, f text) RETURNS timestamp LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN ora_to_date_en(ora_names_to_en(s, ora_lang(), f), f);
END $$;
--;;
-- Implicit text -> DATE (and TO_DATE(s) with one argument): the default format DD-MON-RR, read like Oracle's non-FX parser:
-- blanks and punctuation between the fields are skipped, MON is a month name (3 letters or in full), the year takes
-- 1-2 digits through RR or 3-4 digits as they are. Anything else raises the Oracle date error.
CREATE FUNCTION to_date(s text) RETURNS timestamp LANGUAGE plpgsql STABLE AS $$
DECLARE m text[]; rest text; dd int; mon int; yv int; ld int;
        names text[] := ARRAY['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        longnames text[] := ARRAY['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
BEGIN
  IF s IS NULL THEN RETURN NULL; END IF;
  IF ora_datefmt() <> 'DD-MON-RR' THEN RETURN to_date(s, ora_datefmt()); END IF;    -- ALTER SESSION SET NLS_DATE_FORMAT
  m := regexp_match(s, '^\s*(\d{1,2})(.*)$', 's');
  IF m IS NULL THEN
    IF btrim(s) = '' THEN RAISE EXCEPTION 'ORA-01840: input value not long enough for date format' USING ERRCODE = '22007'; END IF;
    RAISE EXCEPTION 'ORA-01858: a non-numeric character was found where a numeric was expected' USING ERRCODE = '22007';
  END IF;
  dd := m[1]::int; rest := m[2];
  m := regexp_match(rest, '^([^A-Za-z0-9]*)(.*)$', 's');
  IF m[1] = '' AND m[2] ~ '^\d' THEN RAISE EXCEPTION 'ORA-01861: literal does not match format string' USING ERRCODE = '22007'; END IF;
  IF m[2] = '' THEN RAISE EXCEPTION 'ORA-01840: input value not long enough for date format' USING ERRCODE = '22007'; END IF;
  rest := m[2];
  m := regexp_match(rest, '^([A-Za-z]+)(.*)$', 's');
  IF m IS NULL THEN RAISE EXCEPTION 'ORA-01843: not a valid month' USING ERRCODE = '22008'; END IF;
  mon := coalesce(array_position(names, upper(m[1])), array_position(longnames, upper(m[1])));
  IF mon IS NULL THEN RAISE EXCEPTION 'ORA-01843: not a valid month' USING ERRCODE = '22008'; END IF;
  rest := m[2];
  m := regexp_match(rest, '^([^A-Za-z0-9]*)(.*)$', 's');
  IF m[2] = '' THEN RAISE EXCEPTION 'ORA-01840: input value not long enough for date format' USING ERRCODE = '22007'; END IF;
  rest := m[2];
  m := regexp_match(rest, '^(\d+)(.*)$', 's');
  IF m IS NULL THEN RAISE EXCEPTION 'ORA-01858: a non-numeric character was found where a numeric was expected' USING ERRCODE = '22007'; END IF;
  IF btrim(m[2]) <> '' THEN RAISE EXCEPTION 'ORA-01830: date format picture ends before converting entire input string' USING ERRCODE = '22007'; END IF;
  yv := CASE WHEN length(m[1]) <= 2 THEN ora_rr(m[1]::int) ELSE m[1]::int END;
  IF dd < 1 OR dd > 31 THEN RAISE EXCEPTION 'ORA-01847: day of month must be between 1 and last day of month' USING ERRCODE = '22008'; END IF;
  ld := extract(day FROM (make_date(yv, mon, 1) + interval '1 month' - interval '1 day'))::int;
  IF dd > ld THEN RAISE EXCEPTION 'ORA-01839: date not valid for month specified' USING ERRCODE = '22008'; END IF;
  RETURN make_timestamp(yv, mon, dd, 0, 0, 0);
END $$;
--;;
-- Implicit text -> DATE in comparisons: DATE <op> text compares after TO_DATE(text) (the rewriter casts the date-shaped
-- literals to text so that this operator, and not PostgreSQL's own timestamp parser, is picked).
DO $$
DECLARE o text; nm text; ops text[] := ARRAY['=','<>','<','>','<=','>='];
        names text[] := ARRAY['eq','ne','lt','gt','le','ge']; i int;
BEGIN
  FOR i IN 1..6 LOOP
    o := ops[i];
    nm := 'ora_cmp_dt_'||names[i];
    EXECUTE format('CREATE FUNCTION %I(a timestamp, b text) RETURNS boolean LANGUAGE sql STABLE AS $f$ SELECT a %s to_date(b) $f$', nm, o);
    EXECUTE format('CREATE OPERATOR %s (LEFTARG=timestamp, RIGHTARG=text, FUNCTION=%I)', o, nm);
    nm := 'ora_cmp_td_'||names[i];
    EXECUTE format('CREATE FUNCTION %I(a text, b timestamp) RETURNS boolean LANGUAGE sql STABLE AS $f$ SELECT to_date(a) %s b $f$', nm, o);
    EXECUTE format('CREATE OPERATOR %s (LEFTARG=text, RIGHTARG=timestamp, FUNCTION=%I)', o, nm);
  END LOOP;
END $$;
--;;
CREATE FUNCTION add_months(d timestamp, n numeric) RETURNS timestamp LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE tgt date; lastsrc boolean; ld int; dd int; tod time;
BEGIN
  IF d IS NULL OR n IS NULL THEN RETURN NULL; END IF;
  tod := d::time;
  lastsrc := (d::date = (date_trunc('month', d) + interval '1 month' - interval '1 day')::date);
  tgt := (date_trunc('month', d) + trunc(n)::int * interval '1 month')::date;
  ld := extract(day FROM (date_trunc('month', tgt) + interval '1 month' - interval '1 day'))::int;
  dd := CASE WHEN lastsrc THEN ld ELSE least(extract(day FROM d)::int, ld) END;
  RETURN make_timestamp(extract(year FROM tgt)::int, extract(month FROM tgt)::int, dd, 0, 0, 0) + tod::interval;
END $$;
--;;
CREATE FUNCTION months_between(d1 timestamp, d2 timestamp) RETURNS numeric LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE m numeric; x1 int; x2 int; l1 boolean; l2 boolean; s1 numeric; s2 numeric;
BEGIN
  IF d1 IS NULL OR d2 IS NULL THEN RETURN NULL; END IF;
  m := (extract(year FROM d1) * 12 + extract(month FROM d1)) - (extract(year FROM d2) * 12 + extract(month FROM d2));
  x1 := extract(day FROM d1)::int; x2 := extract(day FROM d2)::int;
  l1 := d1::date = (date_trunc('month', d1) + interval '1 month' - interval '1 day')::date;
  l2 := d2::date = (date_trunc('month', d2) + interval '1 month' - interval '1 day')::date;
  IF x1 = x2 OR (l1 AND l2) THEN RETURN m; END IF;      -- (time of day ignored in this branch, as in Oracle)
  s1 := extract(epoch FROM d1::time)::numeric / 86400; s2 := extract(epoch FROM d2::time)::numeric / 86400;
  RETURN m + ((x1 + s1) - (x2 + s2)) / 31;
END $$;
--;;
CREATE FUNCTION last_day(d timestamp) RETURNS timestamp LANGUAGE sql IMMUTABLE AS
$$ SELECT date_trunc('month', d) + interval '1 month' - interval '1 day' + d::time::interval $$;
--;;
CREATE FUNCTION next_day(d timestamp, nm text) RETURNS timestamp LANGUAGE plpgsql STABLE AS $$
DECLARE tgt int; cur int; delta int;
BEGIN
  IF d IS NULL OR nm IS NULL THEN RETURN NULL; END IF;
  tgt := ora_day_index(nm);
  IF tgt IS NULL THEN RAISE EXCEPTION 'ORA-01846: not a valid day of the week' USING ERRCODE='22007'; END IF;
  cur := extract(dow FROM d)::int;
  delta := ((tgt - cur + 6) % 7) + 1;
  RETURN d OPERATOR(pg_catalog.+) delta * interval '1 day';
END $$;
--;;
CREATE FUNCTION trunc(d timestamp) RETURNS timestamp LANGUAGE sql IMMUTABLE AS $$ SELECT date_trunc('day', d) $$;
--;;
-- First day of the ISO year iy (the Monday of the week that holds January 4th)
CREATE FUNCTION ora_iso_year_start(iy int) RETURNS timestamp LANGUAGE sql IMMUTABLE SET search_path = pg_catalog, public AS
$$ SELECT date_trunc('week', make_timestamp(iy, 1, 4, 0, 0, 0)) $$;
--;;
-- Start of the "week" a format names: DAY / DY / D = Sunday (NLS_TERRITORY AMERICA), IW = Monday, WW = the weekday of
-- January 1st, W = the weekday of the 1st of the month.
CREATE FUNCTION ora_week_start(d timestamp, u text) RETURNS timestamp LANGUAGE sql IMMUTABLE SET search_path = pg_catalog, public AS $$
  SELECT CASE u
    WHEN 'IW' THEN date_trunc('week', d)
    WHEN 'WW' THEN date_trunc('day', d) - ((extract(doy FROM d)::int - 1) % 7) * interval '1 day'
    WHEN 'W'  THEN date_trunc('day', d) - ((extract(day FROM d)::int - 1) % 7) * interval '1 day'
    ELSE date_trunc('day', d) - extract(dow FROM d)::int * interval '1 day' END $$;
--;;
-- A date format element: the family it belongs to, or ORA-01821
CREATE FUNCTION ora_date_unit(f text) RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE u text := upper(f);
BEGIN
  IF u IN ('YYYY','YEAR','YY','Y','YYY','SYYYY','SYEAR','RR','RRRR') THEN RETURN 'YEAR';
  ELSIF u IN ('IYYY','IYY','IY','I') THEN RETURN 'ISOYEAR';
  ELSIF u IN ('CC','SCC') THEN RETURN 'CENTURY';
  ELSIF u = 'Q' THEN RETURN 'Q';
  ELSIF u IN ('MONTH','MON','MM','RM') THEN RETURN 'MONTH';
  ELSIF u IN ('WW','W','IW') THEN RETURN u;
  ELSIF u IN ('D','DAY','DY') THEN RETURN 'DAY';
  ELSIF u IN ('DD','DDD','J') THEN RETURN 'DD';
  ELSIF u IN ('HH','HH12','HH24') THEN RETURN 'HH';
  ELSIF u = 'MI' THEN RETURN 'MI';
  END IF;
  RAISE EXCEPTION 'ORA-01821: date format not recognized' USING ERRCODE='22007';
END $$;
--;;
CREATE FUNCTION trunc(d timestamp, f text) RETURNS timestamp LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE u text;
BEGIN
  IF d IS NULL OR f IS NULL THEN RETURN NULL; END IF;
  u := ora_date_unit(f);
  RETURN CASE u
    WHEN 'YEAR' THEN date_trunc('year', d)
    WHEN 'ISOYEAR' THEN ora_iso_year_start(extract(isoyear FROM d)::int)
    WHEN 'CENTURY' THEN make_timestamp(((extract(year FROM d)::int - 1) / 100) * 100 + 1, 1, 1, 0, 0, 0)
    WHEN 'Q' THEN date_trunc('quarter', d)
    WHEN 'MONTH' THEN date_trunc('month', d)
    WHEN 'DD' THEN date_trunc('day', d)
    WHEN 'HH' THEN date_trunc('hour', d)
    WHEN 'MI' THEN date_trunc('minute', d)
    ELSE ora_week_start(d, u) END;
END $$;
--;;
CREATE FUNCTION round(d timestamp) RETURNS timestamp LANGUAGE sql IMMUTABLE AS $$ SELECT date_trunc('day', d + interval '12 hours') $$;
--;;
-- ROUND(date, fmt) rounds to the nearest unit start: the half-way point rounds up (a week: Wednesday noon; a year: July 1st;
-- a month: the 16th; a quarter: the 16th of its second month; a century: year 51).
CREATE FUNCTION round(d timestamp, f text) RETURNS timestamp LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE u text; base timestamp; qs timestamp; y int;
BEGIN
  IF d IS NULL OR f IS NULL THEN RETURN NULL; END IF;
  u := ora_date_unit(f);
  IF u = 'YEAR' THEN RETURN date_trunc('year', d + interval '6 months');
  ELSIF u = 'ISOYEAR' THEN
    RETURN ora_iso_year_start(CASE WHEN extract(month FROM d) >= 7 THEN extract(year FROM d)::int + 1 ELSE extract(isoyear FROM d)::int END);
  ELSIF u = 'CENTURY' THEN
    y := ((extract(year FROM d)::int - 1) / 100) * 100 + 1;
    RETURN make_timestamp(CASE WHEN (extract(year FROM d)::int - 1) % 100 >= 50 THEN y + 100 ELSE y END, 1, 1, 0, 0, 0);
  ELSIF u = 'Q' THEN
    qs := date_trunc('quarter', d);
    RETURN CASE WHEN d >= qs + interval '1 month' + interval '15 days' THEN qs + interval '3 months' ELSE qs END;
  ELSIF u = 'MONTH' THEN
    RETURN CASE WHEN extract(day FROM d) >= 16 THEN date_trunc('month', d) + interval '1 month' ELSE date_trunc('month', d) END;
  ELSIF u = 'DD' THEN RETURN date_trunc('day', d + interval '12 hours');
  ELSIF u = 'HH' THEN RETURN date_trunc('hour', d + interval '30 minutes');
  ELSIF u = 'MI' THEN RETURN date_trunc('minute', d + interval '30 seconds');
  END IF;
  base := ora_week_start(d, u);
  RETURN CASE WHEN d - base >= interval '3 days 12 hours' THEN base + interval '7 days' ELSE base END;
END $$;
--;;
-- Text arguments where a DATE is expected are converted with TO_DATE(text), as Oracle does.
CREATE FUNCTION add_months(s text, n numeric) RETURNS timestamp LANGUAGE sql STABLE AS $$ SELECT add_months(to_date(s), n) $$;
--;;
CREATE FUNCTION last_day(s text) RETURNS timestamp LANGUAGE sql STABLE AS $$ SELECT last_day(to_date(s)) $$;
--;;
CREATE FUNCTION next_day(s text, nm text) RETURNS timestamp LANGUAGE sql STABLE AS $$ SELECT next_day(to_date(s), nm) $$;
--;;
CREATE FUNCTION months_between(a text, b text) RETURNS numeric LANGUAGE sql STABLE AS $$ SELECT months_between(to_date(a), to_date(b)) $$;
--;;
CREATE FUNCTION months_between(a text, b timestamp) RETURNS numeric LANGUAGE sql STABLE AS $$ SELECT months_between(to_date(a), b) $$;
--;;
CREATE FUNCTION months_between(a timestamp, b text) RETURNS numeric LANGUAGE sql STABLE AS $$ SELECT months_between(a, to_date(b)) $$;
--;;
