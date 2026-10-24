-- 70-ddl.sql : Oracle DDL/DML behaviour for the sandbox: column types, the data dictionary views, bookkeeping for CHECK texts.
-- Statements are separated with the marker line "--;;".
--
-- Oracle types as PostgreSQL types (the rewriter's pass-ddl.js picks them when it sees CREATE TABLE):
--   VARCHAR2(n) -> varchar(n)         ORA-12899 on 22001      CHAR(n) -> char(n)
--   NUMBER(p,s) -> numeric(p,s)       ORA-01438 on 22003      NUMBER -> numeric
--   DATE        -> ora_date           (timestamp(0); a domain so that DESCRIBE can tell DATE from TIMESTAMP(0))
--   INTEGER     -> ora_integer        (NUMBER(38) with an unset precision, as Oracle reports it)
--   FLOAT       -> ora_float          (numeric: exact digits, reported as FLOAT(126))
CREATE DOMAIN ora_date AS timestamp(0);
--;;
CREATE DOMAIN ora_integer AS numeric(38,0);
--;;
CREATE DOMAIN ora_float AS numeric;
--;;
-- CHECK constraints keep the text the learner typed (user_constraints.search_condition shows it, as in Oracle)
CREATE TABLE ora_check_text(tbl text NOT NULL, conname text NOT NULL, txt text NOT NULL);
--;;
-- The tables of this compat layer; they are not the learner's tables, so the user_* views leave them out
CREATE TABLE ora_internal(name text PRIMARY KEY);
--;;
INSERT INTO ora_internal SELECT tablename FROM pg_tables WHERE schemaname = 'public';
--;;

-- ---------------------------------------------------------------- the learner's tables
CREATE VIEW ora_rels AS
  SELECT c.oid AS relid, c.relname AS relname
  FROM pg_class c
  WHERE c.relnamespace = 'public'::regnamespace AND c.relkind = 'r' AND c.relname NOT IN (SELECT name FROM ora_internal);
--;;
CREATE VIEW user_tables AS
  SELECT upper(relname)::varchar(30) AS table_name, 'USERS'::varchar(30) AS tablespace_name, 'VALID'::varchar(8) AS status,
         NULL::numeric AS num_rows, 'N'::varchar(1) AS temporary
  FROM ora_rels;
--;;
-- One row per column, in the form Oracle 11g's USER_TAB_COLUMNS reports it (measured on the lab tables).
CREATE VIEW user_tab_columns AS
  SELECT upper(r.relname)::varchar(30) AS table_name,
         upper(a.attname)::varchar(30) AS column_name,
         (CASE t.typname
            WHEN 'bpchar' THEN 'CHAR' WHEN 'varchar' THEN 'VARCHAR2' WHEN 'numeric' THEN 'NUMBER'
            WHEN 'ora_integer' THEN 'NUMBER' WHEN 'ora_float' THEN 'FLOAT' WHEN 'ora_date' THEN 'DATE'
            WHEN 'text' THEN 'CLOB'
            WHEN 'timestamp' THEN 'TIMESTAMP(' || CASE WHEN a.atttypmod < 0 THEN 6 ELSE a.atttypmod END || ')'
            ELSE upper(t.typname) END)::varchar(106) AS data_type,
         (CASE WHEN t.typname IN ('bpchar', 'varchar') THEN greatest(a.atttypmod - 4, 1)
               WHEN t.typname IN ('numeric', 'ora_integer', 'ora_float') THEN 22
               WHEN t.typname = 'ora_date' THEN 7
               WHEN t.typname = 'timestamp' THEN CASE WHEN a.atttypmod = 0 THEN 7 ELSE 11 END
               WHEN t.typname = 'text' THEN 4000 END)::numeric AS data_length,
         (CASE WHEN t.typname = 'numeric' AND a.atttypmod >= 0 THEN ((a.atttypmod - 4) >> 16) & 65535
               WHEN t.typname = 'ora_float' THEN 126 END)::numeric AS data_precision,
         (CASE WHEN t.typname = 'numeric' AND a.atttypmod >= 0 THEN (((a.atttypmod - 4) & 2047) # 1024) - 1024
               WHEN t.typname = 'ora_integer' THEN 0
               WHEN t.typname = 'timestamp' THEN CASE WHEN a.atttypmod < 0 THEN 6 ELSE a.atttypmod END END)::numeric AS data_scale,
         (CASE WHEN a.attnotnull THEN 'N' ELSE 'Y' END)::varchar(1) AS nullable,
         (row_number() OVER (PARTITION BY a.attrelid ORDER BY a.attnum))::numeric AS column_id,
         regexp_replace(regexp_replace(replace(replace(pg_get_expr(d.adbin, d.adrelid), 'ora_sysdate()', 'SYSDATE'),
                                '::character varying', ''), '::[a-z ]+(\([0-9,]+\))?$', ''), '^''(-?[0-9][0-9.eE+-]*)''$', '\1') AS data_default,
         (CASE WHEN t.typname IN ('bpchar', 'varchar') THEN greatest(a.atttypmod - 4, 1) ELSE 0 END)::numeric AS char_length,
         (CASE WHEN t.typname IN ('bpchar', 'varchar') THEN 'B' END)::varchar(1) AS char_used
  FROM ora_rels r
  JOIN pg_attribute a ON a.attrelid = r.relid AND a.attnum > 0 AND NOT a.attisdropped
  JOIN pg_type t ON t.oid = a.atttypid
  LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum;
--;;

-- ---------------------------------------------------------------- constraints
-- A constraint is P (primary key), U (unique), R (foreign key) or C (check or NOT NULL). The rewriter gives every constraint a
-- name of its own (SYS_Cnnnnnn when the learner gave none); a NOT NULL has no name in PostgreSQL, so one is made up from the
-- table and column.
CREATE VIEW ora_cons AS
  SELECT c.oid AS conid, c.conrelid AS relid, r.relname AS relname, c.contype AS contype, c.conkey AS conkey,
         c.confrelid AS refrelid, c.conindid AS indid, c.confdeltype AS deltype,
         CASE WHEN c.contype = 'n' THEN 'SYS_C' || lpad(((abs(hashtext(r.relname || '.' || c.conname)) % 900000) + 100000)::text, 6, '0')
              ELSE upper(c.conname) END AS cname,
         c.conname AS pgname
  FROM pg_constraint c
  JOIN ora_rels r ON r.relid = c.conrelid
  WHERE c.contype IN ('p', 'u', 'f', 'c', 'n')
    -- PostgreSQL 18 adds a NOT NULL constraint for every primary key column; Oracle lists none
    AND NOT (c.contype = 'n' AND EXISTS (SELECT 1 FROM pg_constraint p WHERE p.conrelid = c.conrelid AND p.contype = 'p' AND c.conkey[1] = ANY (p.conkey)));
--;;
CREATE VIEW user_constraints AS
  SELECT 'STUDENT'::varchar(30) AS owner,
         k.cname::varchar(30) AS constraint_name,
         (CASE k.contype WHEN 'p' THEN 'P' WHEN 'u' THEN 'U' WHEN 'f' THEN 'R' ELSE 'C' END)::varchar(1) AS constraint_type,
         upper(k.relname)::varchar(30) AS table_name,
         (CASE k.contype
            WHEN 'n' THEN '"' || upper((SELECT attname FROM pg_attribute WHERE attrelid = k.relid AND attnum = k.conkey[1])) || '" IS NOT NULL'
            WHEN 'c' THEN coalesce((SELECT t.txt FROM ora_check_text t WHERE t.tbl = k.relname AND t.conname = k.pgname),
                                   regexp_replace(pg_get_constraintdef(k.conid), '^CHECK \((.*)\)( NOT VALID)?$', '\1'))
          END)::text AS search_condition,
         (CASE WHEN k.contype = 'f' THEN 'STUDENT' END)::varchar(30) AS r_owner,
         (SELECT p.cname FROM ora_cons p WHERE k.contype = 'f' AND p.relid = k.refrelid AND p.indid = k.indid AND p.contype IN ('p', 'u') LIMIT 1)::varchar(30) AS r_constraint_name,
         (CASE WHEN k.contype = 'f' THEN CASE k.deltype WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' ELSE 'NO ACTION' END END)::varchar(9) AS delete_rule,
         'ENABLED'::varchar(8) AS status
  FROM ora_cons k;
--;;
CREATE VIEW user_cons_columns AS
  SELECT 'STUDENT'::varchar(30) AS owner,
         k.cname::varchar(30) AS constraint_name,
         upper(k.relname)::varchar(30) AS table_name,
         upper(a.attname)::varchar(4000) AS column_name,
         (CASE WHEN k.contype IN ('p', 'u', 'f') THEN u.ord END)::numeric AS position
  FROM ora_cons k
  CROSS JOIN LATERAL unnest(k.conkey) WITH ORDINALITY AS u(attnum, ord)
  JOIN pg_attribute a ON a.attrelid = k.relid AND a.attnum = u.attnum;
--;;
-- ALTER TABLE .. DROP COLUMN: PostgreSQL lets a table lose its last column, Oracle does not
CREATE FUNCTION ora_check_columns(t text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = t::regclass AND attnum > 0 AND NOT attisdropped) THEN
    RAISE EXCEPTION 'ORA-12983: cannot drop all columns in a table';
  END IF;
END $$;
--;;
