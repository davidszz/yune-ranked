import type { Bot } from '@client'
import { EventListener } from '@structures/EventListener'
import { Loader } from '@structures/Loader'
import { FileUtils } from '@utils/FileUtils'
import path from 'path'
import readdirp from 'readdirp'

export class EventsListenerLoader extends Loader {
  constructor(client: Bot) {
    super(client, { preLoad: true })
  }

  async initialize(): Promise<void> {
    const eventFiles = readdirp(path.resolve(FileUtils.rootDir, 'listeners'))

    for await (const file of eventFiles) {
      if (/\.(js|ts)/i.test(file.basename)) {
        try {
          const Constructor = await import(file.fullPath).then(res => res.default)
          const eventListener = new Constructor(this.client)

          if (eventListener instanceof EventListener) {
            for (const eventName of eventListener.events) {
              const listener =
                eventListener[`on${eventName[0].toUpperCase()}${eventName.slice(1)}`]
              if (listener) {
                this.client.on(eventName, (...args) =>
                  listener.bind(eventListener)(...args)
                )
              }
            }
          }
        } catch (err) {
          console.error(`Error on load event listener ${file.basename}`, err)
        }
      }
    }
  }
}
