import {
	ButtonInteraction,
	CommandInteraction,
	InteractionCollector,
	MessageActionRow,
	MessageButton,
	User,
} from 'discord.js';
import { on } from 'events';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { YuneEmbed } from '@structures/YuneEmbed';
import { Emojis, Images } from '@utils/Constants';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'criar-fila',
			description: 'Cria uma fila para iniciar uma partida',
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		await interaction.deferReply();

		const { teamSize } = await interaction.client.database.guilds.findOne(interaction.guildId, 'teamSize');
		const participants: User[] = [interaction.user];

		const reply = await interaction.editReply({
			embeds: [generateEmbed()],
			components: [generateButtons()],
		});

		const collector = new InteractionCollector<ButtonInteraction>(interaction.client, {
			message: reply,
			componentType: 'BUTTON',
			interactionType: 'MESSAGE_COMPONENT',
			time: 5 * 60000,
			filter: async (i) => {
				if (i.customId === 'join' && participants.some((x) => x?.id === i.user.id)) {
					await i.reply({
						content: t('create_queue.errors.already_joined'),
						ephemeral: true,
					});
					return false;
				}

				if (i.customId === 'left') {
					if (i.user.id === interaction.user.id) {
						await i.reply({
							content: t('create_queue.errors.cannot_left'),
							ephemeral: true,
						});
						return false;
					}

					if (!participants.some((x) => x?.id === i.user.id)) {
						await i.reply({
							content: t('create_queue.errors.not_in_queue'),
							ephemeral: true,
						});
						return false;
					}
				}

				if (i.customId === 'destroy' && i.user.id !== interaction.user.id) {
					await i.reply({
						content: t('create_queue.errors.cannot_destroy'),
						ephemeral: true,
					});
					return false;
				}

				await i.deferReply({ ephemeral: true });
				return true;
			},
		});

		for await (const [i] of on(collector, 'collect') as AsyncIterableIterator<[ButtonInteraction]>) {
			const editEmbed = () =>
				interaction.editReply({
					embeds: [generateEmbed()],
					components: [generateButtons()],
				});

			if (i.customId === 'join' && !participants.some((x) => x?.id === i.user.id)) {
				const addParticipant = () => {
					const randIdx = Math.floor(Math.random() * (teamSize * 2));
					if (participants[randIdx]) {
						addParticipant();
					} else {
						participants[randIdx] = i.user;
					}
				};

				addParticipant();

				await editEmbed();
				await i.editReply({
					content: t('create_queue.joined', { target: interaction.user.toString() }),
				});
			}

			if (i.customId === 'left' && participants.some((x) => x?.id === i.user.id)) {
				participants.splice(
					participants.findIndex((x) => x?.id === i.user.id),
					1
				);
				await editEmbed();
				await i.editReply({
					content: t('create_queue.left', { target: interaction.user.toString() }),
				});
			}
		}

		function generateEmbed() {
			const parsedParticipants: string[] = [];

			for (let i = 0; i < teamSize * 2; i++) {
				const participant = participants[i];
				if (participant) {
					parsedParticipants.push(t('create_queue.embeds.queue.fields.accepted_user', { position: i + 1 }));
				} else {
					parsedParticipants.push(t('create_queue.embeds.queue.fields.empty_user'));
				}
			}

			return new YuneEmbed()
				.setAuthor({
					name: t('create_queue.embeds.queue.author', { user: interaction.user.tag }),
					iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true }),
				})
				.setDescription(t('create_queue.embeds.queue.description'))
				.addField(
					t('create_queue.embeds.queue.fields.team_1.name'),
					parsedParticipants.slice(0, teamSize).join('\n'),
					true
				)
				.addField(
					t('create_queue.embeds.queue.fields.team_2.name'),
					parsedParticipants.slice(teamSize, teamSize * 2).join('\n'),
					true
				)
				.setFooter({
					text: t('create_queue.embeds.queue.footer'),
					iconURL: Images.icons.tip,
				});
		}

		function generateButtons() {
			const joinBtn = new MessageButton()
				.setCustomId('join')
				.setStyle('SUCCESS')
				.setLabel(t('create_queue.buttons.join', { amount: participants.filter(Boolean).length, max: teamSize }))
				.setEmoji(Emojis.join);

			const leftBtn = new MessageButton()
				.setCustomId('left')
				.setStyle('SECONDARY')
				.setLabel(t('create_queue.buttons.left'))
				.setEmoji(Emojis.left);

			const destroyBtn = new MessageButton()
				.setCustomId('destroy')
				.setStyle('DANGER')
				.setLabel(t('create_queue.buttons.destroy'));

			return new MessageActionRow().addComponents([joinBtn, leftBtn, destroyBtn]);
		}
	}
}
