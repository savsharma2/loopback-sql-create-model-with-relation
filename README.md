# Loopback Model Creation

The project is generated using [LoopBack](http://loopback.io) and modified by [savsharma2](https://github.com/savsharma2)
to create models with [belongsTo](https://docs.strongloop.com/display/public/LB/BelongsTo+relations/) that is **One To One** and
[hasMany](https://docs.strongloop.com/display/public/LB/HasMany+relations) which is **One To Many** relationships.

## Installation

```
$ npm install
```

## Change in loopback discovery api

Problem statement can be viewed here (<http://stackoverflow.com/questions/37408747/strongloop-database-discovery-api-for-sql-server-giving-same-table-name-for-prim>).

```
file :- node_modules/loopback-connector-mssql\lib\discovery.js
```

```javascript
/*!
 * Retrieves a description of the foreign key columns that reference the given table's primary key columns (the foreign keys exported by a table).
 * They are ordered by fkTableOwner, fkTableName, and keySeq.
 * @param owner
 * @param table
 * @returns {string}
 */
function queryExportedForeignKeys(owner, table) {
  var sql = `SELECT
  fkOwner = sch.name ,fkName = obj.name,
  fkTableName =  tab1.name ,
  fkColumnName = col1.name,
  PK_Table =  tab2.name,
  PK_Column = col2.name
  FROM sys.foreign_key_columns fkc
  INNER JOIN sys.objects obj
      ON obj.object_id = fkc.constraint_object_id
    INNER JOIN sys.tables tab1
      ON tab1.object_id = fkc.parent_object_id
    INNER JOIN sys.schemas sch
      ON tab1.schema_id = sch.schema_id
    INNER JOIN sys.columns col1
      ON col1.column_id = parent_column_id AND col1.object_id = tab1.object_id
    INNER JOIN sys.tables tab2
      ON tab2.object_id = fkc.referenced_object_id
    INNER JOIN sys.columns col2
      ON col2.column_id = referenced_column_id AND col2.object_id = tab2.object_id`;

  if (table) {
    sql += ' and tab2.name=\'' + table + '\'';
  }

  return sql;
}


```

```javascript
/*!
 * Build the sql statement for querying foreign keys of a given table
 * @param owner
 * @param table
 * @returns {string}
 */
function queryForeignKeys(owner, table) {
  var sql = `SELECT  
     fkOwner = FK.table_schema ,
     fkName = FK.constraint_name,
     fkTableName = FK.TABLE_NAME,
     fkColumnName = CU.COLUMN_NAME,
     keySeq = CU.ordinal_position,
     PK_Table = PK.TABLE_NAME,
     PK_Column = PT.COLUMN_NAME
     FROM
     INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS C
     INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS FK
        ON C.CONSTRAINT_NAME = FK.CONSTRAINT_NAME
     INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS PK
        ON C.UNIQUE_CONSTRAINT_NAME = PK.CONSTRAINT_NAME
     INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE CU
        ON C.CONSTRAINT_NAME = CU.CONSTRAINT_NAME
     INNER JOIN (
          SELECT
              i1.TABLE_NAME,
              i2.COLUMN_NAME
          FROM
              INFORMATION_SCHEMA.TABLE_CONSTRAINTS i1
          INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE i2
              ON i1.CONSTRAINT_NAME = i2.CONSTRAINT_NAME
          WHERE
              i1.CONSTRAINT_TYPE = 'PRIMARY KEY'
         ) PT
     ON PT.TABLE_NAME = PK.TABLE_NAME`;

  if (table) {
    sql += ' AND  FK.TABLE_NAME =\'' + table + '\'';
  }
  return sql;
}

```

## Running Project

run
```
node .
```
and you are good to go. :+1:
