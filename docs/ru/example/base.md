---
title: dbschemix - базовые примеры работы с миграциями
lang: ru-RU
---

## Workflow

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

## With exactly all

If any migration fails, the entire batch is rolled back, leaving the database unchanged.

```shell
/example $ php cli.php migrate:up --exactly-all
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done
```

## With repeatable

```shell
/example $ php cli.php migrate:up --with-repeatable
[sqlite/db] up: 202501011024_entity_create.sql done
[sqlite/db] up: 202501021024_account_create.sql done
[sqlite/db] up: 202501021025_account_email.sql done
[sqlite/db] repeatable: 202501011024_entity_correction.sql done
[sqlite/db] repeatable: 202501011024_entity_correction_2.sql done
```
