-- 60-dates.sql : DATE arithmetic, TO_DATE/TO_CHAR for dates, ADD_MONTHS, MONTHS_BETWEEN, LAST_DAY, NEXT_DAY, TRUNC, ROUND.
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
-- TO_DATE returns a timestamp (PG's returns date); 1-arg form uses default NLS_DATE_FORMAT DD-MON-RR
-- PG cannot PARSE the RR format element (it silently yields year 0001) and reads YY as 70-99=19xx / 00-69=20xx.
-- Oracle: RR -> 00-49 = 20xx, 50-99 = 19xx (current year 2026); YY -> always the current century (20xx).
CREATE FUNCTION to_date(s text, f text) RETURNS timestamp LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE r timestamp; fx text := regexp_replace(f, 'RRRR', 'YYYY', 'gi'); y int; rr boolean; yy boolean;
BEGIN
  IF s IS NULL OR f IS NULL THEN RETURN NULL; END IF;
  rr := fx ~* 'RR';
  yy := fx ~* '(^|[^Y])YY([^Y]|$)';
  fx := regexp_replace(fx, 'RR', 'YY', 'gi');
  r := pg_catalog.to_timestamp(s, fx) AT TIME ZONE 'UTC';
  y := extract(year FROM r)::int;
  IF rr AND y BETWEEN 2050 AND 2069 THEN r := r - interval '100 years';
  ELSIF yy AND y BETWEEN 1970 AND 1999 THEN r := r + interval '100 years'; END IF;
  RETURN r;
END $$;
--;;
CREATE FUNCTION to_date(s text) RETURNS timestamp LANGUAGE sql IMMUTABLE AS $$ SELECT to_date(s, 'DD-MON-RR') $$;
--;;
-- TO_CHAR(date, fmt, nlsparam) : only ENGLISH (default) and ROMANIAN day/month names
CREATE FUNCTION to_char(d timestamp, f text, nls text) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE r text; ro_days text[] := ARRAY['duminica','luni','marti','miercuri','joi','vineri','sambata'];
        ro_mon text[] := ARRAY['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
        fu text := upper(f); nm text;
BEGIN
  r := pg_catalog.to_char(d, f);
  IF upper(nls) LIKE '%ROMANIAN%' THEN
    IF fu = 'DAY' THEN nm := ro_days[extract(dow FROM d)::int + 1]; ELSIF fu = 'MONTH' THEN nm := ro_mon[extract(month FROM d)::int]; END IF;
    IF nm IS NOT NULL THEN
      nm := pg_catalog.rpad(nm, 9);   -- Oracle pads to the longest name of the language; 9 INFERRED
      IF f = fu THEN RETURN upper(nm); ELSIF f = lower(f) THEN RETURN nm; ELSE RETURN pg_catalog.initcap(nm); END IF;
    END IF;
  END IF;
  RETURN r;
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
CREATE FUNCTION next_day(d timestamp, nm text) RETURNS timestamp LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE tgt int; cur int; delta int; k text := upper(substr(trim(nm),1,3));
BEGIN
  IF d IS NULL OR nm IS NULL THEN RETURN NULL; END IF;
  tgt := CASE k WHEN 'SUN' THEN 0 WHEN 'MON' THEN 1 WHEN 'TUE' THEN 2 WHEN 'WED' THEN 3 WHEN 'THU' THEN 4 WHEN 'FRI' THEN 5 WHEN 'SAT' THEN 6 END;
  IF tgt IS NULL THEN RAISE EXCEPTION 'ORA-01846: not a valid day of the week' USING ERRCODE='22007'; END IF;
  cur := extract(dow FROM d)::int;
  delta := ((tgt - cur + 6) % 7) + 1;
  RETURN d OPERATOR(pg_catalog.+) delta * interval '1 day';
END $$;
--;;
CREATE FUNCTION trunc(d timestamp) RETURNS timestamp LANGUAGE sql IMMUTABLE AS $$ SELECT date_trunc('day', d) $$;
--;;
-- week start for 'DAY'/'D'/'DY' = Sunday here (NLS_TERRITORY AMERICA) -- INFERRED, real Oracle check
CREATE FUNCTION trunc(d timestamp, f text) RETURNS timestamp LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE u text := upper(f);
BEGIN
  IF d IS NULL THEN RETURN NULL; END IF;
  IF u IN ('YYYY','YEAR','YY','Y','YYY','SYYYY','SYEAR') THEN RETURN date_trunc('year', d);
  ELSIF u = 'Q' THEN RETURN date_trunc('quarter', d);
  ELSIF u IN ('MONTH','MON','MM','RM') THEN RETURN date_trunc('month', d);
  ELSIF u IN ('DD','DDD','J') THEN RETURN date_trunc('day', d);
  ELSIF u IN ('HH','HH12','HH24') THEN RETURN date_trunc('hour', d);
  ELSIF u = 'MI' THEN RETURN date_trunc('minute', d);
  ELSIF u = 'IW' THEN RETURN date_trunc('week', d);
  ELSIF u IN ('D','DAY','DY') THEN RETURN date_trunc('day', d) OPERATOR(pg_catalog.-) extract(dow FROM d)::int * interval '1 day';
  END IF;
  RAISE EXCEPTION 'ORA-01898: invalid precision specifier / format' USING ERRCODE='22023';
END $$;
--;;
CREATE FUNCTION round(d timestamp) RETURNS timestamp LANGUAGE sql IMMUTABLE AS $$ SELECT date_trunc('day', d + interval '12 hours') $$;
--;;
CREATE FUNCTION round(d timestamp, f text) RETURNS timestamp LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE u text := upper(f);
BEGIN
  IF d IS NULL THEN RETURN NULL; END IF;
  IF u IN ('YYYY','YEAR','YY','Y','YYY','SYYYY','SYEAR') THEN RETURN date_trunc('year', d + interval '6 months');
  ELSIF u IN ('MONTH','MON','MM','RM') THEN
    IF extract(day FROM d) >= 16 THEN RETURN date_trunc('month', d) + interval '1 month'; ELSE RETURN date_trunc('month', d); END IF;
  ELSIF u IN ('DD','DDD','J') THEN RETURN date_trunc('day', d + interval '12 hours');
  ELSIF u IN ('HH','HH12','HH24') THEN RETURN date_trunc('hour', d + interval '30 minutes');
  ELSIF u = 'MI' THEN RETURN date_trunc('minute', d + interval '30 seconds');
  END IF;
  RAISE EXCEPTION 'ORA-01898: invalid precision specifier / format (round %)', f USING ERRCODE='22023';
END $$;
--;;
