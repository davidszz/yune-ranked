import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';
import i18next from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { Ranks, UserRank } from '@utils/Constants';

import { add } from './sub/rank-roles/add';
import { list } from './sub/rank-roles/list';
import { remove } from './sub/rank-roles/remove';

const rankChoices = Ranks.filter(
	(x, i) => x.id !== UserRank.UNRANKED && Ranks.findIndex((r) => r.name === x.name) === i
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
			permissions: ['ADMINISTRATOR'],
			options: [
				{
					name: 'add',
					description: 'Adicione um cargo de acordo com o rank dos usuários',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'rank',
							description: 'Rank na qual o cago será atribuido automáticamente',
							type: 'STRING',
							choices: rankChoices,
							required: true,
						},
						{
							name: 'cargo',
							description: '@menção ou ID do cargo',
							type: 'ROLE',
							required: true,
						},
					],
				},
				{
					name: 'remove',
					description: 'Remove um cargo de acordo com o rank dos usuários',
					type: 'SUB_COMMAND',
					options: [
						{
							name: 'rank',
							description: 'Rank na qual o cargo será removido',
							type: 'STRING',
							choices: rankChoices,
							required: true,
						},
						{
							name: 'cargo',
							description: '@menção ou ID do cargo',
							type: 'STRING',
							required: true,
						},
					],
				},
				{
					name: 'list',
					description: 'Obtem uma lista com os cargos e ranks definidos',
					type: 'SUB_COMMAND',
				},
			],
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		await interaction.deferReply();

		switch (interaction.options.getSubcommand()) {
			case 'add': {
				add(interaction, t);
				return;
			}

			case 'remove': {
				remove(interaction, t);
				return;
			}

			case 'list': {
				list(interaction, t);
			}
		}
	}
}
