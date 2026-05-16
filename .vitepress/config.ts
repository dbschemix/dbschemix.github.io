import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'DBSchemix Migrator',
  description: 'PHP database migration',
  cleanUrls: true,
  srcDir: './docs',
  base: '/',

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Documentation', link: '/en/introduction/about.md' },
        ],
        sidebar: {
          '/en/': [
            {
              text: 'Introduction',
              items: [
                { text: 'Why dbschemix', link: '/en/introduction/about.md' },
                { text: 'Getting Started', link: '/en/introduction/getting-started.md' },
                { text: 'Configuration', link: '/en/introduction/configuration.md' },
              ],
            },
            {
              text: 'Guide',
              items: [
                { text: 'CLI reference', link: '/en/guide/cli.md' },
                { text: 'Docker', link: '/en/guide/docker.md' }
              ],
            },
            {
              text: 'API Examples',
              items: [
                { text: 'Base case', link: '/en/example/base.md' },
                { text: 'Version', link: '/en/example/version.md' },
                { text: 'Verify', link: '/en/example/verify.md' }
              ],
            },
          ]
        }
      }
    },

    ru: {
      label: 'Русский',
      lang: 'ru-RU',
      link: '/ru/',
      themeConfig: {
        nav: [
          { text: 'Главная', link: '/ru/' },
          { text: 'Документация', link: '/ru/introduction/about.md' },
        ],
        sidebar: {
          '/ru/': [
            {
              text: 'Введение',
              items: [
                { text: 'Зачем dbschemix', link: '/ru/introduction/about.md' },
                { text: 'Начало работы', link: '/ru/introduction/getting-started.md' },
                { text: 'Конфигурация', link: '/ru/introduction/configuration.md' }
              ]
            },
            {
              text: 'Руководство',
              items: [
                { text: 'CLI справочник', link: '/ru/guide/cli.md' },
                { text: 'Docker', link: '/ru/guide/docker.md' }
              ]
            },
            {
              text: 'Примеры API',
              items: [
                { text: 'Базовый кейс', link: '/ru/example/base.md' },
                { text: 'Версионирование', link: '/ru/example/version.md' },
                { text: 'Проверка миграций', link: '/ru/example/verify.md' }
              ]
            },
          ]
        },

        outline: {
          label: 'На этой странице',
        },
        docFooter: {
          prev: 'Назад',
          next: 'Вперёд',
        },
        lastUpdated: {
          text: 'Обновлено',
        },
        returnToTopLabel: 'Наверх',
        sidebarMenuLabel: 'Меню',
        darkModeSwitchLabel: 'Тема',
      }
    }
  },

  themeConfig: {
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/dbschemix/migrator' }
    ]
  }
})
