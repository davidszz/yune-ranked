import type { Command } from '@structures/Command'
import { Client, ClientOptions, Collection } from 'discord.js'
import type { DBWrapper } from './database/DBWrapper'

import * as Loaders from './loaders'

interface BotOptions extends ClientOptions {
  token: string
  guildId: string
  database: DBWrapper
}

export class Bot extends Client {
  token: string
  guildId: string
  database: DBWrapper
  commands: Collection<string, Command>

  constructor(options: BotOptions) {
    super(options)
    this.token = options.token
    this.guildId = options.guildId
    this.commands = new Collection()
    this.database = options.database
  }

  async start(): Promise<void> {
    const loaders = Object.values(Loaders).map(L => new L(this))

    for (const loader of loaders.filter(x => x.preLoad)) {
      await loader.initialize()
    }

    await this.login(this.token)

    for (const loader of loaders.filter(x => !x.preLoad)) {
      await loader.initialize()
    }
  }
}
