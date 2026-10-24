-- 40-formats.sql : Format models. TO_CHAR(date, fmt) with Oracle's element set (fm toggle, SP / TH suffixes, spelled YEAR,
-- RM, names in the session language) and TO_CHAR(number, fmt) (9 0 , . D G $ L C U S MI PR B V EEEE RN X, FM, overflow ###).
-- Day and month names live in ora_nls_names (kinds: day, dy, month, mon; day 0 = Sunday); 50-nls.sql adds the functions that
-- take a language argument. Everything here that reads the table is STABLE.

-- ---------------------------------------------------------------- language tables
CREATE TABLE ora_nls_names(lang text NOT NULL, kind text NOT NULL, idx int NOT NULL, name text NOT NULL, PRIMARY KEY (lang, kind, idx));
--;;
-- Measured against Oracle 11.2 (nls_date_language = ...): padding widths come from these lists (longest name of the language).
DO $$
DECLARE j jsonb := $j$ {
  "AMERICAN": {
    "day":   ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    "dy":    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    "month": ["January","February","March","April","May","June","July","August","September","October","November","December"],
    "mon":   ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] },
  "ROMANIAN": {
    "day":   ["Duminică","Luni","Marţi","Miercuri","Joi","Vineri","Sâmbătă"],
    "dy":    ["D","L","Ma","Mi","J","V","S"],
    "month": ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"],
    "mon":   ["Ian","Feb","Mar","Apr","Mai","Iun","Iul","Aug","Sep","Oct","Noi","Dec"] },
  "FRENCH": {
    "day":   ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],
    "dy":    ["Dim.","Lun.","Mar.","Mer.","Jeu.","Ven.","Sam."],
    "month": ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
    "mon":   ["Janv.","Févr.","Mars","Avr.","Mai","Juin","Juil.","Août","Sept.","Oct.","Nov.","Déc."] },
  "GERMAN": {
    "day":   ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],
    "dy":    ["So","Mo","Di","Mi","Do","Fr","Sa"],
    "month": ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
    "mon":   ["Jan","Feb","Mrz","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"] } } $j$::jsonb;
  l text; k text; i int; nm text;
BEGIN
  FOR l IN SELECT jsonb_object_keys(j) LOOP
    FOR k IN SELECT jsonb_object_keys(j -> l) LOOP
      FOR i IN 0..jsonb_array_length(j -> l -> k) - 1 LOOP
        nm := j -> l -> k ->> i;
        INSERT INTO ora_nls_names VALUES (l, k, CASE WHEN k IN ('day','dy') THEN i ELSE i + 1 END, nm);
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
--;;
-- NLS_DATE_LANGUAGE value -> the language key above. ORA-12702 for anything else.
CREATE FUNCTION ora_lang_norm(s text) RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE u text := upper(btrim(s));
BEGIN
  IF u IN ('AMERICAN', 'ENGLISH') THEN RETURN 'AMERICAN'; END IF;
  IF u IN ('ROMANIAN', 'FRENCH', 'GERMAN') THEN RETURN u; END IF;
  RAISE EXCEPTION 'ORA-12702: invalid NLS parameter string used in SQL function' USING ERRCODE = '22023';
END $$;
--;;
CREATE FUNCTION ora_nls_name(kind text, idx int, lang text) RETURNS text LANGUAGE sql STABLE AS
$$ SELECT name FROM ora_nls_names WHERE ora_nls_names.lang = ora_nls_name.lang AND ora_nls_names.kind = ora_nls_name.kind AND ora_nls_names.idx = ora_nls_name.idx $$;
--;;
-- width names are padded to: the longest name of the language, in characters
CREATE FUNCTION ora_nls_width(kind text, lang text) RETURNS int LANGUAGE sql STABLE AS
$$ SELECT max(char_length(name)) FROM ora_nls_names WHERE ora_nls_names.lang = ora_nls_width.lang AND ora_nls_names.kind = ora_nls_width.kind $$;
--;;

