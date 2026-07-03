-- ============================================================================
-- KloudOcean Teradata System Inventory Query Pack
-- thekloudocean.com  ·  info@thekloudocean.com
--
-- 13 queries we run in the first hour of every Teradata migration assessment.
-- Run these BEFORE anyone touches a schema — the output feeds directly into
-- the "Data Profile" and "Access & Governance" stages of the KloudOcean
-- Passage Method.
--
-- Notes before you run this:
--   - Replace 'YourDatabaseName' with your actual database/schema name where
--     a filter is shown — most queries below are written to scan an entire
--     system, so filter them down if you only have read access to one schema.
--   - DBC view availability varies slightly by Teradata version. If a view
--     name below doesn't resolve, check DBC.dbcinfo for your release and
--     consult the equivalent *V (view) name for your version.
--   - Several of these queries scan DBC system tables across all databases
--     and can be expensive on a large system. Run during a low-traffic
--     window, and add DatabaseName filters if you only need one schema.
-- ============================================================================


-- 1. FULL TABLE INVENTORY — every table/view/macro, by database
-- ----------------------------------------------------------------------------
SELECT
    DatabaseName,
    TableKind,          -- 'T'=Table, 'V'=View, 'M'=Macro, 'P'=Procedure
    COUNT(*) AS ObjectCount
FROM DBC.TablesV
GROUP BY DatabaseName, TableKind
ORDER BY DatabaseName, TableKind;


-- 2. TOTAL SPACE USAGE BY DATABASE — where your volume actually lives
-- ----------------------------------------------------------------------------
SELECT
    DatabaseName,
    SUM(CurrentPerm)  AS CurrentPermBytes,
    SUM(MaxPerm)      AS MaxPermBytes,
    CAST(SUM(CurrentPerm) / 1024.0 / 1024 / 1024 AS DECIMAL(12,2)) AS CurrentPermGB
FROM DBC.TableSizeV
GROUP BY DatabaseName
ORDER BY CurrentPermBytes DESC;


-- 3. TOP 50 LARGEST TABLES — the ones that will dominate migration timeline
-- ----------------------------------------------------------------------------
SELECT TOP 50
    DatabaseName,
    TableName,
    SUM(CurrentPerm) AS CurrentPermBytes,
    CAST(SUM(CurrentPerm) / 1024.0 / 1024 / 1024 AS DECIMAL(12,2)) AS CurrentPermGB
FROM DBC.TableSizeV
GROUP BY DatabaseName, TableName
ORDER BY CurrentPermBytes DESC;


-- 4. PRIMARY INDEX DISTRIBUTION — NUPI vs UPI, and skew risk
-- ----------------------------------------------------------------------------
SELECT
    i.DatabaseName,
    i.TableName,
    i.IndexType,        -- 'P' = Primary Index
    i.UniqueFlag,        -- 'Y' = UPI, 'N' = NUPI
    i.ColumnName
FROM DBC.IndicesV i
WHERE i.IndexType = 'P'
ORDER BY i.DatabaseName, i.TableName;


-- 5. ROW DISTRIBUTION SKEW — tables where one AMP holds disproportionate data
--    (High MaxPerm vs. average CurrentPerm-per-AMP signals a bad PI choice —
--    this is a direct predictor of BigQuery clustering/partitioning strategy)
-- ----------------------------------------------------------------------------
SELECT
    DatabaseName,
    TableName,
    MAX(CurrentPerm)                         AS MaxAmpBytes,
    AVG(CurrentPerm)                         AS AvgAmpBytes,
    CAST(MAX(CurrentPerm) / NULLIF(AVG(CurrentPerm),0) AS DECIMAL(10,2)) AS SkewRatio
FROM DBC.TableSizeV
GROUP BY DatabaseName, TableName
HAVING SkewRatio > 3
ORDER BY SkewRatio DESC;


-- 6. CHARSET / BYTE-COLUMN RISK — the classic silent-corruption source
--    (BYTE/VARBYTE columns often hold text data that was never declared
--    CHAR/VARCHAR — this is the #1 cause of post-migration data corruption)
-- ----------------------------------------------------------------------------
SELECT
    DatabaseName,
    TableName,
    ColumnName,
    ColumnType,          -- 'BF' = BYTE, 'BV' = VARBYTE
    CharType
FROM DBC.ColumnsV
WHERE ColumnType IN ('BF', 'BV')
ORDER BY DatabaseName, TableName;


-- 7. NULLABILITY AUDIT — columns that are NOT NULL vs. nullable in practice
-- ----------------------------------------------------------------------------
SELECT
    DatabaseName,
    TableName,
    ColumnName,
    Nullable,
    ColumnType
FROM DBC.ColumnsV
WHERE DatabaseName = 'YourDatabaseName'
ORDER BY TableName, ColumnId;


-- 8. MACRO INVENTORY — business logic hiding outside table structure
-- ----------------------------------------------------------------------------
SELECT
    DatabaseName,
    TableName AS MacroName,
    CreateTimestamp,
    LastAlterTimestamp
FROM DBC.TablesV
WHERE TableKind = 'M'
ORDER BY DatabaseName, MacroName;


-- 9. VIEW INVENTORY — often where row/column-level masking actually lives
-- ----------------------------------------------------------------------------
SELECT
    DatabaseName,
    TableName AS ViewName,
    CreateTimestamp,
    LastAlterTimestamp
FROM DBC.TablesV
WHERE TableKind = 'V'
ORDER BY DatabaseName, ViewName;


-- 10. ACCESS RIGHTS / GRANTS — your real access control matrix starting point
-- ----------------------------------------------------------------------------
SELECT
    UserName,
    DatabaseName,
    TableName,
    AccessRight,      -- e.g. 'R'=Read, 'I'=Insert, 'U'=Update, 'D'=Delete
    GrantorName,
    GrantAuthority
FROM DBC.AllRightsV
WHERE DatabaseName = 'YourDatabaseName'
ORDER BY DatabaseName, TableName, UserName;


-- 11. REFERENTIAL INTEGRITY — foreign key relationships to preserve
-- ----------------------------------------------------------------------------
SELECT
    ChildDB,
    ChildTable,
    ParentDB,
    ParentTable,
    IndexID
FROM DBC.All_RI_ChildrenV
ORDER BY ChildDB, ChildTable;


-- 12. PARTITIONING DEFINITIONS — maps directly to BigQuery partition strategy
-- ----------------------------------------------------------------------------
SELECT
    DatabaseName,
    TableName,
    ColumnName,
    ConstraintText
FROM DBC.PartitioningConstraintsV
WHERE ConstraintType = 'Q'
ORDER BY DatabaseName, TableName;


-- 13. STALE STATISTICS CHECK — flags tables where collected stats are old
--     or missing, which affects both current TD performance and your
--     confidence in row-count/volume numbers used to scope the migration
-- ----------------------------------------------------------------------------
SELECT
    DatabaseName,
    TableName,
    StatsName,
    LastCollectTimeStamp
FROM DBC.StatsV
WHERE LastCollectTimeStamp IS NULL
   OR LastCollectTimeStamp < CURRENT_DATE - 90
ORDER BY DatabaseName, TableName;


-- ============================================================================
-- Next step: run the free Migration Cost Estimator with your real numbers
-- from queries 2, 3, and 6 → thekloudocean.com/resources.html#estimator
-- Or book a paid assessment and we'll run the full pack for you, validated
-- against your specific Teradata release → thekloudocean.com/#pricing
-- ============================================================================
