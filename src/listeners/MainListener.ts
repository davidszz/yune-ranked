import type { Bot } from '@client'
import { EventListener } from '@structures/EventListener'
import { Interaction } from 'discord.js'
import type { StringMap, TFunction, TOptions } from 'i18next'
import i18next from 'i18next'

export default class extends EventListener {
  constructor(client: Bot) {
    super(client, {
      events: ['error', 'ready', 'interactionCreate'],
    })
  }

  async onReady(): Promise<void> {
    console.log(`Logged in as ${this.client.user.tag}`)
  }

  onError(error: Error): void {
    console.error('[DISCORD ERROR LOG]:', error)
  }

  async onInteractionCreate(interaction: Interaction): Promise<void> {
    if (interaction.isMessageComponent()) return

    if (interaction.isApplicationCommand() || interaction.isAutocomplete()) {
      const command = interaction.client.commands.find(
        x => x.name === interaction.commandName && x.type === interaction.command?.type
      )

      if (command) {
        const { locale } = await interaction.client.database.guilds.findOne(
          interaction.guildId,
          'locale'
        )

        const t = (key: string | string[], options?: TOptions<StringMap>) =>
          i18next.t(key, {
            lng: locale,
            ...options,
          })

        if (interaction.isAutocomplete()) {
          if ('autocomplete' in command) {
            try {
              await command.autocomplete(interaction, t as TFunction)
            } catch (err) {
              console.error(err)
            }
          }
        } else {
          try {
            await command.run(interaction, t as TFunction)
          } catch (err) {
            console.error(err)
          }
        }
      }
    }
  }
}
