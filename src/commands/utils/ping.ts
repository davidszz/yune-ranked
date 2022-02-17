import type { CommandInteraction } from 'discord.js';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'ping',
			description: 'Obtem a latência do bot',
			manageable: false,
			showInMatchHelp: true,
		});
	}

	async run(interaction: CommandInteraction) {
		const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
		await interaction.editReply({
			content: `Latência: \`${reply.createdTimestamp - interaction.createdTimestamp}ms\``,
		});
	}
}