-- ---------------------------------------------------------------- text helpers
-- integer division (the compat layer makes / on integers an Oracle NUMBER division)
CREATE FUNCTION ora_idiv(a bigint, b bigint) RETURNS bigint LANGUAGE sql IMMUTABLE AS $$ SELECT a OPERATOR(pg_catalog./) b $$;
--;;
-- Case of an output word follows the format element: 'DAY' upper, 'Day' initcap, 'day' lower. Returns U, I or L.
CREATE FUNCTION ora_case_mode(tok text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path = pg_catalog, public AS $$
  SELECT CASE WHEN substr(tok, 1, 1) = lower(substr(tok, 1, 1)) AND substr(tok, 1, 1) <> upper(substr(tok, 1, 1)) THEN 'L'
              WHEN char_length(tok) > 1 AND substr(tok, 2, 1) = lower(substr(tok, 2, 1)) AND substr(tok, 2, 1) <> upper(substr(tok, 2, 1)) THEN 'I'
              ELSE 'U' END $$;
--;;
CREATE FUNCTION ora_apply_case(mode text, s text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path = pg_catalog, public AS
$$ SELECT CASE mode WHEN 'U' THEN upper(s) WHEN 'L' THEN lower(s) ELSE initcap(s) END $$;
--;;
-- English cardinal / ordinal words, lower case: 1995 -> 'one thousand nine hundred ninety-five', ordinal 'ninety-fifth'
CREATE FUNCTION ora_spell(n bigint, ordinal boolean DEFAULT false) RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE ones text[] := ARRAY['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
        tens text[] := ARRAY['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
        r text; lastw text; ordw text;
BEGIN
  IF n IS NULL THEN RETURN NULL; END IF;
  IF n < 0 THEN RETURN 'minus ' || ora_spell(-n, ordinal); END IF;
  IF n = 0 THEN r := 'zero';
  ELSIF n < 20 THEN r := ones[n];
  ELSIF n < 100 THEN r := tens[ora_idiv(n, 10) + 1] || CASE WHEN n % 10 > 0 THEN '-' || ones[n % 10] ELSE '' END;
  ELSIF n < 1000 THEN r := ones[ora_idiv(n, 100)] || ' hundred' || CASE WHEN n % 100 > 0 THEN ' ' || ora_spell(n % 100) ELSE '' END;
  ELSIF n < 1000000 THEN r := ora_spell(ora_idiv(n, 1000)) || ' thousand' || CASE WHEN n % 1000 > 0 THEN ' ' || ora_spell(n % 1000) ELSE '' END;
  ELSIF n < 1000000000 THEN r := ora_spell(ora_idiv(n, 1000000)) || ' million' || CASE WHEN n % 1000000 > 0 THEN ' ' || ora_spell(n % 1000000) ELSE '' END;
  ELSE r := ora_spell(ora_idiv(n, 1000000000)) || ' billion' || CASE WHEN n % 1000000000 > 0 THEN ' ' || ora_spell(n % 1000000000) ELSE '' END;
  END IF;
  IF NOT ordinal THEN RETURN r; END IF;
  lastw := regexp_replace(r, '^.*[ -]', '');
  ordw := CASE lastw WHEN 'one' THEN 'first' WHEN 'two' THEN 'second' WHEN 'three' THEN 'third' WHEN 'five' THEN 'fifth'
                     WHEN 'eight' THEN 'eighth' WHEN 'nine' THEN 'ninth' WHEN 'twelve' THEN 'twelfth'
                     ELSE CASE WHEN right(lastw, 1) = 'y' THEN left(lastw, -1) || 'ieth' ELSE lastw || 'th' END END;
  RETURN left(r, length(r) - length(lastw)) || ordw;
END $$;
--;;
-- YEAR / SYEAR : below 100, or a year ending in 01..09, is spelled as one number; any other year as two numbers (nineteen ninety-five)
CREATE FUNCTION ora_spell_year(y int) RETURNS text LANGUAGE sql IMMUTABLE SET search_path = pg_catalog, public AS $$
  SELECT CASE WHEN y < 100 OR y % 100 < 10 THEN ora_spell(y) ELSE ora_spell(ora_idiv(y, 100)) || ' ' || ora_spell(y % 100) END $$;
--;;
CREATE FUNCTION ora_roman(n int) RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE vals int[] := ARRAY[1000,900,500,400,100,90,50,40,10,9,5,4,1];
        syms text[] := ARRAY['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
        r text := ''; k int; m int := n;
BEGIN
  IF n IS NULL OR n < 1 OR n > 3999 THEN RETURN NULL; END IF;
  FOR k IN 1..13 LOOP
    WHILE m >= vals[k] LOOP r := r || syms[k]; m := m - vals[k]; END LOOP;
  END LOOP;
  RETURN r;
END $$;
--;;
CREATE FUNCTION ora_ord_suffix(n bigint) RETURNS text LANGUAGE sql IMMUTABLE SET search_path = pg_catalog, public AS $$
  SELECT CASE WHEN n % 100 BETWEEN 11 AND 13 THEN 'th' WHEN n % 10 = 1 THEN 'st' WHEN n % 10 = 2 THEN 'nd' WHEN n % 10 = 3 THEN 'rd' ELSE 'th' END $$;
--;;

-- ---------------------------------------------------------------- TO_CHAR(date, fmt)
-- d: the value; f: the format model; lang: a key of ora_nls_names; ts: the value is a TIMESTAMP (FF and TZ elements allowed, a DATE refuses them).
CREATE FUNCTION ora_to_char_date(d timestamp, f text, lang text, ts boolean DEFAULT false) RETURNS text LANGUAGE plpgsql STABLE SET search_path = pg_catalog, public AS $$
DECLARE
  rest text := f; res text := ''; fm boolean := false;
  m text[]; tok text; el text; suf text; txt text; mode text; nv bigint; num boolean; sp boolean; th boolean;
  yr int := abs(extract(year FROM d)::int); bc boolean := extract(year FROM d) < 0;
  mo int := extract(month FROM d)::int; dd int := extract(day FROM d)::int;
  hh24 int := extract(hour FROM d)::int; mi int := extract(minute FROM d)::int; ss int := floor(extract(second FROM d))::int;
  doy int := extract(doy FROM d)::int; dow int := extract(dow FROM d)::int;
  h12 int; cc int; iy int := abs(extract(isoyear FROM d)::int); iw int := extract(week FROM d)::int;
  micro int := (extract(microseconds FROM d)::bigint % 1000000)::int;
  w int; ww int; q int; w1 text;
BEGIN
  IF d IS NULL OR f IS NULL THEN RETURN NULL; END IF;
  h12 := CASE WHEN hh24 % 12 = 0 THEN 12 ELSE hh24 % 12 END;
  cc := ora_idiv(yr - 1, 100) + 1; w := ora_idiv(dd - 1, 7) + 1; ww := ora_idiv(doy - 1, 7) + 1; q := ora_idiv(mo - 1, 3) + 1;
  WHILE rest <> '' LOOP
    IF left(rest, 1) = '"' THEN
      m := regexp_match(rest, '^"([^"]*)"');
      IF m IS NULL THEN res := res || substr(rest, 2); EXIT; END IF;    -- an unterminated quote runs to the end of the model
      res := res || m[1]; rest := substr(rest, char_length(m[1]) + 3); CONTINUE;
    END IF;
    m := regexp_match(rest, '^(SYYYY|SYEAR|YEAR|YYYY|YYY|YY|Y,YYY|Y|IYYY|IYY|IY|IW|I|RRRR|RR|MONTH|MON|MM|RM|DDD|DD|DAY|DY|DL|DS|D|HH24|HH12|HH|MI|SSSSS|SS|FF[1-9]?|A\.M\.|P\.M\.|AM|PM|A\.D\.|B\.C\.|AD|BC|TZH|TZM|TZR|TZD|SCC|CC|WW|W|Q|J|TS|FM|FX|EE|E)', 'i');
    IF m IS NULL THEN
      IF left(rest, 1) ~ '[-/,.;:!%&()*+<=>?@\[\]\\^_`{}~# '']' THEN res := res || left(rest, 1); rest := substr(rest, 2); CONTINUE; END IF;
      RAISE EXCEPTION 'ORA-01821: date format not recognized' USING ERRCODE = '22007';
    END IF;
    tok := m[1]; el := upper(tok); rest := substr(rest, char_length(tok) + 1);
    IF el = 'FM' THEN fm := NOT fm; CONTINUE; END IF;
    IF el = 'FX' THEN CONTINUE; END IF;
    IF el IN ('E', 'EE') THEN RAISE EXCEPTION 'ORA-01822: era format code is not valid with this calendar' USING ERRCODE = '22007'; END IF;
    IF NOT ts AND (el LIKE 'FF%' OR el LIKE 'TZ%') THEN RAISE EXCEPTION 'ORA-01821: date format not recognized' USING ERRCODE = '22007'; END IF;
    -- SP / TH suffix: only numeric elements take one
    m := regexp_match(rest, '^(SPTH|THSP|SP|TH)', 'i');
    suf := CASE WHEN m IS NULL THEN '' ELSE upper(m[1]) END;
    num := el IN ('YYYY','YYY','YY','Y','RRRR','RR','IYYY','IYY','IY','I','MM','DDD','DD','D','HH24','HH12','HH','MI','SSSSS','SS','CC','WW','W','IW','Q','J');
    IF suf <> '' THEN
      IF NOT num THEN RAISE EXCEPTION 'ORA-01821: date format not recognized' USING ERRCODE = '22007'; END IF;
      rest := substr(rest, char_length(suf) + 1);
    END IF;
    sp := suf LIKE '%SP%'; th := suf LIKE '%TH%';
    mode := ora_case_mode(tok || suf);
    IF num THEN
      txt := NULL;
      CASE el
        WHEN 'YYYY' THEN nv := yr; txt := lpad(yr::text, 4, '0');
        WHEN 'RRRR' THEN nv := yr; txt := lpad(yr::text, 4, '0');
        WHEN 'YYY' THEN nv := yr % 1000; txt := lpad((yr % 1000)::text, 3, '0');
        WHEN 'YY' THEN nv := yr % 100; txt := lpad((yr % 100)::text, 2, '0');
        WHEN 'RR' THEN nv := yr % 100; txt := lpad((yr % 100)::text, 2, '0');
        WHEN 'Y' THEN nv := yr % 10; txt := (yr % 10)::text;
        WHEN 'IYYY' THEN nv := iy; txt := lpad(iy::text, 4, '0');
        WHEN 'IYY' THEN nv := iy % 1000; txt := lpad((iy % 1000)::text, 3, '0');
        WHEN 'IY' THEN nv := iy % 100; txt := lpad((iy % 100)::text, 2, '0');
        WHEN 'I' THEN nv := iy % 10; txt := (iy % 10)::text;
        WHEN 'MM' THEN nv := mo; txt := lpad(mo::text, 2, '0');
        WHEN 'DDD' THEN nv := doy; txt := lpad(doy::text, 3, '0');
        WHEN 'DD' THEN nv := dd; txt := lpad(dd::text, 2, '0');
        WHEN 'D' THEN nv := dow + 1; txt := (dow + 1)::text;
        WHEN 'HH24' THEN nv := hh24; txt := lpad(hh24::text, 2, '0');
        WHEN 'HH12' THEN nv := h12; txt := lpad(h12::text, 2, '0');
        WHEN 'HH' THEN nv := h12; txt := lpad(h12::text, 2, '0');
        WHEN 'MI' THEN nv := mi; txt := lpad(mi::text, 2, '0');
        WHEN 'SS' THEN nv := ss; txt := lpad(ss::text, 2, '0');
        WHEN 'SSSSS' THEN nv := hh24 * 3600 + mi * 60 + ss; txt := lpad(nv::text, 5, '0');
        WHEN 'CC' THEN nv := cc; txt := lpad(cc::text, 2, '0');
        WHEN 'WW' THEN nv := ww; txt := lpad(ww::text, 2, '0');
        WHEN 'W' THEN nv := w; txt := w::text;
        WHEN 'IW' THEN nv := iw; txt := lpad(iw::text, 2, '0');
        WHEN 'Q' THEN nv := q; txt := q::text;
        WHEN 'J' THEN nv := floor(extract(julian FROM d)); txt := nv::text;
      END CASE;
      IF sp THEN
        txt := ora_apply_case(mode, ora_spell(nv, th));
      ELSE
        IF fm AND el NOT IN ('J') THEN txt := coalesce(nullif(ltrim(txt, '0'), ''), '0'); END IF;
        IF th THEN txt := txt || CASE WHEN mode = 'U' THEN upper(ora_ord_suffix(nv)) ELSE ora_ord_suffix(nv) END; END IF;
      END IF;
      res := res || txt; CONTINUE;
    END IF;
    CASE el
      WHEN 'SYYYY' THEN txt := CASE WHEN bc THEN '-' ELSE ' ' END || lpad(yr::text, 4, '0');
      WHEN 'Y,YYY' THEN
        txt := CASE WHEN fm AND yr < 1000 THEN (yr % 1000)::text ELSE ora_idiv(yr, 1000)::text || ',' || lpad((yr % 1000)::text, 3, '0') END;
      WHEN 'SCC' THEN txt := CASE WHEN bc THEN '-' ELSE ' ' END || lpad(cc::text, 2, '0');
      WHEN 'YEAR' THEN txt := ora_apply_case(mode, ora_spell_year(yr));
      WHEN 'SYEAR' THEN txt := CASE WHEN bc THEN '-' ELSE ' ' END || ora_apply_case(mode, ora_spell_year(yr));
      WHEN 'MONTH' THEN txt := ora_apply_case(mode, ora_nls_name('month', mo, lang)); IF NOT fm THEN txt := rpad(txt, ora_nls_width('month', lang)); END IF;
      WHEN 'MON' THEN txt := ora_apply_case(mode, ora_nls_name('mon', mo, lang)); IF NOT fm THEN txt := rpad(txt, ora_nls_width('mon', lang)); END IF;
      WHEN 'DAY' THEN txt := ora_apply_case(mode, ora_nls_name('day', dow, lang)); IF NOT fm THEN txt := rpad(txt, ora_nls_width('day', lang)); END IF;
      WHEN 'DY' THEN txt := ora_apply_case(mode, ora_nls_name('dy', dow, lang)); IF NOT fm THEN txt := rpad(txt, ora_nls_width('dy', lang)); END IF;
      WHEN 'RM' THEN txt := ora_apply_case(mode, ora_roman(mo)); IF NOT fm THEN txt := rpad(txt, 4); END IF;
      WHEN 'AM' THEN txt := ora_apply_case(mode, CASE WHEN hh24 < 12 THEN 'AM' ELSE 'PM' END);
      WHEN 'PM' THEN txt := ora_apply_case(mode, CASE WHEN hh24 < 12 THEN 'AM' ELSE 'PM' END);
      WHEN 'A.M.' THEN txt := ora_apply_case(mode, CASE WHEN hh24 < 12 THEN 'A.M.' ELSE 'P.M.' END);
      WHEN 'P.M.' THEN txt := ora_apply_case(mode, CASE WHEN hh24 < 12 THEN 'A.M.' ELSE 'P.M.' END);
      WHEN 'AD' THEN txt := ora_apply_case(mode, CASE WHEN bc THEN 'BC' ELSE 'AD' END);
      WHEN 'BC' THEN txt := ora_apply_case(mode, CASE WHEN bc THEN 'BC' ELSE 'AD' END);
      WHEN 'A.D.' THEN txt := ora_apply_case(mode, CASE WHEN bc THEN 'B.C.' ELSE 'A.D.' END);
      WHEN 'B.C.' THEN txt := ora_apply_case(mode, CASE WHEN bc THEN 'B.C.' ELSE 'A.D.' END);
      WHEN 'DL' THEN txt := rtrim(ora_to_char_date(d, 'Day', lang)) || ', ' || rtrim(ora_to_char_date(d, 'Month', lang)) || ' ' || lpad(dd::text, 2, '0') || ', ' || lpad(yr::text, 4, '0');
      WHEN 'DS' THEN txt := mo::text || '/' || dd::text || '/' || yr::text;
      WHEN 'TS' THEN txt := h12::text || ':' || lpad(mi::text, 2, '0') || ':' || lpad(ss::text, 2, '0') || ' ' || CASE WHEN hh24 < 12 THEN 'AM' ELSE 'PM' END;
      WHEN 'TZH' THEN txt := '+00';
      WHEN 'TZM' THEN txt := '00';
      WHEN 'TZR' THEN txt := '+00:00';
      WHEN 'TZD' THEN txt := 'UTC';
      ELSE
        IF el LIKE 'FF%' THEN
          txt := lpad(micro::text, 6, '0');
          w1 := substr(el, 3);
          txt := CASE WHEN w1 = '' THEN txt ELSE rpad(txt, w1::int, '0') END;
          IF w1 <> '' THEN txt := left(txt, w1::int); END IF;
        ELSE
          RAISE EXCEPTION 'ORA-01821: date format not recognized' USING ERRCODE = '22007';
        END IF;
    END CASE;
    res := res || txt;
  END LOOP;
  RETURN res;
END $$;
--;;
-- one-argument and two-argument forms use the session language
CREATE FUNCTION to_char(d timestamp, f text) RETURNS text LANGUAGE sql STABLE AS $$ SELECT ora_to_char_date(d, f, ora_lang()) $$;
--;;
CREATE FUNCTION to_char(d timestamptz, f text) RETURNS text LANGUAGE sql STABLE AS
$$ SELECT ora_to_char_date(d AT TIME ZONE 'UTC', f, ora_lang(), true) $$;
--;;
-- implicit DATE -> VARCHAR2 uses NLS_DATE_FORMAT, DD-MON-RR by default (replaces the English-only stub of 00-base)
CREATE OR REPLACE FUNCTION ora_d2t(d timestamp) RETURNS text LANGUAGE sql STABLE AS $$ SELECT ora_to_char_date(d, ora_datefmt(), ora_lang()) $$;
--;;
CREATE OR REPLACE FUNCTION to_char(d timestamp) RETURNS text LANGUAGE sql STABLE AS $$ SELECT ora_d2t(d) $$;
--;;

-- ---------------------------------------------------------------- TO_CHAR(number, fmt)
-- Layout (measured against Oracle 11.2): [sign slot][currency field][digit body]. The sign and the currency symbol float
-- to the position just left of the first printed character of the body. A number that does not fit prints as '#', as wide
-- as the layout. Currency fields: $ 1 character, L and U 10, C 7 (USD).
CREATE FUNCTION ora_to_char_num(n0 numeric, f text) RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE
  u text; i int := 1; c text;
  fm boolean := false; lead boolean := false; trail text := ''; cur text := ''; blankzero boolean := false;
  hasE boolean := false; roman boolean := false; hex boolean := false;
  body text := ''; intpos int := 0; fracpos int := 0; vpos int := 0; seendec boolean := false; seenv boolean := false;
  neg boolean; n numeric; sciexp int := 0; ip text; fp text; digits text; fracdigits text;
  cw int; sym text; signslot boolean; sgn text; width int; blen int;
  out text := ''; pastdec boolean := false; di int := 0; fi int := 0; started boolean := false; first0 int; lastzero int; zi int; k int; run int; res text;
BEGIN
  IF n0 IS NULL OR f IS NULL THEN RETURN NULL; END IF;
  u := upper(f);
  neg := n0 < 0;
  -- 1. parse the model
  WHILE i <= length(u) LOOP
    c := substr(u, i, 1);
    IF substr(u, i, 2) = 'FM' THEN fm := true; i := i + 2;
    ELSIF c = 'B' THEN blankzero := true; i := i + 1;
    ELSIF substr(u, i, 4) = 'EEEE' THEN hasE := true; i := i + 4;
    ELSIF substr(u, i, 2) = 'RN' THEN roman := true; i := i + 2;
    ELSIF c = 'X' THEN hex := true; body := body || 'X'; i := i + 1;
    ELSIF substr(u, i, 2) IN ('MI', 'PR') AND i + 1 = length(u) THEN trail := substr(u, i, 2); i := i + 2;
    ELSIF c = 'S' AND body = '' AND NOT lead AND cur = '' THEN lead := true; i := i + 1;
    ELSIF c = 'S' AND i = length(u) AND NOT lead THEN trail := 'S'; i := i + 1;
    ELSIF c IN ('$', 'L', 'C', 'U') AND cur = '' THEN cur := c; i := i + 1;
    ELSIF c IN ('9', '0') THEN
      body := body || c; i := i + 1;
      IF seendec THEN fracpos := fracpos + 1; ELSE intpos := intpos + 1; IF seenv THEN vpos := vpos + 1; END IF; END IF;
    ELSIF c IN (',', 'G') AND NOT seendec THEN body := body || ','; i := i + 1;
    ELSIF c IN ('.', 'D') AND NOT seendec AND NOT seenv THEN body := body || '.'; seendec := true; i := i + 1;
    ELSIF c = 'V' AND NOT seendec AND NOT seenv THEN seenv := true; i := i + 1;
    ELSE RAISE EXCEPTION 'ORA-01481: invalid number format model' USING ERRCODE = '22023';
    END IF;
  END LOOP;
  -- 2. whole-number models
  IF hex THEN
    width := length(body);
    res := CASE WHEN neg THEN NULL ELSE to_hex(pg_catalog.round(n0)::bigint) END;
    IF res IS NULL OR length(res) > width OR body <> repeat('X', width) THEN RETURN repeat('#', width + 1); END IF;
    res := CASE WHEN f ~ 'x' THEN lower(res) ELSE upper(res) END;
    RETURN CASE WHEN fm THEN res ELSE ' ' || lpad(res, width) END;
  END IF;
  IF roman THEN
    n := pg_catalog.round(n0);
    res := CASE WHEN neg OR n < 1 OR n > 3999 THEN NULL ELSE ora_roman(n::int) END;
    IF res IS NULL THEN RETURN repeat('#', 15); END IF;
    IF f ~ 'rn' THEN res := lower(res); END IF;
    RETURN CASE WHEN fm THEN res ELSE lpad(res, 15) END;
  END IF;
  -- 3. the digits
  cw := CASE cur WHEN 'L' THEN 10 WHEN 'U' THEN 10 WHEN 'C' THEN 7 WHEN '$' THEN 1 ELSE 0 END;
  sym := CASE cur WHEN 'C' THEN 'USD' WHEN '' THEN '' ELSE '$' END;
  signslot := trail NOT IN ('MI', 'S');
  blen := length(body);
  width := CASE WHEN signslot THEN 1 ELSE 0 END + cw + blen + CASE WHEN trail IN ('MI', 'S', 'PR') THEN 1 ELSE 0 END;
  n := abs(n0);
  IF hasE AND n <> 0 THEN
    sciexp := ora_nweight(n);
    n := n / (10::numeric ^ sciexp);
    IF pg_catalog.round(n, fracpos) >= 10 THEN n := n / 10; sciexp := sciexp + 1; END IF;
  END IF;
  n := pg_catalog.round(n * (10::numeric ^ vpos), fracpos);
  IF blankzero AND n = 0 THEN RETURN CASE WHEN fm THEN '' ELSE repeat(' ', width) END; END IF;
  ip := split_part(n::text, '.', 1); fp := rpad(split_part(n::text, '.', 2), fracpos, '0');
  IF ip = '0' THEN ip := ''; END IF;
  IF length(ip) > intpos THEN RETURN repeat('#', width); END IF;
  digits := lpad(ip, intpos, ' ');
  IF ip = '' AND intpos > 0 AND fracpos = 0 THEN digits := left(digits, intpos - 1) || '0'; END IF;  -- TO_CHAR(0, '999') is '0'
  -- every slot from the first 0 element on is a digit
  first0 := NULL; di := 0;
  FOR k IN 1..blen LOOP
    c := substr(body, k, 1);
    IF c = '.' THEN EXIT; END IF;
    IF c IN ('9', '0') THEN di := di + 1; IF c = '0' AND first0 IS NULL THEN first0 := di; END IF; END IF;
  END LOOP;
  IF first0 IS NOT NULL THEN
    FOR di IN first0..intpos LOOP
      IF substr(digits, di, 1) = ' ' THEN digits := left(digits, di - 1) || '0' || substr(digits, di + 1); END IF;
    END LOOP;
  END IF;
  -- FM drops the zeros of trailing 9 slots after the point
  fracdigits := fp; lastzero := 0; zi := 0; seendec := false;
  FOR k IN 1..blen LOOP
    c := substr(body, k, 1);
    IF c = '.' THEN seendec := true; ELSIF seendec THEN zi := zi + 1; IF c = '0' THEN lastzero := zi; END IF; END IF;
  END LOOP;
  IF fm THEN
    WHILE length(fracdigits) > lastzero AND right(fracdigits, 1) = '0' LOOP fracdigits := left(fracdigits, length(fracdigits) - 1); END LOOP;
  END IF;
  -- 4. the body
  di := 0; fi := 0;
  FOR k IN 1..blen LOOP
    c := substr(body, k, 1);
    IF c = ',' THEN out := out || CASE WHEN started THEN ',' ELSE ' ' END;
    ELSIF c = '.' THEN out := out || '.'; pastdec := true;
    ELSIF NOT pastdec THEN
      di := di + 1; out := out || substr(digits, di, 1);
      IF substr(digits, di, 1) <> ' ' THEN started := true; END IF;
    ELSE
      fi := fi + 1; out := out || CASE WHEN fi <= length(fracdigits) THEN substr(fracdigits, fi, 1) ELSE '' END;
    END IF;
  END LOOP;
  -- 5. sign and currency float to the first printed character
  sgn := CASE WHEN neg THEN CASE trail WHEN 'PR' THEN '<' WHEN 'MI' THEN '' WHEN 'S' THEN '' ELSE '-' END
              WHEN lead THEN '+' ELSE '' END;
  run := length(out) - length(ltrim(out, ' '));
  res := lpad(sgn || sym, CASE WHEN signslot THEN 1 ELSE 0 END + cw + run) || substr(out, run + 1);
  IF trail = 'MI' THEN res := res || CASE WHEN neg THEN '-' ELSE ' ' END;
  ELSIF trail = 'S' THEN res := res || CASE WHEN neg THEN '-' ELSE '+' END;
  ELSIF trail = 'PR' THEN res := res || CASE WHEN neg THEN '>' ELSE ' ' END;
  END IF;
  IF hasE THEN res := ' ' || res || 'E' || CASE WHEN sciexp < 0 THEN '-' ELSE '+' END || lpad(abs(sciexp)::text, 2, '0'); END IF;
  IF fm THEN
    res := btrim(res, ' ');
    IF fracpos > 0 AND NOT res ~ '[0-9]' THEN res := '0' || res; END IF;
  END IF;
  RETURN res;
END $$;
--;;
CREATE FUNCTION to_char(n numeric, f text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_to_char_num(n, f) $$;
--;;
CREATE FUNCTION to_char(n int4, f text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_to_char_num(n::numeric, f) $$;
--;;
CREATE FUNCTION to_char(n int8, f text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_to_char_num(n::numeric, f) $$;
--;;
CREATE FUNCTION to_char(n int2, f text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_to_char_num(n::numeric, f) $$;
--;;
CREATE FUNCTION to_char(n float8, f text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_to_char_num(n::numeric, f) $$;
--;;
CREATE FUNCTION to_char(n float4, f text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_to_char_num(n::numeric, f) $$;
