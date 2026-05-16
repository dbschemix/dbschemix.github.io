---
title: dbschemix - command and argument reference
lang: en-US
---

# CLI reference

## Overview

The CLI entry point is the static method `Console::run($migrator)`, which you call in your `cli.php`. The method accepts a configured `Migrator` instance, registers all commands, and passes control to Symfony Console.

General invocation syntax:

```shell
php cli.php <command> [options]
```

7 commands are available: `migrate:init`, `migrate:up`, `migrate:down`, `migrate:redo`, `migrate:verify`, `migrate:fixture`, `migrate:create`.

**Exit codes:**

| Code | Meaning |
|------|---------|
| `0`  | Success |
| `2`  | Option validation error or known migrator error |
| `1`  | Unhandled exception |

## Common options

The following options are supported by multiple commands and share the same semantics.

| Option      | Type        | Default          | Applies to                              | Description                                                              |
|-------------|-------------|------------------|-----------------------------------------|--------------------------------------------------------------------------|
| `--db`      | string      | —                | up, down, redo, verify, fixture, create | Database name in `<driver>/<source>` format, e.g. `pgsql/main`.         |
| `--limit`   | non-neg int | `0` (no limit)   | up, down, redo, verify, fixture         | Maximum number of migrations to apply or roll back in one run.           |
| `--dry-run` | flag        | `false`          | up, down, redo, verify, fixture         | Test run without making any changes to the database.                     |

A value of `--limit=0` means "no limit". Passing a negative number will cause the command to exit with a validation error.

## migrate:init

The command creates the service infrastructure needed to track migration versions. Under the hood it executes `setup.sql` for each registered database. The command is idempotent — running it again is safe and does not affect already-initialized databases. Run it once during the initial deployment of the project.

The command accepts no options.

```shell
/example $ php cli.php migrate:init
[sqlite/db] initialization: setup.sql done
```

## migrate:up

Applies all pending migrations in ascending filename order. All migrations in a single run receive a shared version number (timestamp), which allows rolling them back later as a single batch. If the infrastructure has not been initialized yet, the command prints a hint: call `migrate:init`.

### Specific options

| Option              | Type | Default | Description                                                                                        |
|---------------------|------|---------|----------------------------------------------------------------------------------------------------|
| `--exactly-all`     | flag | `false` | Atomic run: if any migration fails, the entire batch is rolled back.                               |
| `--with-repeatable` | flag | `false` | Also runs migrations from the `<source>-repeatable` directory. Incompatible with `--dry-run`.     |

### Examples

Basic run:

```shell
/example $ php cli.php migrate:up
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done
```

With `--exactly-all`:

```shell
/example $ php cli.php migrate:up --exactly-all
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done
```

With `--with-repeatable`:

```shell
/example $ php cli.php migrate:up --with-repeatable
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done
[sqlite/db] repeatable: 202501011024_entity_correction.sql done
[sqlite/db] repeatable: 202501011024_entity_correction_2.sql done
```

Limiting the number of migrations:

```shell
/example $ php cli.php migrate:up --limit=2
[sqlite/db] up: 202501021024_account_create.sql, vers: 1772723566084 done
[sqlite/db] up: 202501021025_account_email.sql, vers: 1772723566084 done
```

## migrate:down

Rolls back applied migrations in reverse order (newest to oldest). By default everything is rolled back to the very first migration: use `--limit=1` to roll back only the last one. The `--latest-version` flag switches the mode: the entire latest version is rolled back — that is, all migrations applied in a single `migrate:up` run. If the infrastructure is not initialized, the command prints a hint.

### Specific options

| Option             | Type | Default | Description                                                                                        |
|--------------------|------|---------|----------------------------------------------------------------------------------------------------|
| `--latest-version` | flag | `false` | Roll back the entire latest version — the batch of migrations applied in one `migrate:up` run.    |

### Examples

Rolling back the latest batch (latest version):

