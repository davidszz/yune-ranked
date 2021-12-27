import type { Bot } from '@client'
import 'discord.js'

declare module 'discord.js' {
  interface Interaction {
    client: Bot
  }
}
