-- 10-concat.sql : string concatenation and CONCAT.
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
