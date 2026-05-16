---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "DBSchemix Migrator"
  text: "PHP database migration"
  tagline: Инструмент для безопасного управления изменениями схемы баз данных и непосредственно данными
  actions:
    - theme: brand
      text: Документация
      link: /ru/introduction/about
    - theme: alt
      text: API примеры
      link: /ru/example/base

features:
  - title: Чистый SQL
    details: Миграции пишутся на SQL без DSL и Active Record — то, что хранится в файле, то и выполнится в базе данных.
  - title: Кастомные драйверы
    details: По умолчанию работа через PDO для MySQL, PostgreSQL и SQLite. При необходимости драйвер заменяется на собственный.
  - title: Версионирование
    details: Миграции, применённые одним прогоном up, помечаются общим номером версии и откатываются одной командой.
---

