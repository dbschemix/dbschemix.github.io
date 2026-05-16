---
title: dbschemix - docker compose service
lang: ru-RU
---

# Docker / docker-compose

The library ships a thin runtime image. The image contains PHP, the
`pdo_mysql` / `pdo_pgsql` / `pdo_sqlite` extensions and an entrypoint — it
does **not** contain the library. The library and your custom code
(e.g. `eventSubscribers`) come from your project's mounted `vendor/`.

## Configuration

**Config contract.** Provide a PHP file that returns the `Migrator`:

```php
<?php

declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use dbschemix\pdo\Driver;
use dbschemix\core\{Migration, Migrator};
use dbschemix\migrator\tools\TraceConsoleOutput;

$migrator = new Migrator(
    list: [
        new Migration(
            path: __DIR__ . '/migration/pgsql/main',
            driver: new Driver('pgsql:host=postgres;port=5432;dbname=main', 'postgres', 'postgres'),
        ),
    ],
    eventSubscribers: [
        new TraceConsoleOutput(),
    ],
);

return $migrator;
```

The file is responsible for its own autoload and must end with
`return $migrator;`. Resolve paths with `__DIR__` so they work inside the
mounted container. `eventSubscribers` is plain PHP — list instances of any
class (including your own), no special notation.

## Docker Compose

**docker-compose service.** Mount your project, point `MIGRATOR_CONFIG` at
the config file, and pass the migration command via `command:`:

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

`MIGRATOR_CONFIG` defaults to `/app/migrator.php`. `init: true` ensures
signals (e.g. `docker compose stop`) are delivered cleanly. Any
`migrate:*` command and its options are accepted, exactly as in the CLI.

