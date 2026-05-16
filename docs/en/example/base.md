---
title: dbschemix - basic migration run scenarios
lang: en-US
---

# Basic run scenarios

## Normal cycle

The typical migration workflow: first initialize the project with `migrate:init`, then apply all pending migrations with `migrate:up`. Roll back changes when needed with `migrate:down`. Note: `migrate:down` without `--limit` rolls back **all** applied migrations to the state before any migrations — to roll back only one, use `--limit=1`.

```shell
/example $ php cli.php migrate:init
[sqlite/db] initialization: setup.sql done

/example $ php cli.php migrate:up
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done

/example $ php cli.php migrate:down
[sqlite/db] down: 202501021025_account_email.sql done
[sqlite/db] down: 202501021024_account_create.sql done
[sqlite/db] down: 202501011024_entity_create.sql done
```

## Atomic run: `--exactly-all`

The `--exactly-all` flag combines all migrations in a run into a single batch. If any migration fails, the entire batch is rolled back and the database remains in its original state. Use this option where an all-or-nothing approach is important — for example, when deploying to production.

```shell
/example $ php cli.php migrate:up --exactly-all
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done
```

## Repeatable migrations: `--with-repeatable`

The `--with-repeatable` flag instructs the command to apply repeatable migrations after regular ones. They are taken from the `<source>-repeatable` directory and re-applied every time the file content changes — convenient for views, functions, and other idempotent schema objects. Note: `--with-repeatable` is incompatible with `--dry-run`.

```shell
/example $ php cli.php migrate:up --with-repeatable
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done
[sqlite/db] repeatable: 202501011024_entity_correction.sql done
[sqlite/db] repeatable: 202501011024_entity_correction_2.sql done
```

## Database filter: `--db`

A single `Migrator` can have multiple `Migration` objects registered. The `--db` flag selects a specific database for the command. The database name is formed as `<driver-name>/<source-name>` — for example, `pgsql/main` or `sqlite/db`. Without `--db`, the command is applied to all registered databases simultaneously.

```shell
/example $ php cli.php migrate:up --db=pgsql/main
[pgsql/main] up: 202501011024_entity_create.sql done
```

## Dry run: `--dry-run`

The `--dry-run` flag puts the command into test-run mode: the utility prints the migration plan but does not apply any changes to the database. This is convenient for CI checks and for reviewing migrations before real application.

```shell
/example $ php cli.php migrate:up --dry-run
[sqlite/db] up: 202501011024_entity_create.sql (dry-run) done
```
