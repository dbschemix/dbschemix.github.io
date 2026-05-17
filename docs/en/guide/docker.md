---
title: dbschemix - running migrator in docker
lang: en-US
---

# Docker

## What is in the image

The image `ghcr.io/dbschemix/migrator` is a thin runtime: PHP with the `pdo_mysql`, `pdo_pgsql`, and `pdo_sqlite` extensions and an entrypoint. The library and project code are not included in the image. They are pulled from the mounted `vendor/` directory of your project — this allows updating the library independently of the image.

## Config file contract

The container expects a PHP file that returns a `MigratorInterface` instance. The file is responsible for autoloading and must include `vendor/autoload.php`. Define paths inside the file using `__DIR__` so they resolve correctly inside the mounted container. `eventSubscribers` is a plain array of objects; no special notation is required.

```php
<?php

declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use dbschemix\pdo\Driver;
use dbschemix\core\{Migration, Migrator};
use dbschemix\migrator\tools\TraceConsoleOutput;

return new Migrator(
    list: [
        new Migration(
            path: __DIR__ . '/migration/pgsql/main',
            driver: new Driver(
                dsn: 'pgsql:host=postgres;port=5432;dbname=main',
                username: 'postgres',
                password: 'postgres',
            ),
        ),
    ],
    eventSubscribers: [
        new TraceConsoleOutput(),
    ],
);
```

If the file does not return a `MigratorInterface`, `Bootstrap` throws a `RuntimeException` with the message:

```
config must end with "return $migrator;" and return an instance of ...MigratorInterface.
```

## The MIGRATOR_CONFIG variable

`MIGRATOR_CONFIG` is an environment variable that tells the container where to find the config file. Default value: `/app/migrator.php`. Mounting the project into `/app` is enough for the default to work without explicitly setting the variable.

## docker-compose

Mount the project, set `MIGRATOR_CONFIG`, and pass the command via `command:`:

```yaml
services:
  migrator:
    image: ghcr.io/dbschemix/migrator:latest
    init: true
    environment:
      MIGRATOR_CONFIG: /app/migrator.php
    volumes:
      - ./:/app
    command: ["migrate:up", "--limit=1"]
    depends_on:
      postgres:
        condition: service_healthy
```

`init: true` ensures correct signal propagation — for example, on `docker compose stop`. `depends_on` with `condition: service_healthy` guarantees that the migrator starts only after the database is ready. Any `migrate:*` command and its options work the same way as in the regular CLI.

## Ready-made example

The repository contains a working example with SQLite: `runtime/example/docker/migrator.php`. To build and try it locally:

```bash
make docker-runtime
```
