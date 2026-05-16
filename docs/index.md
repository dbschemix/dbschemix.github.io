---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "DBSchemix Migrator"
  text: "PHP database migration"
  tagline: A tool for safely managing changes to database schemas and the data itself.
  actions:
    - theme: brand
      text: Documentation
      link: /en/introduction/about
    - theme: alt
      text: API Examples
      link: /en/example/base

features:
  - title: Plain SQL
    details: Migrations are written in plain SQL — no DSL, no Active Record. What is stored in the file is what runs against the database.
  - title: Custom drivers
    details: PDO drivers for MySQL, PostgreSQL and SQLite are provided out of the box. Replace them with your own driver when needed.
  - title: Versioning
    details: Migrations applied in a single up run share a version number and can be rolled back together with one command.
---

