-- 50-conversions.sql : TO_NUMBER and TO_CHAR for numbers.
-- ---------------------------------------------------------------- number/char conversions
CREATE FUNCTION to_number(s text) RETURNS numeric LANGUAGE sql IMMUTABLE AS $$ SELECT s::numeric $$;
--;;
CREATE FUNCTION to_char(n numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_n2t(n) $$;
--;;
CREATE FUNCTION to_char(s text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT s $$;
--;;
-- TO_CHAR(number, fmt): PG puts a '$' format char at the far left ('$    450'); Oracle floats it next to the first digit.
CREATE FUNCTION to_char(n numeric, f text) RETURNS text LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN f LIKE '%$%'
       THEN regexp_replace(pg_catalog.to_char(n, replace(f,'$','')), '^(\s*)(-?\d|-?\.)', '\1$\2')
       ELSE pg_catalog.to_char(n, f) END $$;
--;;
CREATE FUNCTION to_char(d timestamp) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT ora_d2t(d) $$;
--;;
