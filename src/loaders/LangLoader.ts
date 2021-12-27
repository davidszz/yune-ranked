import i18next from 'i18next'
import backend from 'i18next-fs-backend'
import type { Bot } from '@client'
import { Loader } from '@structures/Loader'

export class LangLoader extends Loader {
  constructor(client: Bot) {
    super(client, {
      preLoad: true,
    })
  }

  async initialize(): Promise<void> {
    console.log('Loading lang...')
    await i18next.use(backend).init({
      backend: {
        loadPath: './src/locales/{{lng}}/{{ns}}.json',
      },
      cleanCode: true,
      fallbackLng: ['pt-BR', 'en-US'],
      defaultNS: 'commands',
      lng: 'pt-BR',
      ns: ['commands'],
    })
    console.log('Lang files loaded!')
  }
}
