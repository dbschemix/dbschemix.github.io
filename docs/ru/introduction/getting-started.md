---
title: dbschemix - начало работы с migrator
lang: ru-RU
---

# Начало работы

## Установка

Добавьте библиотеку в проект с помощью Composer. Для работы требуется PHP с расширением `pdo` и хотя бы одним из драйверов: `pdo_pgsql`, `pdo_mysql` или `pdo_sqlite`.

```bash
composer require dbschemix/migrator
```

## Структура каталогов

Миграции хранятся в каталоге по пути `migration/<driver>/<db-name>/`. Рядом с основным каталогом можно разместить каталог `<db-name>-fixture` для фикстур (тестовые данные) и `<db-name>-repeatable` для повторяемых миграций — тех, что применяются заново при изменении содержимого файла. Все три каталога создаются одной командой:

```bash
mkdir -p ./migration/postgres/{main,main-fixture,main-repeatable}
```

## Минимальная конфигурация

Создайте PHP-файл, в котором описывается объект `Migrator`. Конструктор принимает массив объектов `Migration`, каждый из которых содержит путь к каталогу миграций и экземпляр драйвера. Ниже приведён пример для PostgreSQL. Подробное описание всех параметров конфигурации смотрите в разделе [Конфигурация](configuration.md).

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

## Точка входа CLI

`Console::run($migrator)` регистрирует все семь команд `migrate:*` и запускает консольное приложение. Рекомендуется добавить `PrettyConsoleOutput` в список подписчиков событий — тогда результат каждой операции будет выводиться в консоль в читаемом виде.

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

## Первая миграция

Имя файла миграции начинается с числового префикса (timestamp), который определяет порядок применения, — например, `202501011024_entity_create.sql`. Файл содержит секции `-- @up` (применение) и `-- @down` (откат). Поддерживаются теги `@up`, `@down` и `@skip`. Если ни одного тега в файле нет, весь файл трактуется как `@up`. Чтобы пропустить файл целиком, добавьте к его имени постфикс `_skip`, например `202501011025_name_skip.sql`.

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

## Первые команды

Перед первым применением миграций выполните `migrate:init` — команда создаёт служебную таблицу версий в базе данных. После этого `migrate:up` применяет все ожидающие миграции в порядке возрастания имени файла, а `migrate:down` откатывает последнюю применённую миграцию.

```shell
/example $ php cli.php migrate:init
[sqlite/db] initialization: setup.sql done

/example $ php cli.php migrate:up
[sqlite/db] up: 202501011024_entity_create.sql done

/example $ php cli.php migrate:down
[sqlite/db] down: 202501011024_entity_create.sql done
```

## Что дальше

- Полная конфигурация: [Конфигурация](configuration.md)
- Все команды CLI: [CLI справочник](../guide/cli.md)
- Docker: [Docker](../guide/docker.md)
- Примеры: [Базовые сценарии](../example/base.md)
