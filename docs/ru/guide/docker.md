---
title: dbschemix - запуск migrator в docker
lang: ru-RU
---

# Docker

## Что в образе

Образ `ghcr.io/dbschemix/migrator` — тонкий runtime: PHP с расширениями `pdo_mysql`, `pdo_pgsql`, `pdo_sqlite` и entrypoint. Библиотека и код проекта в образ не включены. Они подтягиваются из примонтированного `vendor/` вашего проекта — это позволяет обновлять библиотеку независимо от образа.

## Контракт конфиг-файла

Контейнер ожидает PHP-файл, который возвращает экземпляр `MigratorInterface`. Файл сам отвечает за автозагрузку и должен подключать `vendor/autoload.php`. Пути внутри файла задавайте через `__DIR__`, чтобы они корректно разрешались внутри примонтированного контейнера. `eventSubscribers` — обычный массив объектов, никакой специальной нотации не требуется.

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

Если файл не возвращает `MigratorInterface`, `Bootstrap` выбрасывает `RuntimeException` с сообщением:

```
config must end with "return $migrator;" and return an instance of ...MigratorInterface.
```

## Переменная MIGRATOR_CONFIG

`MIGRATOR_CONFIG` — переменная окружения, которая указывает контейнеру путь к конфиг-файлу. Значение по умолчанию: `/app/migrator.php`. Достаточно примонтировать проект в `/app`, чтобы дефолт сработал без явного указания переменной.

## docker-compose

Примонтируйте проект, задайте `MIGRATOR_CONFIG` и передайте команду через `command:`:

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

`init: true` обеспечивает корректную передачу сигналов — например, при `docker compose stop`. `depends_on` с `condition: service_healthy` гарантирует, что migrator стартует только после готовности базы данных. Любая команда `migrate:*` и её опции работают так же, как в обычном CLI.

## Готовый пример

В репозитории лежит работающий пример с SQLite: `runtime/example/docker/migrator.php`. Собрать и опробовать локально:

```bash
make docker-runtime
```
