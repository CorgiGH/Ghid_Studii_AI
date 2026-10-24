-- 40-formats.sql : Format models: TO_CHAR(number, fmt).
-- TO_CHAR(number, fmt): PG puts a '$' format char at the far left ('$    450'); Oracle floats it next to the first digit.
CREATE FUNCTION to_char(n numeric, f text) RETURNS text LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN f LIKE '%$%'
       THEN regexp_replace(pg_catalog.to_char(n, replace(f,'$','')), '^(\s*)(-?\d|-?\.)', '\1$\2')
       ELSE pg_catalog.to_char(n, f) END $$;
--;;
