---
title: dbschemix - a tool for safely managing database schema and data changes
lang: en-US
---

# Why dbschemix

dbschemix/migrator is a tool for managing database schema and data changes. You describe migrations as plain SQL files, and `Migrator` tracks which ones have already been applied and runs only the new ones. The library is framework-agnostic and can be added to any PHP project via Composer.

The problem it solves: different environments — development, testing, production — must share the same schema. Without a single tool, migrations are applied manually, the order gets lost, and rolling back a change is hard. dbschemix records the application order, keeps a version history, and lets you roll back an entire set of changes with a single command.

## Principles

### Plain SQL

Migrations are written in SQL — no DSL, no Active Record, no Query Builder. A file contains plain SQL for the target database, and that exact SQL is executed against it. There is no intermediate layer that could generate something different from what you wrote.

### Framework-agnostic

`Migrator` does not require Laravel, Symfony, Yii, or any other framework. It connects to any PHP project that has Composer. If a project already uses the framework's built-in migrations, dbschemix can work alongside them — for a separate database or for databases the framework does not cover.

### Batch versioning

Migrations applied in a single `migrate:up` run share a common version number. This number appears in the output as `vers: <number>`. The entire migration batch can be rolled back with a single `migrate:down --latest-version` command — without having to analyze the history manually.

### Fixtures and repeatable migrations

Fixtures are SQL files containing test or seed data. They are stored in a dedicated directory (`<db-name>-fixture`) and applied with the `migrate:fixture` command, not `migrate:up`. Repeatable migrations are stored in the `<db-name>-repeatable` directory and are re-executed whenever the file content changes — useful for views, functions, and other objects that need to be recreated.

## Supported databases

PostgreSQL, MySQL, and SQLite are available out of the box via the `dbschemix/pdo` package. If you need a different database or a non-standard connection method, implement the `DriverInterface` and pass your driver to the `Migration` constructor. See [Configuration](configuration.md) for details.

## When it fits and when it does not

dbschemix fits projects where SQL is the primary language for working with the database. If the team is already comfortable writing and reviewing SQL files, the tool integrates naturally into the existing workflow.

The tool is not a good fit if you need a migration generator based on ORM models. dbschemix does not analyze your class structure and does not generate SQL automatically — it only executes what you write by hand.
