---
title: dbschemix - getting started with migrator
lang: en-US
---

# Getting started

## Installation

Add the library to your project using Composer. PHP with the `pdo` extension and at least one of the drivers — `pdo_pgsql`, `pdo_mysql`, or `pdo_sqlite` — is required.

```bash
composer require dbschemix/migrator
```

## Directory layout

Migrations are stored under `migration/<driver>/<db-name>/`. Next to the main directory you can place a `<db-name>-fixture` directory for fixtures (test data) and a `<db-name>-repeatable` directory for repeatable migrations — those that are re-applied whenever the file content changes. All three directories are created with a single command:

```bash
mkdir -p ./migration/postgres/{main,main-fixture,main-repeatable}
```

## Minimal configuration

Create a PHP file that describes a `Migrator` object. The constructor accepts an array of `Migration` objects, each of which contains a path to the migrations directory and a driver instance. Below is an example for PostgreSQL. For a detailed description of all configuration parameters, see [Configuration](configuration.md).

```php
use dbschemix\pdo\Driver;
use dbschemix\core\Migration;
use dbschemix\core\Migrator;

$migrator = new Migrator(
    list: [
        new Migration(
            path: __DIR__ . '/migration/postgres/main',
            driver: new Driver(
                dsn: 'pgsql:host=postgres;port=5432;dbname=main',
                username: 'postgres',
                password: 'postgres',
            ),
        ),
    ],
);
```

## CLI entry point

`Console::run($migrator)` registers all seven `migrate:*` commands and starts the console application. It is recommended to add `PrettyConsoleOutput` to the list of event subscribers — this will print the result of each operation to the console in a human-readable format.

```php
use dbschemix\migrator\cmd\Console;
use dbschemix\migrator\tools\PrettyConsoleOutput;

require __DIR__ . '/vendor/autoload.php';

$migrator = new Migrator(
    list: [/* ... */],
    eventSubscribers: [new PrettyConsoleOutput()],
);

Console::run($migrator);
```

## Your first migration

A migration filename starts with a numeric prefix (timestamp) that determines the application order — for example, `202501011024_entity_create.sql`. The file contains `-- @up` (apply) and `-- @down` (rollback) sections. The supported tags are `@up`, `@down`, and `@skip`. If no tags are present in the file, the entire file is treated as `@up`. To skip a file entirely, add the `_skip` suffix to its name, e.g. `202501011025_name_skip.sql`.

```sql
-- @up
CREATE TABLE IF NOT EXISTS public.entity (
    id serial NOT NULL,
    parent_id integer NOT NULL,
    created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT entity_pkey PRIMARY KEY (id)
);

-- @down
DROP TABLE IF EXISTS public.entity;
```

## First commands

Before applying migrations for the first time, run `migrate:init` — the command creates the service version table in the database. After that, `migrate:up` applies all pending migrations in ascending filename order, and `migrate:down` rolls back the last applied migration.

```shell
/example $ php cli.php migrate:init
[sqlite/db] initialization: setup.sql done

/example $ php cli.php migrate:up
[sqlite/db] up: 202501011024_entity_create.sql done

/example $ php cli.php migrate:down
[sqlite/db] down: 202501011024_entity_create.sql done
```

## What's next

- Full configuration: [Configuration](configuration.md)
- All CLI commands: [CLI reference](../guide/cli.md)
- Docker: [Docker](../guide/docker.md)
- Examples: [Basic scenarios](../example/base.md)
