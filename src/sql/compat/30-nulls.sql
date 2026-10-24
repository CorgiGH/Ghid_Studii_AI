-- 30-nulls.sql : NVL / NVL2.
-- ---------------------------------------------------------------- NVL / NVL2 (DECODE, GREATEST, LEAST: rewriter -> CASE)
CREATE FUNCTION nvl(a anycompatible, b anycompatible) RETURNS anycompatible LANGUAGE sql IMMUTABLE AS $$ SELECT coalesce(a,b) $$;
--;;
CREATE FUNCTION nvl2(e anyelement, a anycompatible, b anycompatible) RETURNS anycompatible LANGUAGE sql IMMUTABLE AS
$$ SELECT CASE WHEN e IS NOT NULL THEN a ELSE b END $$;
--;;
