-- 30-numbers.sql : NUMBER semantics: 40-digit precision, division, arithmetic on strings, NVL/NVL2, TO_NUMBER, TO_CHAR(number) and TO_CHAR(text).
-- ---------------------------------------------------------------- NUMBER precision
-- An Oracle NUMBER keeps 20 base-100 digits: 40 significant decimal digits when the leading base-100 digit has two
-- decimal digits (the leading decimal digit sits at an odd power of ten), 39 when it has one. Results of + - * / are cut
-- to that; the result grid shows 39 (engine/format.js), which is why 1/3*3 prints 1 where PostgreSQL prints .99999...
-- ora_nweight: the power of ten of the leading digit of n (n <> 0): 0 for 5, 2 for 450, -1 for .3, -2 for .03
CREATE FUNCTION ora_nweight(n numeric) RETURNS int LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE s text := abs(n)::text; ip text := split_part(abs(n)::text, '.', 1); fp text := split_part(abs(n)::text, '.', 2);
BEGIN
  IF ip <> '0' THEN RETURN length(ip) - 1; END IF;
  RETURN -(length(fp) - length(ltrim(fp, '0'))) - 1;
END $$;
--;;
CREATE FUNCTION ora_nround(n numeric) RETURNS numeric LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE s text; ip text; fp text; e int; p int; sig int;
BEGIN
  IF n IS NULL OR n = 0 THEN RETURN n; END IF;
  s := abs(n)::text; ip := split_part(s, '.', 1); fp := split_part(s, '.', 2);
  IF ip <> '0' THEN e := length(ip) - 1; sig := length(ip) + length(fp);
  ELSE e := -(length(fp) - length(ltrim(fp, '0'))) - 1; sig := length(ltrim(fp, '0')); END IF;
  p := CASE WHEN e % 2 <> 0 THEN 40 ELSE 39 END;
  IF sig <= p THEN RETURN n; END IF;
  RETURN pg_catalog.round(n, p - 1 - e);
END $$;
--;;
-- a / b to the full NUMBER precision (PostgreSQL stops at about 20 digits)
CREATE FUNCTION ora_ndiv(a numeric, b numeric) RETURNS numeric LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE q numeric; e int; sc int;
BEGIN
  IF a IS NULL OR b IS NULL THEN RETURN NULL; END IF;
  IF b = 0 THEN RAISE EXCEPTION 'divisor is equal to zero' USING ERRCODE = '22012'; END IF;
  IF a = 0 THEN RETURN 0; END IF;
  q := a OPERATOR(pg_catalog./) b;
  IF q = 0 THEN RETURN 0; END IF;
  e := ora_nweight(q);
  sc := CASE WHEN e % 2 <> 0 THEN 40 ELSE 39 END - 1 - e;
  RETURN pg_catalog.round((a OPERATOR(pg_catalog.*) ('1e' || sc)::numeric) OPERATOR(pg_catalog./) b) OPERATOR(pg_catalog.*) ('1e' || (-sc))::numeric;
