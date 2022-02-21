import {
	ActionRow,
	ButtonComponent,
	Embed,
	TextBasedChannel,
	User,
	Message,
	InteractionCollector,
	ButtonInteraction,
	CommandInteraction,
	ButtonStyle,
	InteractionType,
	ComponentType,
} from 'discord.js';
import i18next from 'i18next';

interface IConfirmationEmbedData {
	author: User;
	target: CommandInteraction | Message | TextBasedChannel;
	embed: Embed;
	replyTo?: string;
	locale: string;
}

export class ConfirmationEmbed {
	author: User;
	target: CommandInteraction | Message | TextBasedChannel;
	embed: Embed;
	replyTo?: string;
	locale: string;

	constructor(data: IConfirmationEmbedData) {
		this.author = data.author;
		this.target = data.target;
		this.embed = data.embed;
		this.replyTo = data.replyTo;
		this.locale = data.locale;
	}

	async awaitConfirmation(duration = 60000) {
		const confirmBtn = new ButtonComponent()
			.setCustomId('confirm')
			.setLabel(i18next.t('misc:confirmation_embed.buttons.confirm'))
			.setStyle(ButtonStyle.Success);

		const refuseBtn = new ButtonComponent()
			.setCustomId('refuse')
			.setLabel(i18next.t('misc:confirmation_embed.buttons.refuse'))
			.setStyle(ButtonStyle.Danger);

		try {
			const reply = await (() => {
				if (this.target instanceof Message) {
					return this.target.edit({
						embeds: [this.embed],
						components: [new ActionRow().addComponents(confirmBtn, refuseBtn)],
					});
				}
				if (this.target instanceof CommandInteraction) {
					return this.target.editReply({
						embeds: [this.embed],
						components: [new ActionRow().addComponents(confirmBtn, refuseBtn)],
					});
				}

				return this.target.send({
					embeds: [this.embed],
					components: [new ActionRow().addComponents(confirmBtn, refuseBtn)],
					...(this.replyTo ? { reply: { messageReference: this.replyTo } } : {}),
				});
			})();

			const collector = new InteractionCollector<ButtonInteraction>(this.target.client, {
				interactionType: InteractionType.MessageComponent,
				componentType: ComponentType.Button,
				filter: (i) => i.user.id === this.author.id,
				message: reply,
				max: 1,
				time: duration,
			});

			return new Promise((resolve) => {
				collector.on('collect', (i) => {
					i.deferUpdate().catch(() => {
						// Nothing
					});

					resolve(i.customId === 'confirm');
				});

				collector.on('end', (collected) => {
					if (collected?.size) {
						resolve(collected.first().customId === 'confirm');
					} else {
						resolve(false);
					}
				});
			})
				.then((res) => {
					if (reply instanceof Message) {
						reply.delete().catch(() => {
							// Nothing
						});
					}
					return res;
				})
				.catch(() => false);
		} catch {
			return false;
		}
	}
}
