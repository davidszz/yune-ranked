import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { PaginatedEmbed } from '@structures/PaginatedEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';
import { MatchStatus } from '@utils/Constants';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'ajuda',
			description: 'Obtem uma lista com todos os comandos do bot',
			showInMatchHelp: true,
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		await interaction.deferReply({ ephemeral: true });

		const matchData = await interaction.client.database.matches.findOne({
			guildId: interaction.guildId,
			status: MatchStatus.IN_GAME,
			'channels.chat': interaction.channelId,
		});

		if (matchData?._id) {
			const commands = interaction.client.commands.filter(
				(x) => (!x.type || x.type === 'CHAT_INPUT') && x.showInMatchHelp
			);
			if (!commands.size) {
				interaction.editReply({
					content: t('help.errors.no_match_commands'),
				});
				return;
			}

			const template = new YuneEmbed().setDescription([t('help.embeds.match.description'), '']).setFooter({
				text: t('help.embeds.match.footer', { total_commands: commands.size }),
				iconURL: interaction.client.user.displayAvatarURL({ format: 'png', dynamic: true }),
			});

			const paginated = new PaginatedEmbed({
				author: interaction.user,
				target: interaction,
				values: commands.map((x) => ({
					id: x.name,
					value: x,
				})),
				createRow({ value }) {
					return `\`/${value.fullName}\`\n${value.description}\n`;
				},
				limit: 5,
				deletable: true,
				deleteOnEnd: true,
				locale: interaction.guildLocale,
				template,
				showCurrentPageBtn: true,
			});

			paginated.paginate();
		} else {
			const commands = interaction.client.commands.filter((x) => !x.type || x.type === 'CHAT_INPUT');
			if (!commands.size) {
				interaction.editReply({
					content: t('help.errors.no_commands'),
				});
				return;
			}

			const template = new YuneEmbed().setDescription([t('help.embeds.common.description'), '']).setFooter({
				text: t('help.embeds.common.footer', { total_commands: commands.size }),
				iconURL: interaction.client.user.displayAvatarURL({ format: 'png', dynamic: true }),
			});

			const paginated = new PaginatedEmbed({
				author: interaction.user,
				target: interaction,
				values: commands.map((x) => ({
					id: x.name,
					value: x,
				})),
				createRow({ value }) {
					return `\`/${value.fullName}\`\n${value.description}\n`;
				},
				limit: 5,
				deletable: true,
				deleteOnEnd: true,
				locale: interaction.guildLocale,
				template,
				showCurrentPageBtn: true,
			});

			paginated.paginate();
		}
	}
}
