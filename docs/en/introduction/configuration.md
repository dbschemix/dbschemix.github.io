---
title: dbschemix - configuring migrator
lang: en-US
---

# Configuration

## Migrator anatomy

`Migrator` is the central object of the library. The constructor accepts two parameters:

- `list` — a non-empty array of `Migration` objects. Each element describes one database: the directory with SQL files and the connection driver.
- `eventSubscribers` — an array of event subscribers implementing `EventSubscriberInterface`. The parameter is optional; the list is empty by default.

Minimal configuration for a single PostgreSQL database:

```php
use dbschemix\core\Migration;
use dbschemix\core\Migrator;
use dbschemix\pdo\Driver;
use dbschemix\migrator\tools\PrettyConsoleOutput;

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
    eventSubscribers: [
        new PrettyConsoleOutput(),
    ],
);
```

## Migration

`Migration` describes a single database. The constructor accepts:

- `path` — the absolute path to the directory containing the main migration SQL files.
- `driver` — an instance of a class implementing `DriverInterface`.

Alongside the main directory, the migrator automatically looks for additional directories:

- `<db-name>-fixture` — fixtures (test data, applied with the `fixture` command).
- `<db-name>-repeatable` — repeatable migrations (executed on every `up` run).

For example, if `path` points to `migration/postgres/main`, the migrator will also check for `migration/postgres/main-fixture` and `migration/postgres/main-repeatable`.

## Driver

`dbschemix\pdo\Driver` is the standard PDO-based driver. The constructor accepts:

- `dsn` — the PDO connection string (required).
- `username` — the username (optional).
- `password` — the password (optional).

Supported databases:

| Database   | DSN prefix   | Example                                          |
|------------|--------------|--------------------------------------------------|
| PostgreSQL | `pgsql:`     | `pgsql:host=postgres;port=5432;dbname=main`      |
| MySQL      | `mysql:`     | `mysql:host=mysql;port=3306;dbname=main`         |
| SQLite     | `sqlite:`    | `sqlite:/var/data/db.sqlite3`                    |

```php
new Driver(
    dsn: 'mysql:host=mysql;dbname=main',
    username: 'dbuser',
    password: 'dbpassword',
)
```

For non-standard data sources, implement the `dbschemix\core\connection\DriverInterface` interface.

## Database names and the `--db` filter

The database name accepted by the `--db` option is derived **from the driver**, not from the path. The `Migration` class builds the name using the formula:

```
<driver-name>/<source-name>
```

Where `driver-name` is the database type in lowercase (e.g. `pgsql`, `mysql`, `sqlite`), and `source-name` is the database name from the DSN.

Example: the DSN `pgsql:host=postgres;port=5432;dbname=main` produces the name `pgsql/main`. This is the value passed to `--db` to select a specific database when working with multiple databases.

## Event subscribers

The `eventSubscribers` parameter accepts an array of objects implementing the `EventSubscriberInterface` interface. Subscribers receive notifications about the migration progress: successful file application, error, rollback.

`dbschemix\migrator\tools\PrettyConsoleOutput` is the standard subscriber that prints results to the console in a human-readable format. It is sufficient for most scenarios.

To implement a custom subscriber, create a class that implements `EventSubscriberInterface` and return from the `subscriptions()` method an associative array where keys are event names and values are callable handlers:

```php
use dbschemix\core\event\EventSubscriberInterface;
use dbschemix\core\event\Event;
use dbschemix\core\event\EventInterface;

class MyLogger implements EventSubscriberInterface
{
    public function subscriptions(): array
    {
        return [
            Event::MigrateSuccess->name => function (Event $name, EventInterface $event): void {
                // your logic
            },
        ];
    }
}
```

## Multiple databases in one configuration

The `list` parameter can receive multiple `Migration` objects with different drivers or with the same `path` directory but different databases. A typical case is the main database and its copy (e.g. for testing):

```php
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
        new Migration(
            path: __DIR__ . '/migration/postgres/main',
            driver: new Driver(
                dsn: 'pgsql:host=postgres;port=5432;dbname=maincopy',
                username: 'postgres',
                password: 'postgres',
            ),
        ),
    ],
    eventSubscribers: [
        new PrettyConsoleOutput(),
    ],
);
```

In this example, both `Migration` objects use the same migration directory (`postgres/main`) but different databases. When run without `--db`, the migrator processes both databases sequentially. To apply migrations only to the copy, specify `--db pgsql/maincopy`.
