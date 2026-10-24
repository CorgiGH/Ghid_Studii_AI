-- 50-nls.sql : NLS-dependent names: TO_CHAR(date, fmt, nlsparam) with English and Romanian day/month names.
-- TO_CHAR(date, fmt, nlsparam) : only ENGLISH (default) and ROMANIAN day/month names
CREATE FUNCTION to_char(d timestamp, f text, nls text) RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE r text; ro_days text[] := ARRAY['duminica','luni','marti','miercuri','joi','vineri','sambata'];
        ro_mon text[] := ARRAY['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
        fu text := upper(f); nm text;
BEGIN
  r := to_char(d, f);
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
