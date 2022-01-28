import { CommandInteraction } from 'discord.js';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { YuneEmbed } from '@structures/YuneEmbed';
import { Utils } from '@utils/Utils';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'perfil',
			description: 'Obtem o perfil do usuário',
			options: [
				{
					name: 'usuário',
					description: 'O @usuário para obter o perfil',
					type: 'USER',
				},
			],
		});
	}

	async run(interaction: CommandInteraction) {
		await interaction.deferReply();

		const target = interaction.options.getMember('usuário') ?? interaction.member;
		const yourself = interaction.user.id === target.id;

		const data = await interaction.client.database.members.findOne(target, 'pdl rank division wins loses');

		const profileEmbed = new YuneEmbed()
			.setTitle(yourself ? 'Seu perfil' : `Perfil de ${target.user.tag}`)
			.setThumbnail(target.user.displayAvatarURL({ format: 'png', dynamic: true }))
			.setDescription([
				`**Vitórias:** ${data.wins}`,
				`**Derrotas:** ${data.loses}`,
				`**Classificação:** ${
					data.rank ? `${Utils.capitalize(data.rank)} ${'I'.repeat(data.division)} (${data.pdl} pdl)` : 'Unranked'
				}`,
			]);

		await interaction.editReply({
			embeds: [profileEmbed],
		});
	}
}
