import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

import { add } from './sub/subscription-roles/add';
import { list } from './sub/subscription-roles/list';
import { remove } from './sub/subscription-roles/remove';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'cargos-assinatura',
			description: 'Gerêncie os cargos que os usuários receberão após ativarem uma assinatura',
			usage: '<add/remove/list>',
			permissions: ['ADMINISTRATOR'],
			options: [
				{
					name: 'add',
					description: 'Adiciona um cargo de assinatura',
					type: 'SUB_COMMAND',
					options: [
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
					description: 'Remove um cargo de assinatura',
					type: 'SUB_COMMAND',
					options: [
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
					description: 'Obtem uma lista com todos os cargos de assinatura',
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