```shell
/example $ php cli.php migrate:down --latest-version
[sqlite/db] down: 202501021025_account_email.sql, vers: 1772723566084 done
[sqlite/db] down: 202501021024_account_create.sql, vers: 1772723566084 done
```

Rolling back all migrations without the flag:

```shell
/example $ php cli.php migrate:down
[sqlite/db] down: 202501021025_account_email.sql done
[sqlite/db] down: 202501021024_account_create.sql done
[sqlite/db] down: 202501011024_entity_create.sql done
```

## migrate:redo

Sequentially executes `down` and then `up` for the last migration or version. By default only the last migration is repeated. With the `--latest-version` flag the entire latest version is first rolled back, then the same migrations are re-applied with a new version number. The command is useful during development: it verifies that a migration rolls back and re-applies correctly. Supports `--dry-run` for a test run without database changes.

Options for `migrate:redo`: `--db`, `--limit`, `--latest-version`, `--dry-run`.

### Example

```shell
/example $ php cli.php migrate:redo --latest-version
[sqlite/db] down: 202501021025_account_email.sql, vers: 1772723718828 done
[sqlite/db] down: 202501021024_account_create.sql, vers: 1772723718828 done
[sqlite/db] up:   202501021024_account_create.sql, vers: 1772723727397 done
[sqlite/db] up:   202501021025_account_email.sql, vers: 1772723727397 done
```

## migrate:verify

Applies all pending migrations (`up`) and then immediately rolls them back (`down`). The goal is to verify that new migrations work correctly in both directions before committing. If `up` fails, everything that was applied is automatically rolled back. The command leaves no traces in the database. Use `--limit` to verify a limited number of migrations.

Options for `migrate:verify`: `--db`, `--limit`, `--dry-run`.

### Examples

Verifying all pending migrations:

```shell
/example $ php cli.php migrate:verify
[sqlite/db] up:   202603070850_test.sql, vers: 177287432696 done
[sqlite/db] up:   202603070850_test2.sql, vers: 177287432696 done
[sqlite/db] up:   202603070850_test3.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test3.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test2.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test.sql, vers: 177287432696 done
```

Verifying one migration (`--limit=1`):

```shell
/example $ php cli.php migrate:verify --limit=1
[sqlite/db] up:   202603070850_test.sql, vers: 177287441498 done
[sqlite/db] down: 202603070850_test.sql, vers: 177287441498 done
```

Example of a migration error:

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

Everything that was applied before the failed migration is rolled back automatically.

## migrate:fixture

Applies migrations from the `<source>-fixture` directory. Fixtures are used to populate the database with test data in dev and test environments. Fixture files have the same format as regular migrations: `@up`, `@down`, `@skip` sections. The command supports the same run-control options as `migrate:up`, except for `--exactly-all` and `--with-repeatable`.

Options for `migrate:fixture`: `--db`, `--limit`, `--dry-run`.

## migrate:create

Creates an empty migration file in the directory corresponding to the specified database. The `--db` option is required. The `name` argument sets an arbitrary migration name using Latin characters, without the extension. The filename is generated automatically as `<timestamp>_<name>.sql`. The created file contains a template with empty `@up` and `@down` sections.

### Syntax

```shell
php cli.php migrate:create <name> --db=<driver>/<source>
```

### Example

```shell
/example $ php cli.php migrate:create entity_create --db=pgsql/main
```

Options for `migrate:create`: `--db` (required), argument `name` (required). The `--limit` and `--dry-run` options are not available.

## SQL control tags

Migration files contain plain SQL for the target database. Control behavior is set via special comment tags.

| Tag     | Purpose                         |
|---------|---------------------------------|
| `@up`   | Migration apply section         |
| `@down` | Migration rollback section      |
| `@skip` | Skip a SQL block                |

If no tags are present in a file, the entire file is treated as the `@up` section. The `_skip` suffix in the filename (e.g. `202501011025_name_skip.sql`) skips the entire file — no tags are needed in that case.

```sql
-- @up
CREATE TABLE example (id serial PRIMARY KEY);

-- @down
DROP TABLE example;
```
