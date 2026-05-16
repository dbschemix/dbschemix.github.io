---
title: dbschemix - пример работы версионирования
lang: ru-RU
---

# Version

## Down with latest version

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

## Redo with latest version

```shell
/example $ php cli.php migrate:up
[sqlite/db] up: 202501021024_account_create.sql, vers: 1772723718828 done
[sqlite/db] up: 202501021025_account_email.sql, vers: 1772723718828 done

/example $ php cli.php migrate:redo --latest-version
[sqlite/db] down: 202501021025_account_email.sql, vers: 1772723718828 done
[sqlite/db] down: 202501021024_account_create.sql, vers: 1772723718828 done
[sqlite/db] up: 202501021024_account_create.sql, vers: 1772723727397 done
[sqlite/db] up: 202501021025_account_email.sql, vers: 1772723727397 done

```
