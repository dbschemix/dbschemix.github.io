---
title: dbschemix - конфигурирование приложения
lang: ru-RU
---

# Конфигурирование

## Базовая конфигурация

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

## events
