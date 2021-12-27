import type { Bot } from '@client'
import type {
  ApplicationCommandData,
  ApplicationCommandOptionData,
  ApplicationCommandType,
  AutocompleteInteraction,
  Interaction,
} from 'discord.js'
import type { TFunction } from 'i18next'

export interface Command {
  autocomplete?(interaction: AutocompleteInteraction, t: TFunction): void | Promise<void>
}

export abstract class Command {
  name: string
  description: string
  type?: ApplicationCommandType = 'CHAT_INPUT'
  options?: ApplicationCommandOptionData[]
  defaultPermission?: boolean

  abstract run(interaction: Interaction, t: TFunction): void | Promise<void>

  constructor(public client: Bot, options: ApplicationCommandData) {
    this.name = options.name
    this.type = options.type as ApplicationCommandType
    this.description = 'description' in options ? options.description : null
    this.options = 'options' in options ? options.options : null
    this.defaultPermission = options.defaultPermission
  }

  toData(): ApplicationCommandData {
    return {
      name: this.name,
      type: this.type,
      description: this.description,
      options: this.options,
      defaultPermission: this.defaultPermission,
    }
  }
}
