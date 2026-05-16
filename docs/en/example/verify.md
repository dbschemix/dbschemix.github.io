---
title: dbschemix - verifying migrations before committing
lang: en-US
---

# Verifying migrations

`migrate:verify` sequentially runs `up` and then immediately `down` for all pending migrations.
This ensures that new migrations apply and roll back correctly before the changes
enter version control.
Run the command locally before committing.

## Full cycle

Create several migrations with `migrate:create`, then run `migrate:verify`.
The command applies all pending migrations one by one (`up`), then rolls them back
in reverse order (`down`).

```shell
/example $ php cli.php migrate:create test --db=sqlite/db
/example $ php cli.php migrate:create test2 --db=sqlite/db
/example $ php cli.php migrate:create test3 --db=sqlite/db

/example $ php cli.php migrate:verify
[sqlite/db] up:   202603070850_test.sql, vers: 177287432696 done
[sqlite/db] up:   202603070850_test2.sql, vers: 177287432696 done
[sqlite/db] up:   202603070850_test3.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test3.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test2.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test.sql, vers: 177287432696 done
```

## With a limit

The `--limit` option is useful when you need to check only the last added migration
without affecting other pending changes.

```shell
/example $ php cli.php migrate:verify --limit=1
[sqlite/db] up:   202603070850_test.sql, vers: 177287441498 done
[sqlite/db] down: 202603070850_test.sql, vers: 177287441498 done
```

## Error behavior

If an error occurs during `up`, `migrate:verify` automatically rolls back
all migrations that were applied — the database returns to its original state.
The error message contains the `SQLSTATE` code and the problematic SQL fragment.
The name of the offending file is additionally printed at the end of the output.

```shell
/example $ php cli.php migrate:verify
[sqlite/db] up:   202603070850_test.sql, vers: 177287479980 done
[sqlite/db] up:   202603070850_test2.sql error
SQLSTATE[HY000]: General error: 1 incomplete input
-- SQL CODE
INSERT INTO ededede

[sqlite/db] down: 202603070850_test.sql, vers: 177287479980 done
202603070850_test2.sql: SQLSTATE[HY000]: General error: 1 incomplete input
```
