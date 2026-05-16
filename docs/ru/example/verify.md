---
title: dbschemix - проверка миграций перед коммитом
lang: ru-RU
---

# Проверка миграций

`migrate:verify` последовательно прогоняет `up` и сразу `down` для всех ожидающих миграций.
Это позволяет убедиться, что свежие миграции корректно применяются и откатываются до того,
как изменения попадут в систему контроля версий.
Запускайте команду локально перед коммитом.

## Полный цикл

Создайте несколько миграций через `migrate:create`, а затем запустите `migrate:verify`.
Команда применяет все ожидающие миграции по очереди (`up`), после чего откатывает их
в обратном порядке (`down`).

```shell
/example $ php cli.php migrate:create test --db=sqlite/db
/example $ php cli.php migrate:create test2 --db=sqlite/db
/example $ php cli.php migrate:create test3 --db=sqlite/db

/example $ php cli.php migrate:verify
[sqlite/db] up:   202603070850_test.sql, vers: 177287432696 done
[sqlite/db] up:   202603070850_test2.sql, vers: 177287432696 done
[sqlite/db] up:   202603070850_test3.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test3.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test2.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test.sql, vers: 177287432696 done
```

## С лимитом

Опция `--limit` полезна, когда нужно проверить только последнюю добавленную миграцию,
не затрагивая остальные ожидающие изменения.

```shell
/example $ php cli.php migrate:verify --limit=1
[sqlite/db] up:   202603070850_test.sql, vers: 177287441498 done
[sqlite/db] down: 202603070850_test.sql, vers: 177287441498 done
```

## Поведение при ошибке

Если при выполнении `up` возникает ошибка, `migrate:verify` автоматически откатывает
все миграции, которые успели примениться, — база данных возвращается в исходное состояние.
Сообщение об ошибке содержит код `SQLSTATE` и проблемный фрагмент SQL.
Имя файла-нарушителя дополнительно выводится в конце вывода.

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
