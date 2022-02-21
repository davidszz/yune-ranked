import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';
import i18next from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { Ranks } from '@utils/Ranks';
import { UserRank } from '@utils/UserRank';

import { add } from './sub/rank-roles/add';
import { list } from './sub/rank-roles/list';
import { remove } from './sub/rank-roles/remove';

const rankChoices = Ranks.filter(
	(x, i) => x.id !== UserRank.Unranked && Ranks.findIndex((r) => r.name === x.name) === i
).map((x) => ({
	name: i18next.t(`misc:ranks.names.${x.name}`, { lng: 'pt-BR' }),
	value: x.name,
}));

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'rank-roles',
			description: 'Gerêncie os cargos de acordo com o rank dos usuários',
			usage: '<add/remove/list>',
			permissions: ['Administrator'],
			options: [
				{
					name: 'add',
					description: 'Adicione um cargo de acordo com o rank dos usuários',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'rank',
							description: 'Rank na qual o cago será atribuido automáticamente',
							type: ApplicationCommandOptionType.String,
							choices: rankChoices,
							required: true,
						},
						{
							name: 'cargo',
							description: '@menção ou ID do cargo',
							type: ApplicationCommandOptionType.Role,
							required: true,
						},
					],
				},
				{
					name: 'remove',
					description: 'Remove um cargo de acordo com o rank dos usuários',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'rank',
							description: 'Rank na qual o cargo será removido',
							type: ApplicationCommandOptionType.String,
							choices: rankChoices,
							required: true,
						},
						{
							name: 'cargo',
							description: '@menção ou ID do cargo',
							type: ApplicationCommandOptionType.String,
							required: true,
						},
					],
				},
				{
					name: 'list',
					description: 'Obtem uma lista com os cargos e ranks definidos',
					type: ApplicationCommandOptionType.Subcommand,
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply();

		switch (interaction.options.getSubcommand()) {
			case 'add': {
				await add(interaction, t);
				return;
			}

			case 'remove': {
				await remove(interaction, t);
				return;
			}

			case 'list': {
				await list(interaction, t);
			}
		}
	}
}
