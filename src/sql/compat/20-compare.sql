-- 20-compare.sql : integer division, comparisons and arithmetic with implicit conversion.
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

-- ---------------------------------------------------------------- comparisons with implicit conversion
-- (a) CHAR vs VARCHAR2 : Oracle uses NON-padded comparison, PG strips the CHAR padding -> restore it
-- (b) text/CHAR vs NUMBER : Oracle converts the string to a number (ORA-01722 if it is not numeric)
DO $$
DECLARE o text; nm text; ops text[] := ARRAY['=','<>','<','>','<=','>='];
        names text[] := ARRAY['eq','ne','lt','gt','le','ge']; i int;
BEGIN
  FOR i IN 1..6 LOOP
    o := ops[i];
    nm := 'ora_cmp_bt_'||names[i];
    EXECUTE format('CREATE FUNCTION %I(a bpchar, b text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $f$ SELECT ora_p(a) %s b $f$', nm, o);
    EXECUTE format('CREATE OPERATOR %s (LEFTARG=bpchar, RIGHTARG=text, FUNCTION=%I)', o, nm);
    nm := 'ora_cmp_tb_'||names[i];
    EXECUTE format('CREATE FUNCTION %I(a text, b bpchar) RETURNS boolean LANGUAGE sql IMMUTABLE AS $f$ SELECT a %s ora_p(b) $f$', nm, o);
    EXECUTE format('CREATE OPERATOR %s (LEFTARG=text, RIGHTARG=bpchar, FUNCTION=%I)', o, nm);
    nm := 'ora_cmp_tn_'||names[i];
    EXECUTE format('CREATE FUNCTION %I(a text, b numeric) RETURNS boolean LANGUAGE sql IMMUTABLE AS $f$ SELECT a::numeric %s b $f$', nm, o);
    EXECUTE format('CREATE OPERATOR %s (LEFTARG=text, RIGHTARG=numeric, FUNCTION=%I)', o, nm);
    nm := 'ora_cmp_nt_'||names[i];
    EXECUTE format('CREATE FUNCTION %I(a numeric, b text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $f$ SELECT a %s b::numeric $f$', nm, o);
    EXECUTE format('CREATE OPERATOR %s (LEFTARG=numeric, RIGHTARG=text, FUNCTION=%I)', o, nm);
    nm := 'ora_cmp_bn_'||names[i];
    EXECUTE format('CREATE FUNCTION %I(a bpchar, b numeric) RETURNS boolean LANGUAGE sql IMMUTABLE AS $f$ SELECT a::text::numeric %s b $f$', nm, o);
    EXECUTE format('CREATE OPERATOR %s (LEFTARG=bpchar, RIGHTARG=numeric, FUNCTION=%I)', o, nm);
    nm := 'ora_cmp_nb_'||names[i];
    EXECUTE format('CREATE FUNCTION %I(a numeric, b bpchar) RETURNS boolean LANGUAGE sql IMMUTABLE AS $f$ SELECT a %s b::text::numeric $f$', nm, o);
    EXECUTE format('CREATE OPERATOR %s (LEFTARG=numeric, RIGHTARG=bpchar, FUNCTION=%I)', o, nm);
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
