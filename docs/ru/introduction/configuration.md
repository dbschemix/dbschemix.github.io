---
title: dbschemix - конфигурирование migrator
lang: ru-RU
---

# Конфигурация

## Анатомия Migrator

`Migrator` — центральный объект библиотеки. Конструктор принимает два параметра:

- `list` — непустой массив объектов `Migration`. Каждый элемент описывает одну базу данных: каталог с SQL-файлами и драйвер подключения.
- `eventSubscribers` — массив подписчиков событий, реализующих `EventSubscriberInterface`. Параметр необязателен; по умолчанию список пуст.

Минимальная конфигурация для одной PostgreSQL-базы:

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

`Migration` описывает одну базу данных. Конструктор принимает:

- `path` — абсолютный путь к каталогу с SQL-файлами основных миграций.
- `driver` — экземпляр класса, реализующего `DriverInterface`.

Рядом с основным каталогом мигратор автоматически ищет дополнительные каталоги:

- `<db-name>-fixture` — фикстуры (тестовые данные, применяются командой `fixture`).
- `<db-name>-repeatable` — повторяемые миграции (выполняются при каждом запуске `up`).

Например, если `path` указывает на `migration/postgres/main`, то мигратор также проверит наличие `migration/postgres/main-fixture` и `migration/postgres/main-repeatable`.

## Драйвер

`dbschemix\pdo\Driver` — стандартный драйвер на основе PDO. Конструктор принимает:

- `dsn` — строка подключения PDO (обязательный параметр).
- `username` — имя пользователя (необязательный).
- `password` — пароль (необязательный).

Поддерживаемые СУБД:

| СУБД       | Префикс DSN  | Пример                                           |
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

Для нестандартных источников данных реализуйте интерфейс `dbschemix\core\connection\DriverInterface`.

## Имена баз данных и фильтр `--db`

Имя базы данных, которое принимает опция `--db`, формируется **из драйвера**, а не из пути. Класс `Migration` строит имя по формуле:

```
<driver-name>/<source-name>
```

Где `driver-name` — тип СУБД в нижнем регистре (например, `pgsql`, `mysql`, `sqlite`), а `source-name` — имя базы данных из DSN.

Пример: DSN `pgsql:host=postgres;port=5432;dbname=main` даёт имя `pgsql/main`. Именно это значение передаётся в `--db` для выбора конкретной базы при работе с несколькими базами.

## Подписчики событий

Параметр `eventSubscribers` принимает массив объектов, реализующих интерфейс `EventSubscriberInterface`. Подписчики получают уведомления о ходе миграции: успешное применение файла, ошибка, откат.

`dbschemix\migrator\tools\PrettyConsoleOutput` — стандартный подписчик, который выводит результаты в консоль в удобочитаемом формате. Его достаточно для большинства сценариев.

Чтобы реализовать собственный подписчик, создайте класс, имплементирующий `EventSubscriberInterface`, и верните из метода `subscriptions()` ассоциативный массив, где ключи — имена событий, а значения — callable-обработчики:

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
                // ваша логика
            },
        ];
    }
}
```

## Несколько баз в одной конфигурации

В `list` можно передать несколько объектов `Migration` с разными драйверами или с одним каталогом `path`, но разными базами данных. Типичный случай — основная база и её копия (например, для тестирования):

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

В этом примере оба объекта `Migration` используют один и тот же каталог миграций (`postgres/main`), но разные базы данных. При запуске без `--db` мигратор обходит обе базы последовательно. Чтобы применить миграции только к копии, укажите `--db pgsql/maincopy`.
