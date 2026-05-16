---
title: dbschemix - версионирование миграций
lang: ru-RU
---

# Версионирование

## Концепция версии

Каждый раз, когда вы запускаете `migrate:up`, все применённые в этом прогоне миграции помечаются общим числовым идентификатором — номером версии (timestamp). В выводе он отображается как `vers: <число>`. Таким образом, один прогон `up` всегда образует одну партию: несколько миграций — один номер версии.

Именно этот номер используют команды `migrate:down` и `migrate:redo` с флагом `--latest-version`: вместо того чтобы откатывать одну миграцию, они работают со всей партией целиком.

## Откат всей последней версии

Флаг `--latest-version` в команде `migrate:down` откатывает не одну миграцию, а все миграции с самым свежим номером версии. Если последний прогон `up` затронул несколько миграций, откатятся все они сразу.

```shell
/example $ php cli.php migrate:up --limit=1
[sqlite/db] up: 202501011024_entity_create.sql, vers: 1772723563954 done

/example $ php cli.php migrate:up --limit=2
[sqlite/db] up: 202501021024_account_create.sql, vers: 1772723566084 done
[sqlite/db] up: 202501021025_account_email.sql, vers: 1772723566084 done

/example $ php cli.php migrate:down --latest-version
[sqlite/db] down: 202501021025_account_email.sql, vers: 1772723566084 done
[sqlite/db] down: 202501021024_account_create.sql, vers: 1772723566084 done
```

После выполнения `--latest-version` в базе данных осталась только миграция `202501011024_entity_create.sql` из первой партии (vers: `1772723563954`). Она имеет собственный номер версии и команда `down --latest-version` её не затронула.

## Redo последней версии

Команда `migrate:redo --latest-version` последовательно откатывает всю последнюю партию миграций, а затем применяет их заново. После повторного применения миграции получают новый номер версии — он отличается от исходного, поскольку генерируется в момент выполнения.

```shell
/example $ php cli.php migrate:up
[sqlite/db] up: 202501021024_account_create.sql, vers: 1772723718828 done
[sqlite/db] up: 202501021025_account_email.sql, vers: 1772723718828 done

/example $ php cli.php migrate:redo --latest-version
[sqlite/db] down: 202501021025_account_email.sql, vers: 1772723718828 done
[sqlite/db] down: 202501021024_account_create.sql, vers: 1772723718828 done
[sqlite/db] up:   202501021024_account_create.sql, vers: 1772723727397 done
[sqlite/db] up:   202501021025_account_email.sql, vers: 1772723727397 done
```

## Версия и `--limit`

Флаг `--limit` ограничивает количество миграций, которые применяются за один прогон `up`, но не разбивает их на несколько партий. Все миграции одного прогона, сколько бы их ни было, получают единый номер версии. Например, `--limit=2` применит ровно две миграции, и обе окажутся в одной партии с одним номером версии.
