---
title: dbschemix - migration versioning
lang: en-US
---

# Versioning

## Version concept

Every time you run `migrate:up`, all migrations applied in that run are tagged with a shared numeric identifier — the version number (timestamp). In the output it appears as `vers: <number>`. This means one `up` run always forms one batch: multiple migrations share a single version number.

This number is what `migrate:down` and `migrate:redo` use with the `--latest-version` flag: instead of rolling back a single migration, they operate on the entire batch.

## Rolling back the entire latest version

The `--latest-version` flag in `migrate:down` rolls back not one migration but all migrations sharing the most recent version number. If the last `up` run covered multiple migrations, all of them are rolled back at once.

```shell
/example $ php cli.php migrate:up --limit=1
[sqlite/db] up: 202501011024_entity_create.sql, vers: 1772723563954 done

/example $ php cli.php migrate:up --limit=2
[sqlite/db] up: 202501021024_account_create.sql, vers: 1772723566084 done
[sqlite/db] up: 202501021025_account_email.sql, vers: 1772723566084 done

/example $ php cli.php migrate:down --latest-version
[sqlite/db] down: 202501021025_account_email.sql, vers: 1772723566084 done
[sqlite/db] down: 202501021024_account_create.sql, vers: 1772723566084 done
```

After `--latest-version`, only the migration `202501011024_entity_create.sql` from the first batch (vers: `1772723563954`) remains in the database. It has its own version number and `down --latest-version` did not touch it.

## Redo of the latest version

The command `migrate:redo --latest-version` sequentially rolls back the entire latest batch of migrations and then re-applies them. After re-applying, the migrations receive a new version number — it differs from the original because it is generated at execution time.

```shell
/example $ php cli.php migrate:up
[sqlite/db] up: 202501021024_account_create.sql, vers: 1772723718828 done
[sqlite/db] up: 202501021025_account_email.sql, vers: 1772723718828 done

/example $ php cli.php migrate:redo --latest-version
[sqlite/db] down: 202501021025_account_email.sql, vers: 1772723718828 done
[sqlite/db] down: 202501021024_account_create.sql, vers: 1772723718828 done
[sqlite/db] up:   202501021024_account_create.sql, vers: 1772723727397 done
[sqlite/db] up:   202501021025_account_email.sql, vers: 1772723727397 done
```

## Version and `--limit`

The `--limit` flag restricts the number of migrations applied in one `up` run but does not split them into multiple batches. All migrations in a single run, regardless of count, receive a single version number. For example, `--limit=2` applies exactly two migrations, and both end up in the same batch with one version number.
