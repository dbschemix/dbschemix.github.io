---
title: dbschemix - справочник команд и аргументов
lang: ru-RU
---

# CLI справочник

## Обзор

Точка входа в CLI — статический метод `Console::run($migrator)`, который вы вызываете в своём `cli.php`. Метод принимает настроенный экземпляр `Migrator`, регистрирует все команды и передаёт управление Symfony Console.

Общий синтаксис вызова:

```shell
php cli.php <command> [options]
```

Доступно 7 команд: `migrate:init`, `migrate:up`, `migrate:down`, `migrate:redo`, `migrate:verify`, `migrate:fixture`, `migrate:create`.

**Exit-коды:**

| Код | Значение |
|-----|----------|
| `0` | Успех |
| `2` | Ошибка валидации опций или известная ошибка мигратора |
| `1` | Необработанное исключение |

## Общие опции

Следующие опции поддерживаются несколькими командами и имеют единую семантику.

| Опция       | Тип         | По умолчанию   | Применяется в                           | Описание                                                                 |
|-------------|-------------|----------------|-----------------------------------------|--------------------------------------------------------------------------|
| `--db`      | string      | —              | up, down, redo, verify, fixture, create | Имя базы в формате `<driver>/<source>`, например `pgsql/main`.          |
| `--limit`   | non-neg int | `0` (без лимита) | up, down, redo, verify, fixture       | Максимум миграций к выполнению или откату за один запуск.                |
| `--dry-run` | флаг        | `false`        | up, down, redo, verify, fixture         | Тестовый прогон без изменений в БД.                                      |

Значение `--limit=0` означает «без ограничений». При передаче отрицательного числа команда завершится с ошибкой валидации.

## migrate:init

Команда создаёт служебную инфраструктуру, необходимую для отслеживания версий миграций. Под капотом выполняется скрипт `setup.sql` для каждой зарегистрированной базы. Команда идемпотентна — повторный запуск безопасен и не затрагивает уже инициализированные базы. Выполните её один раз при первоначальном развёртывании проекта.

Команда не принимает никаких опций.

```shell
/example $ php cli.php migrate:init
[sqlite/db] initialization: setup.sql done
```

## migrate:up

Применяет все ожидающие миграции в порядке возрастания имени файла. Все миграции одного запуска получают общий номер версии (timestamp), что позволяет впоследствии откатить их как единую партию. Если инфраструктура ещё не инициализирована, команда выводит подсказку: вызовите `migrate:init`.

### Специфичные опции

| Опция               | Тип  | По умолчанию | Описание                                                                             |
|---------------------|------|--------------|--------------------------------------------------------------------------------------|
| `--exactly-all`     | флаг | `false`      | Атомарный прогон: при ошибке любой миграции вся партия откатывается.                |
| `--with-repeatable` | флаг | `false`      | Дополнительно прогоняет миграции из каталога `<source>-repeatable`. Не работает совместно с `--dry-run`. |

### Примеры

Базовый прогон:

```shell
/example $ php cli.php migrate:up
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done
```

С флагом `--exactly-all`:

```shell
/example $ php cli.php migrate:up --exactly-all
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done
```

С флагом `--with-repeatable`:

```shell
/example $ php cli.php migrate:up --with-repeatable
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done
[sqlite/db] repeatable: 202501011024_entity_correction.sql done
[sqlite/db] repeatable: 202501011024_entity_correction_2.sql done
```

С ограничением числа миграций:

```shell
/example $ php cli.php migrate:up --limit=2
[sqlite/db] up: 202501021024_account_create.sql, vers: 1772723566084 done
[sqlite/db] up: 202501021025_account_email.sql, vers: 1772723566084 done
```

## migrate:down

Откатывает применённые миграции в обратном порядке (от самой новой к старой). По умолчанию откатывается всё до первой миграции: используйте `--limit=1`, чтобы откатить одну последнюю. Флаг `--latest-version` переключает режим: откатывается сразу вся последняя версия — то есть все миграции, применённые одним запуском `migrate:up`. Если инфраструктура не инициализирована, команда выводит подсказку.

### Специфичные опции

| Опция              | Тип  | По умолчанию | Описание                                                                                       |
|--------------------|------|--------------|------------------------------------------------------------------------------------------------|
| `--latest-version` | флаг | `false`      | Откатить всю последнюю версию — партию миграций, применённых одним прогоном `migrate:up`.     |

### Примеры

Откат последней партии (последней версии):

```shell
/example $ php cli.php migrate:down --latest-version
[sqlite/db] down: 202501021025_account_email.sql, vers: 1772723566084 done
[sqlite/db] down: 202501021024_account_create.sql, vers: 1772723566084 done
```

Откат всех миграций без флага:

