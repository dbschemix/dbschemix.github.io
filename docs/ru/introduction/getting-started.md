---
title: dbschemix - установка migrator через composer
lang: ru-RU
---

# Начало работы

## Установка

Установите migrator через Composer:

```bash
composer require dbschemix/migrator
```

## Конфигурация

Создаём каталоги, где будут храниться файлы миграций.

Например, для базы данных с именем _main_ под управлением сервера **postgres**:
```shell
mkdir -p ./migration/pgsql/{main,main-fixture} 
```

Минимально рабочая конфигурация:
```php
$migrator = new Migrator(
    list: [
        new Migration(
            path: __DIR__ . '/migration/postgres/main',
            driver: new PdoDriver(
                dsn: 'pgsql:host=postgres;port=5432;dbname=main',
                username: 'postgres',
                password: 'postgres',
            )
        )
    ],
);
```

Чтобы узнать больше о конфигурации, посетите раздел [Конфигурация](configuration.md).

## Миграции

Команды миграции описываются на языке SQL, например:
```sql
-- @up
CREATE TABLE IF NOT EXISTS public.entity (
    id serial NOT NULL,
    parent_id integer NOT NULL,
    created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(0) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT entity_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS "I_entity_parent_id" ON public.entity USING btree (parent_id);

-- @down
DROP INDEX IF EXISTS I_entity_parent_id;
DROP TABLE IF EXISTS public.entity;
```

Управляющие команды:

- `@up`
- `@down`
- `@skip`

Если команды не указаны, то весь код будет вычитан как секция `up`.  
Если нужно скипнуть файл целиком, то можно добавить в название постфикс `skip`, например `202501011025_name_skip.sql`

## Запуск миграций

Чтобы увидеть больше примеров, посетите раздел [Примеры API](../example/examples.md).
