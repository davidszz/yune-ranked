import type { CommandInteraction } from 'discord.js'
import type { TFunction } from 'i18next'

import type { Bot } from '@client'
import { Command } from '@structures/Command'

export default class extends Command {
  constructor(client: Bot) {
    super(client, {
      name: 'ping',
      description: 'Obtem a latência do bot',
    })
  }

  async run(interaction: CommandInteraction, t: TFunction): Promise<void> {
    await interaction.deferReply({ ephemeral: true })

    const { pdl } = await interaction.client.database.members.findOne(
      { userId: interaction.user.id, guildId: interaction.guildId },
      'pdl'
    )

    await interaction.editReply({
      content: t('ping.pdl', { pdl }),
    })

    await interaction.client.database.members.update(
      {
        userId: interaction.user.id,
        guildId: interaction.guildId,
      },
      { $inc: { pdl: 1 } }
    )
  }
}
