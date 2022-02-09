import { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { YuneEmbed } from '@structures/YuneEmbed';
import { Rank } from '@utils/Constants';

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

	async run(interaction: CommandInteraction, t: TFunction) {
		await interaction.deferReply();

		const target = interaction.options.getMember('usuário') ?? interaction.member;
		const yourself = interaction.user.id === target.id;

		const data = await interaction.client.database.members.findOne(target, 'pdl rank division wins loses');
		const userRank = Object.values(Rank).find((x) => x.id === data.rank);

		const profileEmbed = new YuneEmbed()
			.setTitle(yourself ? 'Seu perfil' : `Perfil de ${target.user.tag}`)
			.setThumbnail(target.user.displayAvatarURL({ format: 'png', dynamic: true }))
			.setDescription([
				`**Vitórias:** ${data.wins}`,
				`**Derrotas:** ${data.loses}`,
				`**Classificação:** ${t(`misc:ranks.${userRank.name}`, {
					context: 'division',
					division: data.division ?? 1,
				})}`,
			]);

		await interaction.editReply({
			embeds: [profileEmbed],
		});
	}
}
