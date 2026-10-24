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
-- (numeric || numeric) exists: an unknown-typed literal next to || would resolve to it ("an unknown literal takes the other
-- operand's type"), so the rewriter (pass-misc) casts string literals beside || to text.
CREATE OPERATOR || (LEFTARG=numeric,   RIGHTARG=numeric,   FUNCTION=ora_cat_nn);
--;;
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
-- DATE operands: implicit DATE -> text through DD-MON-RR (ora_d2t)
CREATE FUNCTION ora_cat_dn(a timestamp, b numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(ora_d2t(a), ora_n2t(b)) $$;
--;;
CREATE FUNCTION ora_cat_nd(a numeric, b timestamp) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(ora_n2t(a), ora_d2t(b)) $$;
--;;
CREATE FUNCTION ora_cat_dd(a timestamp, b timestamp) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(ora_d2t(a), ora_d2t(b)) $$;
--;;
CREATE FUNCTION ora_cat_bd(a bpchar, b timestamp) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(ora_p(a), ora_d2t(b)) $$;
--;;
CREATE FUNCTION ora_cat_db(a timestamp, b bpchar) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat(ora_d2t(a), ora_p(b)) $$;
--;;
CREATE OPERATOR || (LEFTARG=timestamp, RIGHTARG=numeric,   FUNCTION=ora_cat_dn);
--;;
CREATE OPERATOR || (LEFTARG=numeric,   RIGHTARG=timestamp, FUNCTION=ora_cat_nd);
--;;
CREATE OPERATOR || (LEFTARG=timestamp, RIGHTARG=timestamp, FUNCTION=ora_cat_dd);
--;;
CREATE OPERATOR || (LEFTARG=bpchar,    RIGHTARG=timestamp, FUNCTION=ora_cat_bd);
--;;
CREATE OPERATOR || (LEFTARG=timestamp, RIGHTARG=bpchar,    FUNCTION=ora_cat_db);
--;;
-- Integer operands (COUNT(*) is a bigint, an integer literal is an int4): PostgreSQL's own  text || anynonarray  and
-- anynonarray || text  compete with the NUMBER operators above through an implicit cast, so the pairs that meet
-- them are spelled out; an exact match wins.
DO $$
DECLARE i text; t text; conv text;
BEGIN
  FOREACH i IN ARRAY ARRAY['int4','int8'] LOOP
    FOREACH t IN ARRAY ARRAY['text','bpchar'] LOOP
      conv := CASE t WHEN 'bpchar' THEN 'ora_p(a)' ELSE 'a' END;
      EXECUTE format('CREATE FUNCTION ora_cat_%s_%s(a %s, b %s) RETURNS text LANGUAGE sql IMMUTABLE AS $f$ SELECT ora_cat(%s, ora_n2t(b)) $f$', t, i, t, i, conv);
      EXECUTE format('CREATE OPERATOR || (LEFTARG=%s, RIGHTARG=%s, FUNCTION=ora_cat_%s_%s)', t, i, t, i);
      conv := CASE t WHEN 'bpchar' THEN 'ora_p(b)' ELSE 'b' END;
      EXECUTE format('CREATE FUNCTION ora_cat_%s_%s(a %s, b %s) RETURNS text LANGUAGE sql IMMUTABLE AS $f$ SELECT ora_cat(ora_n2t(a), %s) $f$', i, t, i, t, conv);
      EXECUTE format('CREATE OPERATOR || (LEFTARG=%s, RIGHTARG=%s, FUNCTION=ora_cat_%s_%s)', i, t, i, t);
    END LOOP;
  END LOOP;
END $$;
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
CREATE FUNCTION concat(a text, b timestamp)      RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_td(a,b) $$;
--;;
CREATE FUNCTION concat(a timestamp, b text)      RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_dt(a,b) $$;
--;;
CREATE FUNCTION concat(a timestamp, b numeric)   RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_dn(a,b) $$;
--;;
CREATE FUNCTION concat(a numeric, b timestamp)   RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_nd(a,b) $$;
--;;
CREATE FUNCTION concat(a timestamp, b timestamp) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_dd(a,b) $$;
--;;
CREATE FUNCTION concat(a bpchar, b timestamp)    RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_bd(a,b) $$;
--;;
CREATE FUNCTION concat(a timestamp, b bpchar)    RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_cat_db(a,b) $$;
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
