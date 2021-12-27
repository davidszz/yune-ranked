import type { Bot } from '@client'
import { Command } from '@structures/Command'
import { Loader } from '@structures/Loader'
import { FileUtils } from '@utils/FileUtils'
import path from 'path'
import readdirp from 'readdirp'

export class CommandsLoader extends Loader {
  constructor(client: Bot) {
    super(client, {
      preLoad: false,
    })
  }

  async initialize(): Promise<void> {
    const commandFiles = readdirp(path.resolve(FileUtils.rootDir, 'commands'))

    const commands: Command[] = []
    for await (const file of commandFiles) {
      if (/\.(js|ts)$/i.test(file.basename)) {
        try {
          const Constructor = await import(file.fullPath).then(res => res.default)
          const command = new Constructor(this.client)
          if (command instanceof Command) {
            commands.push(command)
          }
        } catch (err) {
          console.error(`Error on load file ${file.basename}`)
        }
      }
    }

    if (!process.argv?.includes('--no-deploy')) {
      console.log('Started registering (/) slash commands...')
      await this.client.application.commands.set(
        commands.map(x => x.toData()),
        this.client.guildId
      )
      console.log('Slash commands (/) has been registered!')
    }

    for (const command of commands) {
      this.client.commands.set(command.name, command)
    }
  }
}
