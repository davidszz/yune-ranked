import type { Bot } from '@client'
import type { ClientEvents } from 'discord.js'

interface EventListenerOptions {
  events: (keyof ClientEvents)[]
}

export abstract class EventListener {
  events: (keyof ClientEvents)[]

  constructor(public client: Bot, options: EventListenerOptions) {
    this.events = options.events
  }
}
