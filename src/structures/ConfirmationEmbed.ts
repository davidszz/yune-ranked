import {
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	TextBasedChannel,
	User,
	Message,
	BaseCommandInteraction,
	InteractionCollector,
	ButtonInteraction,
} from 'discord.js';
import i18next from 'i18next';

interface IConfirmationEmbedData {
	author: User;
	target: BaseCommandInteraction | Message | TextBasedChannel;
	embed: MessageEmbed;
	replyTo?: string;
	locale: string;
}

export class ConfirmationEmbed {
	author: User;
	target: BaseCommandInteraction | Message | TextBasedChannel;
	embed: MessageEmbed;
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
		const confirmBtn = new MessageButton()
			.setCustomId('confirm')
			.setLabel(i18next.t('misc:confirmation_embed.buttons.confirm'))
			.setStyle('SUCCESS');

		const refuseBtn = new MessageButton()
			.setCustomId('refuse')
			.setLabel(i18next.t('misc:confirmation_embed.buttons.refuse'))
			.setStyle('DANGER');

		try {
			const reply = await (() => {
				if (this.target instanceof Message) {
					return this.target.edit({
						embeds: [this.embed],
						components: [new MessageActionRow().addComponents([confirmBtn, refuseBtn])],
					});
				}
				if (this.target instanceof BaseCommandInteraction) {
					return this.target.editReply({
						embeds: [this.embed],
						components: [new MessageActionRow().addComponents([confirmBtn, refuseBtn])],
					});
				}

				return this.target.send({
					embeds: [this.embed],
					components: [new MessageActionRow().addComponents([confirmBtn, refuseBtn])],
					...(this.replyTo ? { reply: { messageReference: this.replyTo } } : {}),
				});
			})();

			const collector = new InteractionCollector<ButtonInteraction>(this.target.client, {
				interactionType: 'MESSAGE_COMPONENT',
				componentType: 'BUTTON',
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
