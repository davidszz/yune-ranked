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
import { EventEmitter } from 'events';
import type { TFunction } from 'i18next';

interface IConfirmationEmbedData {
	users: User[];
	confirmed?: string[];
	target: CommandInteraction | Message | TextBasedChannel;
	embed: Embed;
	replyTo?: string;
	t: TFunction;
}

export class ConfirmationEmbed extends EventEmitter {
	users: User[];
	confirmed: string[];
	target: CommandInteraction | Message | TextBasedChannel;
	embed: Embed;
	replyTo?: string;
	t: TFunction;

	on: (event: 'confirm', listener: (user: User, isLast: boolean) => void) => this;

	constructor(data: IConfirmationEmbedData) {
		super();

		this.users = data.users;
		this.target = data.target;
		this.embed = data.embed;
		this.replyTo = data.replyTo;
		this.t = data.t;

		this.confirmed = data.confirmed ?? [];
	}

	async awaitConfirmation(duration = 60000) {
		const reply = await (() => {
			if (this.target instanceof Message) {
				return this.target.edit({
					embeds: [this.embed],
					components: [this.generateButtons()],
				});
			}
			if (this.target instanceof CommandInteraction) {
				return this.target.editReply({
					embeds: [this.embed],
					components: [this.generateButtons()],
				});
			}

			return this.target.send({
				embeds: [this.embed],
				components: [this.generateButtons()],
				...(this.replyTo ? { reply: { messageReference: this.replyTo } } : {}),
			});
		})();

		const collector = new InteractionCollector<ButtonInteraction>(this.target.client, {
			interactionType: InteractionType.MessageComponent,
			componentType: ComponentType.Button,
			filter: (i) => this.users.some((x) => x.id === i.user.id),
			message: reply,
			time: duration,
		});

		return new Promise<string[]>((resolve, reject) => {
			collector.on('collect', async (i) => {
				if (this.confirmed.includes(i.user.id)) {
					await i.reply({
						content: this.t('misc:confirmation_embed.errors.already_confirmed'),
						ephemeral: true,
					});
					return;
				}

				if (i.customId !== 'confirm') {
					reject(new Error('refused'));
					return;
				}

				this.emit('collect', i.user, this.confirmed.length + 1 >= this.users.length);

				this.confirmed.push(i.user.id);
				if (this.confirmed.length >= this.users.length) {
					resolve(this.confirmed);
					collector.stop('finalized');
					return;
				}
				await i.reply({
					content: this.t('misc:confirmation_embed.confirmed'),
					ephemeral: true,
				});

				if (reply instanceof Message) {
					await reply.edit({
						components: [this.generateButtons()],
					});
				}
			});

			collector.on('end', (_, reason) => {
				if (reason !== 'finalized') {
					reject(new Error(reason));
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
			.catch((err) => {
				if (reply instanceof Message) {
					reply.delete().catch(() => {
						// Nothing
					});
				}
				throw new Error(err);
			});
	}

	private generateButtons() {
		const confirmBtn = new ButtonComponent()
			.setCustomId('confirm')
			.setLabel(this.t('misc:confirmation_embed.buttons.confirm'))
			.setStyle(ButtonStyle.Success);

		if (this.users.length > 1) {
			confirmBtn.setLabel(
				this.t('misc:confirmation_embed.buttons.confirm_multiple', {
					amount: this.confirmed.length,
					max: this.users.length,
				})
			);
		}

		const refuseBtn = new ButtonComponent()
			.setCustomId('refuse')
			.setLabel(this.t('misc:confirmation_embed.buttons.refuse'))
			.setStyle(ButtonStyle.Danger);

		return new ActionRow().addComponents(confirmBtn, refuseBtn);
	}
}