```shell
/example $ php cli.php migrate:down
[sqlite/db] down: 202501021025_account_email.sql done
[sqlite/db] down: 202501021024_account_create.sql done
[sqlite/db] down: 202501011024_entity_create.sql done
```

## migrate:redo

Выполняет последовательно `down`, а затем `up` для последней миграции или версии. По умолчанию повторяется одна последняя миграция. С флагом `--latest-version` сначала откатывается вся последняя версия целиком, затем те же миграции применяются заново с новым номером версии. Команда полезна при разработке: позволяет убедиться, что миграция корректно откатывается и накатывается повторно. Поддерживает `--dry-run` для тестового прогона без изменений в БД.

Опции `migrate:redo`: `--db`, `--limit`, `--latest-version`, `--dry-run`.

### Пример

```shell
/example $ php cli.php migrate:redo --latest-version
[sqlite/db] down: 202501021025_account_email.sql, vers: 1772723718828 done
[sqlite/db] down: 202501021024_account_create.sql, vers: 1772723718828 done
[sqlite/db] up:   202501021024_account_create.sql, vers: 1772723727397 done
[sqlite/db] up:   202501021025_account_email.sql, vers: 1772723727397 done
```

## migrate:verify

Применяет все ожидающие миграции (`up`), а затем немедленно откатывает их (`down`). Цель — убедиться, что новые миграции корректно работают в обе стороны ещё до коммита. Если `up` завершается ошибкой, автоматически откатывается всё, что успело примениться. Команда не оставляет следов в базе данных. Используйте `--limit`, чтобы проверить ограниченное число миграций.

Опции `migrate:verify`: `--db`, `--limit`, `--dry-run`.

### Примеры

Проверка всех ожидающих миграций:

```shell
/example $ php cli.php migrate:verify
[sqlite/db] up:   202603070850_test.sql, vers: 177287432696 done
[sqlite/db] up:   202603070850_test2.sql, vers: 177287432696 done
[sqlite/db] up:   202603070850_test3.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test3.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test2.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test.sql, vers: 177287432696 done
```

Проверка одной миграции (`--limit=1`):

```shell
/example $ php cli.php migrate:verify --limit=1
[sqlite/db] up:   202603070850_test.sql, vers: 177287441498 done
[sqlite/db] down: 202603070850_test.sql, vers: 177287441498 done
```

Пример при ошибке в миграции:

```shell
/example $ php cli.php migrate:verify
[sqlite/db] up:   202603070850_test.sql, vers: 177287479980 done
[sqlite/db] up:   202603070850_test2.sql error
SQLSTATE[HY000]: General error: 1 incomplete input
-- SQL CODE
INSERT INTO ededede


[sqlite/db] down: 202603070850_test.sql, vers: 177287479980 done
202603070850_test2.sql: SQLSTATE[HY000]: General error: 1 incomplete input
```

Всё, что успело примениться до упавшей миграции, откатывается автоматически.

## migrate:fixture

Применяет миграции из каталога `<source>-fixture`. Фикстуры используются для наполнения базы тестовыми данными в dev- и test-окружениях. Файлы фикстур имеют тот же формат, что и обычные миграции: секции `@up`, `@down`, `@skip`. Команда поддерживает те же опции управления запуском, что и `migrate:up`, за исключением `--exactly-all` и `--with-repeatable`.

Опции `migrate:fixture`: `--db`, `--limit`, `--dry-run`.

## migrate:create

Создаёт пустой файл миграции в каталоге, соответствующем указанной базе. Опция `--db` обязательна. Аргумент `name` задаёт произвольное имя миграции латиницей без расширения. Имя файла формируется автоматически как `<timestamp>_<name>.sql`. В созданный файл записывается шаблон с пустыми секциями `@up` и `@down`.

### Синтаксис

```shell
php cli.php migrate:create <name> --db=<driver>/<source>
```

### Пример

```shell
/example $ php cli.php migrate:create entity_create --db=pgsql/main
```

Опции `migrate:create`: `--db` (обязательна), аргумент `name` (обязательный). Опции `--limit` и `--dry-run` недоступны.

## Управляющие теги в SQL

Файлы миграций содержат обычный SQL для целевой СУБД. Управляющее поведение задаётся специальными тегами-комментариями.

| Тег     | Назначение                              |
|---------|-----------------------------------------|
| `@up`   | Секция применения миграции              |
| `@down` | Секция отката миграции                  |
| `@skip` | Пропустить блок SQL                     |

Если ни одного тега в файле нет, весь файл трактуется как секция `@up`. Постфикс `_skip` в имени файла (например, `202501011025_name_skip.sql`) пропускает файл целиком — теги при этом не нужны.

```sql
-- @up
CREATE TABLE example (id serial PRIMARY KEY);

-- @down
DROP TABLE example;
```
