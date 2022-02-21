import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

import { activity } from './sub/bot-config/activity';
import { avatar } from './sub/bot-config/avatar';
import { username } from './sub/bot-config/username';

const activities = ['Jogando', 'Transmitindo', 'Ouvindo', 'Assistindo', '', 'Competindo'];

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'bot-config',
			description: 'Configure o bot de acordo com suas preferências',
			permissions: ['Administrator'],
			options: [
				{
					name: 'avatar',
					description: 'Altera o avatar do bot',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'imagem',
							description: 'Novo avatar do bot',
							type: ApplicationCommandOptionType.Attachment,
							required: true,
						},
					],
				},
				{
					name: 'nome',
					description: 'Altera o nome de usuário do bot',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'nome',
							description: 'Novo nome do bot',
							type: ApplicationCommandOptionType.String,
							required: true,
						},
					],
				},
				{
					name: 'atividade',
					description: 'Altera a ativadade do bot',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'tipo',
							description: 'Tipo de atividade',
							type: ApplicationCommandOptionType.Integer,
							choices: activities
								.map((x, i) => ({
									name: x,
									value: i,
								}))
								.filter((x) => !!x.name),
							required: true,
						},
						{
							name: 'nome',
							description: 'Nome do que o bot está fazendo no momento (uma descrição)',
							type: ApplicationCommandOptionType.String,
							required: true,
						},
						{
							name: 'url',
							description: 'URL da transmição do usuário caso o tipo de atividade seja transmitindo',
							type: ApplicationCommandOptionType.String,
						},
					],
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction): Promise<void> {
		await interaction.deferReply();

		switch (interaction.options.getSubcommand()) {
			case 'avatar': {
				await avatar(interaction, t);
				return;
			}

			case 'nome': {
				await username(interaction, t);
				return;
			}

			case 'atividade': {
				await activity(interaction, t);
			}
		}
	}
}
