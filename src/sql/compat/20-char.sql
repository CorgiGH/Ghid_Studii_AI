-- 20-char.sql : CHAR(n) blank-padding semantics, string concatenation (|| and CONCAT), comparisons with implicit conversion, LENGTH/UPPER/LOWER/INITCAP.
-- ---------------------------------------------------------------- || (NULL = '', number/date implicit conversion)
CREATE FUNCTION ora_cat(a text, b text) RETURNS text LANGUAGE sql IMMUTABLE AS
$$ SELECT nullif(pg_catalog.concat(a,b),'') $$;
--;;
CREATE FUNCTION ora_cat_tn(a text, b numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(a, ora_n2t(b)) $$;
--;;
CREATE FUNCTION ora_cat_nt(a numeric, b text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(ora_n2t(a), b) $$;
--;;
CREATE FUNCTION ora_cat_nn(a numeric, b numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(ora_n2t(a), ora_n2t(b)) $$;
--;;
CREATE FUNCTION ora_cat_td(a text, b timestamp) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(a, ora_d2t(b)) $$;
--;;
CREATE FUNCTION ora_cat_dt(a timestamp, b text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(ora_d2t(a), b) $$;
--;;
CREATE FUNCTION ora_cat_bb(a bpchar, b bpchar) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(ora_p(a), ora_p(b)) $$;
--;;
CREATE FUNCTION ora_cat_bt(a bpchar, b text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(ora_p(a), b) $$;
--;;
CREATE FUNCTION ora_cat_tb(a text, b bpchar) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(a, ora_p(b)) $$;
--;;
CREATE FUNCTION ora_cat_bn(a bpchar, b numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(ora_p(a), ora_n2t(b)) $$;
--;;
CREATE FUNCTION ora_cat_nb(a numeric, b bpchar) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(ora_n2t(a), ora_p(b)) $$;
--;;
CREATE OPERATOR || (LEFTARG=text,      RIGHTARG=text,      FUNCTION=ora_cat);
--;;
CREATE OPERATOR || (LEFTARG=text,      RIGHTARG=numeric,   FUNCTION=ora_cat_tn);
--;;
CREATE OPERATOR || (LEFTARG=numeric,   RIGHTARG=text,      FUNCTION=ora_cat_nt);
--;;
-- NOTE: no (numeric || numeric) operator on purpose: with it, PG resolves 'abc' || bursa as numeric||numeric
-- ("unknown literal takes the other operand's type") and fails.  Consequence: `an || bursa` (two typed NUMBERs) errors.
CREATE OPERATOR || (LEFTARG=text,      RIGHTARG=timestamp, FUNCTION=ora_cat_td);
--;;
CREATE OPERATOR || (LEFTARG=timestamp, RIGHTARG=text,      FUNCTION=ora_cat_dt);
--;;
CREATE OPERATOR || (LEFTARG=bpchar,    RIGHTARG=bpchar,    FUNCTION=ora_cat_bb);
--;;
CREATE OPERATOR || (LEFTARG=bpchar,    RIGHTARG=text,      FUNCTION=ora_cat_bt);
--;;
CREATE OPERATOR || (LEFTARG=text,      RIGHTARG=bpchar,    FUNCTION=ora_cat_tb);
--;;
CREATE OPERATOR || (LEFTARG=bpchar,    RIGHTARG=numeric,   FUNCTION=ora_cat_bn);
--;;
CREATE OPERATOR || (LEFTARG=numeric,   RIGHTARG=bpchar,    FUNCTION=ora_cat_nb);
--;;
-- CONCAT(a,b): exactly 2 args in Oracle, NULL-tolerant, numbers converted the Oracle way
CREATE FUNCTION concat(a text, b text)       RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(a,b) $$;
--;;
CREATE FUNCTION concat(a text, b numeric)    RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_tn(a,b) $$;
--;;
CREATE FUNCTION concat(a numeric, b text)    RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_nt(a,b) $$;
--;;
CREATE FUNCTION concat(a numeric, b numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_nn(a,b) $$;
--;;
CREATE FUNCTION concat(a bpchar, b bpchar)   RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_bb(a,b) $$;
--;;
CREATE FUNCTION concat(a bpchar, b text)     RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_bt(a,b) $$;
--;;
CREATE FUNCTION concat(a text, b bpchar)     RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_tb(a,b) $$;
--;;
CREATE FUNCTION concat(a bpchar, b numeric)  RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_bn(a,b) $$;
--;;
CREATE FUNCTION concat(a numeric, b bpchar)  RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_nb(a,b) $$;
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
-- ---------------------------------------------------------------- strings
-- LENGTH : Oracle counts CHAR padding, returns NUMBER, ''=NULL
CREATE FUNCTION length(s text)   RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT nullif(char_length(s),0)::numeric $$;
--;;
CREATE FUNCTION length(s bpchar) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT char_length(ora_p(s))::numeric $$;
--;;
CREATE FUNCTION length(n numeric) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT length(ora_n2t(n)) $$;
--;;
-- UPPER/LOWER/INITCAP on CHAR(n): keep the padding (LENGTH(UPPER(nume)) = 10).
-- !! Result TYPE of UPPER(CHAR) is "real Oracle check" item #1: lab3 says UPPER(nume)='BREABAN' returns 0 rows, which
-- !! implies VARCHAR2 comparison; Oracle docs (from memory) say the type stays CHAR (would return the row). Returning text
-- !! (padding kept, non-padded comparison) follows the lab page.  Change RETURNS text -> bpchar to follow the docs.
CREATE FUNCTION upper(b bpchar)   RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT pg_catalog.upper(ora_p(b)) $$;
--;;
CREATE FUNCTION lower(b bpchar)   RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT pg_catalog.lower(ora_p(b)) $$;
--;;
CREATE FUNCTION initcap(b bpchar) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT pg_catalog.initcap(ora_p(b)) $$;
--;;
CREATE FUNCTION upper(n numeric)   RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(n) $$;
--;;
