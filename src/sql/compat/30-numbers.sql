-- 30-numbers.sql : NUMBER semantics: division, arithmetic on strings, NVL/NVL2, TO_NUMBER, TO_CHAR(number) and TO_CHAR(text).
-- ---------------------------------------------------------------- integer division -> NUMBER division (7/2 = 3.5)
DO $$
DECLARE t1 text; t2 text; nm text;
BEGIN
  FOREACH t1 IN ARRAY ARRAY['int2','int4','int8'] LOOP
    FOREACH t2 IN ARRAY ARRAY['int2','int4','int8'] LOOP
      nm := 'ora_div_'||t1||'_'||t2;
      EXECUTE format('CREATE FUNCTION %I(a %s, b %s) RETURNS numeric LANGUAGE sql IMMUTABLE AS $f$ SELECT a::numeric / b::numeric $f$', nm, t1, t2);
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
-- ---------------------------------------------------------------- number/char conversions
CREATE FUNCTION to_number(s text) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT s::numeric $$;
--;;
CREATE FUNCTION to_char(n numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(n) $$;
--;;
CREATE FUNCTION to_char(s text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT s $$;
--;;
