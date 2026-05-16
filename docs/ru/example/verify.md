---
title: dbschemix - пример пробного прогона миграций
lang: ru-RU
---

# Verify

Данный режим подходит для проверки качества написанных миграции в среде разработки, перед тем как зафиксировать в системе контроля версий.

```shell
/example $ php cli.php migrate:create test --db=sqlite/db                                                                                   
/example $ php cli.php migrate:create test2 --db=sqlite/db        
/example $ php cli.php migrate:create test3 --db=sqlite/db

/example $ php cli.php migrate:verify
[sqlite/db] up: 202603070850_test.sql, vers: 177287432696 done
[sqlite/db] up: 202603070850_test2.sql, vers: 177287432696 done
[sqlite/db] up: 202603070850_test3.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test3.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test2.sql, vers: 177287432696 done
[sqlite/db] down: 202603070850_test.sql, vers: 177287432696 done
```

**With limit**

```shell
/example $ php cli.php migrate:verify --limit=1
[sqlite/db] up: 202603070850_test.sql, vers: 177287441498 done
[sqlite/db] down: 202603070850_test.sql, vers: 177287441498 done

```

**error**

```shell

/example $ php cli.php migrate:verify
[sqlite/db] up: 202603070850_test.sql, vers: 177287479980 done
[sqlite/db] up: 202603070850_test2.sql error
SQLSTATE[HY000]: General error: 1 incomplete input
-- SQL CODE
INSERT INTO ededede


[sqlite/db] down: 202603070850_test.sql, vers: 177287479980 done
202603070850_test2.sql: SQLSTATE[HY000]: General error: 1 incomplete input
```