END $$;
--;;
CREATE FUNCTION ora_nadd(a numeric, b numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT ora_nround(a OPERATOR(pg_catalog.+) b) $$;
--;;
CREATE FUNCTION ora_nsub(a numeric, b numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT ora_nround(a OPERATOR(pg_catalog.-) b) $$;
--;;
CREATE FUNCTION ora_nmul(a numeric, b numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT ora_nround(a OPERATOR(pg_catalog.*) b) $$;
--;;
CREATE OPERATOR + (LEFTARG=numeric, RIGHTARG=numeric, FUNCTION=ora_nadd);
--;;
CREATE OPERATOR - (LEFTARG=numeric, RIGHTARG=numeric, FUNCTION=ora_nsub);
--;;
CREATE OPERATOR * (LEFTARG=numeric, RIGHTARG=numeric, FUNCTION=ora_nmul);
--;;
CREATE OPERATOR / (LEFTARG=numeric, RIGHTARG=numeric, FUNCTION=ora_ndiv);
--;;
-- SQRT of a NUMBER is a NUMBER with the same precision (PostgreSQL's sqrt(int) is a double precision)
CREATE FUNCTION sqrt(n numeric) RETURNS numeric LANGUAGE plpgsql IMMUTABLE SET search_path = pg_catalog, public AS $$
DECLARE sc int;
BEGIN
  IF n IS NULL THEN RETURN NULL; END IF;
  IF n < 0 THEN RAISE EXCEPTION 'ORA-01428: argument ''%'' is out of range', ora_n2t(n) USING ERRCODE = '22023'; END IF;
  IF n = 0 THEN RETURN 0; END IF;
  sc := 42 - ora_nweight(n) / 2;
  RETURN ora_nround(pg_catalog.round(pg_catalog.sqrt(n OPERATOR(pg_catalog.*) ('1e' || (2 * sc))::numeric)) OPERATOR(pg_catalog.*) ('1e' || (-sc))::numeric);
END $$;
--;;
CREATE FUNCTION sqrt(n int4) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT sqrt(n::numeric) $$;
--;;
CREATE FUNCTION sqrt(n int8) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT sqrt(n::numeric) $$;
--;;
CREATE FUNCTION sqrt(n int2) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT sqrt(n::numeric) $$;
--;;
-- AVG keeps the NUMBER precision (PostgreSQL's avg of integers stops at about 16 digits). State: {sum, count}.
CREATE FUNCTION ora_avg_acc(st numeric[], v numeric) RETURNS numeric[] LANGUAGE sql IMMUTABLE STRICT AS
$$ SELECT ARRAY[st[1] OPERATOR(pg_catalog.+) v, st[2] OPERATOR(pg_catalog.+) 1] $$;
--;;
CREATE FUNCTION ora_avg_fin(st numeric[]) RETURNS numeric LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN st[2] = 0 THEN NULL ELSE ora_ndiv(st[1], st[2]) END $$;
--;;
CREATE AGGREGATE avg(numeric) (SFUNC = ora_avg_acc, STYPE = numeric[], FINALFUNC = ora_avg_fin, INITCOND = '{0,0}');
--;;
CREATE FUNCTION ora_avg_acc(st numeric[], v int8) RETURNS numeric[] LANGUAGE sql IMMUTABLE STRICT AS $$ SELECT ora_avg_acc(st, v::numeric) $$;
--;;
CREATE AGGREGATE avg(int8) (SFUNC = ora_avg_acc, STYPE = numeric[], FINALFUNC = ora_avg_fin, INITCOND = '{0,0}');
--;;
CREATE FUNCTION ora_avg_acc(st numeric[], v int4) RETURNS numeric[] LANGUAGE sql IMMUTABLE STRICT AS $$ SELECT ora_avg_acc(st, v::numeric) $$;
--;;
CREATE AGGREGATE avg(int4) (SFUNC = ora_avg_acc, STYPE = numeric[], FINALFUNC = ora_avg_fin, INITCOND = '{0,0}');
--;;
CREATE FUNCTION ora_avg_acc(st numeric[], v int2) RETURNS numeric[] LANGUAGE sql IMMUTABLE STRICT AS $$ SELECT ora_avg_acc(st, v::numeric) $$;
--;;
CREATE AGGREGATE avg(int2) (SFUNC = ora_avg_acc, STYPE = numeric[], FINALFUNC = ora_avg_fin, INITCOND = '{0,0}');
--;;
-- SUM / AVG of text: Oracle converts VARCHAR2 to NUMBER implicitly (SUM(DECODE(an, 1, NULL, bursa)) is typed text when the first
-- value is NULL); bad text raises ORA-01722 as to_number does.
CREATE FUNCTION ora_sum_acc_text(st numeric, v text) RETURNS numeric LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN v IS NULL THEN st WHEN st IS NULL THEN v::numeric ELSE ora_nadd(st, v::numeric) END $$;
--;;
CREATE AGGREGATE sum(text) (SFUNC = ora_sum_acc_text, STYPE = numeric);
--;;
CREATE FUNCTION ora_avg_acc(st numeric[], v text) RETURNS numeric[] LANGUAGE sql IMMUTABLE STRICT AS $$ SELECT ora_avg_acc(st, v::numeric) $$;
--;;
CREATE AGGREGATE avg(text) (SFUNC = ora_avg_acc, STYPE = numeric[], FINALFUNC = ora_avg_fin, INITCOND = '{0,0}');
--;;
-- STDDEV / VARIANCE family of text (same implicit VARCHAR2 -> NUMBER conversion): collect the converted values, let the built-in
-- aggregate do the arithmetic in the final function.
CREATE FUNCTION ora_collect_text(st numeric[], v text) RETURNS numeric[] LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN v IS NULL THEN st ELSE array_append(st, v::numeric) END $$;
--;;
DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY['stddev','stddev_samp','stddev_pop','variance','var_samp','var_pop'] LOOP
    EXECUTE format('CREATE FUNCTION %I(st numeric[]) RETURNS numeric LANGUAGE sql IMMUTABLE AS $f$ SELECT pg_catalog.%s(x) FROM unnest(st) x $f$', 'ora_fin_'||f, f);
    EXECUTE format('CREATE AGGREGATE %I(text) (SFUNC = ora_collect_text, STYPE = numeric[], FINALFUNC = %I, INITCOND = %L)', f, 'ora_fin_'||f, '{}');
  END LOOP;
END $$;
--;;
-- ---------------------------------------------------------------- integer division -> NUMBER division (7/2 = 3.5)
DO $$
DECLARE t1 text; t2 text; nm text;
BEGIN
  FOREACH t1 IN ARRAY ARRAY['int2','int4','int8'] LOOP
    FOREACH t2 IN ARRAY ARRAY['int2','int4','int8'] LOOP
      nm := 'ora_div_'||t1||'_'||t2;
      EXECUTE format('CREATE FUNCTION %I(a %s, b %s) RETURNS numeric LANGUAGE sql IMMUTABLE AS $f$ SELECT ora_ndiv(a::numeric, b::numeric) $f$', nm, t1, t2);
      EXECUTE format('CREATE OPERATOR / (LEFTARG=%s, RIGHTARG=%s, FUNCTION=%I)', t1, t2, nm);
    END LOOP;
  END LOOP;
END $$;
--;;
-- (c) arithmetic on a string operand: Oracle converts it to NUMBER (30 - TO_CHAR(d,'DD'))
DO $$
DECLARE o text; nm text; ops text[] := ARRAY['+','-','*','/'];
        names text[] := ARRAY['add','sub','mul','div']; i int;
BEGIN
  FOR i IN 1..4 LOOP
    o := ops[i];
    nm := 'ora_ar_nt_'||names[i];
    EXECUTE format('CREATE FUNCTION %I(a numeric, b text) RETURNS numeric LANGUAGE sql IMMUTABLE AS $f$ SELECT a %s b::numeric $f$', nm, o);
    EXECUTE format('CREATE OPERATOR %s (LEFTARG=numeric, RIGHTARG=text, FUNCTION=%I)', o, nm);
    nm := 'ora_ar_tn_'||names[i];
    EXECUTE format('CREATE FUNCTION %I(a text, b numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $f$ SELECT a::numeric %s b $f$', nm, o);
    EXECUTE format('CREATE OPERATOR %s (LEFTARG=text, RIGHTARG=numeric, FUNCTION=%I)', o, nm);
  END LOOP;
END $$;
--;;
-- ---------------------------------------------------------------- NVL / NVL2 (DECODE, GREATEST, LEAST: rewriter -> CASE)
CREATE FUNCTION nvl(a anycompatible, b anycompatible) RETURNS anycompatible LANGUAGE sql IMMUTABLE AS $$ SELECT coalesce(a,b) $$;
--;;
CREATE FUNCTION nvl2(e anyelement, a anycompatible, b anycompatible) RETURNS anycompatible LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN e IS NOT NULL THEN a ELSE b END $$;
--;;
-- Mixed argument types. NVL, NVL2, DECODE (results), GREATEST and LEAST return the type of their first value expression and
-- convert the others to it (a number to its text, a text to the number it spells, ORA-01722 when it is none). The rewriter
-- (pass-decode) wraps the first expression in ora_widen and the others in ora_conv(value, ora_widen(first)).
-- ora_widen: Oracle has one number type, so every PostgreSQL number type is a NUMERIC
CREATE FUNCTION ora_widen(v int2) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT v::numeric $$;
--;;
CREATE FUNCTION ora_widen(v int4) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT v::numeric $$;
--;;
CREATE FUNCTION ora_widen(v int8) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT v::numeric $$;
--;;
CREATE FUNCTION ora_widen(v float4) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT v::numeric $$;
--;;
CREATE FUNCTION ora_widen(v float8) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT v::numeric $$;
--;;
CREATE FUNCTION ora_widen(v numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT v $$;
--;;
CREATE FUNCTION ora_widen(v text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT v $$;
--;;
CREATE FUNCTION ora_widen(v bpchar) RETURNS bpchar LANGUAGE sql IMMUTABLE AS $$ SELECT v $$;
--;;
CREATE FUNCTION ora_widen(v timestamp) RETURNS timestamp LANGUAGE sql IMMUTABLE AS $$ SELECT v $$;
--;;
CREATE FUNCTION ora_widen(v timestamptz) RETURNS timestamptz LANGUAGE sql IMMUTABLE AS $$ SELECT v $$;
--;;
CREATE FUNCTION ora_widen(v anyelement) RETURNS anyelement LANGUAGE sql IMMUTABLE AS $$ SELECT v $$;
--;;
CREATE FUNCTION ora_conv(v anycompatible, tmpl anyelement) RETURNS anyelement LANGUAGE plpgsql STABLE SET search_path = pg_catalog, public AS $$
DECLARE tt regtype := pg_typeof(tmpl); vt regtype := pg_typeof(v);
        nums regtype[] := ARRAY['smallint','integer','bigint','numeric','real','double precision']::regtype[];
        txts regtype[] := ARRAY['text','character','character varying']::regtype[];
BEGIN
  IF v IS NULL THEN RETURN NULL; END IF;
  IF tt = vt THEN RETURN v; END IF;
  IF vt = ANY(nums) THEN
    IF tt = 'numeric'::regtype THEN RETURN v::numeric;
    ELSIF tt = ANY(txts) THEN RETURN ora_n2t(v::numeric); END IF;
  ELSIF vt = ANY(txts) THEN
    IF tt = 'numeric'::regtype THEN RETURN v::text::numeric;
    ELSIF tt = 'timestamp without time zone'::regtype THEN RETURN to_date(v::text);
    ELSIF tt = ANY(txts) THEN RETURN v::text; END IF;
  ELSIF vt = 'timestamp without time zone'::regtype AND tt = ANY(txts) THEN RETURN ora_d2t(v);
  END IF;
  RAISE EXCEPTION 'ORA-00932: inconsistent datatypes: expected % got %', tt, vt USING ERRCODE = '42804';
END $$;
--;;
-- ---------------------------------------------------------------- number/char conversions
CREATE FUNCTION to_number(s text) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT s::numeric $$;
--;;
CREATE FUNCTION to_char(n numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(n) $$;
--;;
CREATE FUNCTION to_char(s text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT s $$;
--;;
