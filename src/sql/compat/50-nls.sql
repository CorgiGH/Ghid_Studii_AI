-- 50-nls.sql : NLS-dependent behaviour: the nlsparam argument of TO_CHAR / TO_DATE, month and day names read in a language,
-- day names for NEXT_DAY. Languages: AMERICAN (ENGLISH), ROMANIAN, FRENCH, GERMAN (names in ora_nls_names, 40-formats.sql).
-- The session language is set by ALTER SESSION SET NLS_DATE_LANGUAGE = ... (the engine updates ora_session).

-- 'nls_date_language=romanian' -> 'ROMANIAN'. Other known NLS parameters are accepted and ignored; an unknown one, an unknown
-- language or no parameter at all is ORA-12702. Without a language the session's is used.
CREATE FUNCTION ora_nls_lang(nls text) RETURNS text LANGUAGE plpgsql STABLE SET search_path = pg_catalog, public AS $$
DECLARE m text[]; lang text := NULL; n int := 0;
BEGIN
  IF nls IS NULL THEN RETURN NULL; END IF;
  FOR m IN SELECT x FROM regexp_matches(nls, '([A-Za-z_]+)\s*=\s*(''[^'']*''|\S+)', 'g') x LOOP
    n := n + 1;
    IF upper(m[1]) = 'NLS_DATE_LANGUAGE' THEN lang := ora_lang_norm(btrim(m[2], ''''));
    ELSIF upper(m[1]) NOT IN ('NLS_SORT', 'NLS_CALENDAR', 'NLS_NUMERIC_CHARACTERS', 'NLS_CURRENCY', 'NLS_ISO_CURRENCY', 'NLS_DUAL_CURRENCY') THEN
      RAISE EXCEPTION 'ORA-12702: invalid NLS parameter string used in SQL function' USING ERRCODE = '22023';
    END IF;
  END LOOP;
  IF n = 0 THEN RAISE EXCEPTION 'ORA-12702: invalid NLS parameter string used in SQL function' USING ERRCODE = '22023'; END IF;
  RETURN coalesce(lang, ora_lang());
END $$;
--;;
CREATE FUNCTION to_char(d timestamp, f text, nls text) RETURNS text LANGUAGE sql STABLE AS
$$ SELECT ora_to_char_date(d, f, ora_nls_lang(nls)) $$;
--;;
-- Index of a day name (0 = Sunday): full name or abbreviation in the session language, or English.
CREATE FUNCTION ora_day_index(nm text) RETURNS int LANGUAGE plpgsql STABLE SET search_path = pg_catalog, public AS $$
DECLARE k text := lower(btrim(nm)); r int;
BEGIN
  SELECT idx INTO r FROM ora_nls_names WHERE lang IN (ora_lang(), 'AMERICAN') AND kind IN ('day', 'dy')
    AND (lower(name) = k OR lower(replace(name, '.', '')) = k) ORDER BY (lang <> ora_lang()), idx LIMIT 1;
  IF r IS NULL AND char_length(k) >= 3 THEN
    SELECT idx INTO r FROM ora_nls_names WHERE lang IN (ora_lang(), 'AMERICAN') AND kind = 'day'
      AND lower(left(name, 3)) = left(k, 3) ORDER BY (lang <> ora_lang()), idx LIMIT 1;
  END IF;
  RETURN r;
END $$;
--;;
-- Month and day names of `lang` inside an input string -> the English names the date parser understands.
-- A non-English input that names a month in the model (MONTH / MON) but contains no month of that language is ORA-01841.
CREATE FUNCTION ora_names_to_en(s text, lang text, f text) RETURNS text LANGUAGE plpgsql STABLE SET search_path = pg_catalog, public AS $$
DECLARE w text; r record; out text := s; hit boolean := false; monthfmt boolean; words int := 0;
BEGIN
  IF s IS NULL OR lang = 'AMERICAN' THEN RETURN s; END IF;
  monthfmt := regexp_replace(upper(f), '"[^"]*"', '', 'g') ~ 'MON';
  FOR w IN SELECT DISTINCT m[1] FROM regexp_matches(s, '([^\s\d,./;:\-]+)', 'g') m LOOP
    words := words + 1;
    SELECT n.kind, n.idx INTO r FROM ora_nls_names n
      WHERE n.lang = ora_names_to_en.lang AND lower(replace(n.name, '.', '')) = lower(w)
      ORDER BY CASE n.kind WHEN 'month' THEN 1 WHEN 'mon' THEN 2 WHEN 'day' THEN 3 ELSE 4 END LIMIT 1;
    IF FOUND THEN
      out := regexp_replace(out, '\m' || w || '\M', ora_nls_name(r.kind, r.idx, 'AMERICAN'), 'gi');
      IF r.kind IN ('month', 'mon') THEN hit := true; END IF;
    END IF;
  END LOOP;
  IF monthfmt AND NOT hit AND words > 0 THEN
    RAISE EXCEPTION 'ORA-01841: (full) year must be between -4713 and +9999, and not be 0' USING ERRCODE = '22008';
  END IF;
  RETURN out;
END $$;
--;;
CREATE FUNCTION to_date(s text, f text, nls text) RETURNS timestamp LANGUAGE plpgsql STABLE AS $$
BEGIN
  IF s IS NULL OR f IS NULL THEN RETURN NULL; END IF;
  RETURN ora_to_date_en(ora_names_to_en(s, ora_nls_lang(nls), f), f);
END $$;
