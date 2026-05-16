---
title: dbschemix - базовые сценарии прогона миграций
lang: ru-RU
---

# Базовые сценарии прогона

## Обычный цикл

Типичный путь работы с миграциями: сначала инициализируйте проект командой `migrate:init`, затем накатите все ожидающие миграции через `migrate:up`. При необходимости откатите изменения командой `migrate:down`. Обратите внимание: `migrate:down` без флага `--limit` откатывает **все** применённые миграции до полного состояния «до миграций» — чтобы откатить только одну, используйте `--limit=1`.

```shell
/example $ php cli.php migrate:init
[sqlite/db] initialization: setup.sql done

/example $ php cli.php migrate:up
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done

/example $ php cli.php migrate:down
[sqlite/db] down: 202501021025_account_email.sql done
[sqlite/db] down: 202501021024_account_create.sql done
[sqlite/db] down: 202501011024_entity_create.sql done
```

## Атомарный прогон: `--exactly-all`

Флаг `--exactly-all` объединяет все миграции прогона в единую партию. При падении любой миграции вся партия откатывается, и база данных остаётся в исходном состоянии. Применяйте эту опцию там, где важен принцип «всё или ничего» — например, при деплое на продакшен.

```shell
/example $ php cli.php migrate:up --exactly-all
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done
```

## Повторяемые миграции: `--with-repeatable`

Флаг `--with-repeatable` указывает применить повторяемые миграции после обычных. Они берутся из каталога `<source>-repeatable` и прогоняются заново при каждом изменении содержимого файла — удобно для представлений, функций и других идемпотентных объектов схемы. Обратите внимание: `--with-repeatable` несовместим с `--dry-run`.

```shell
/example $ php cli.php migrate:up --with-repeatable
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done
[sqlite/db] repeatable: 202501011024_entity_correction.sql done
[sqlite/db] repeatable: 202501011024_entity_correction_2.sql done
```

## Фильтр по базе: `--db`

В одном `Migrator` может быть зарегистрировано несколько объектов `Migration`. Флаг `--db` позволяет выбрать конкретную базу данных для команды. Имя базы формируется как `<driver-name>/<source-name>` — например, `pgsql/main` или `sqlite/db`. Без `--db` команда применяется ко всем зарегистрированным базам одновременно.

```shell
/example $ php cli.php migrate:up --db=pgsql/main
[pgsql/main] up: 202501011024_entity_create.sql done
```

## Тестовый прогон: `--dry-run`

Флаг `--dry-run` переводит команду в режим тестового прогона: утилита печатает план миграций, но не применяет никаких изменений в базе данных. Это удобно для проверки в CI и для ревью миграций перед реальным применением.

```shell
/example $ php cli.php migrate:up --dry-run
[sqlite/db] up: 202501011024_entity_create.sql (dry-run) done
```
