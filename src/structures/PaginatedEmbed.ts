import {
	BaseCommandInteraction,
	ButtonInteraction,
	Channel,
	InteractionCollector,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	TextBasedChannel,
	User,
} from 'discord.js';
import i18next, { StringMap, TFunction, TOptions } from 'i18next';

import { YuneEmbed } from './YuneEmbed';

interface IValue<T> {
	id: any;
	value: T;
}

interface IPaginatedEmbedData<T> {
	author?: User;
	locale?: string;
	target: Message | TextBasedChannel | BaseCommandInteraction;
	values: IValue<T>[];
	limit?: number;
	template?: MessageEmbed;
	deletable?: boolean;
	rollback?: boolean;
	showCurrentPageBtn?: boolean;
	ephemeral?: boolean;
	idle?: number;
	deleteOnEnd?: boolean;

	createRow: (data: IValue<T>, index: number) => Promise<string> | string;
	finalizeEmbed?: (embed: MessageEmbed) => Promise<MessageEmbed> | MessageEmbed;
}

export class PaginatedEmbed<T> {
	author?: User;
	target: Message | TextBasedChannel | BaseCommandInteraction;
	values: IValue<T>[];
	limit?: number;
	template?: MessageEmbed;
	deletable?: boolean;
	rollback?: boolean;
	showCurrentPageBtn?: boolean;
	ephemeral?: boolean;
	idle?: number;
	deleteOnEnd?: boolean;

	t: TFunction;
	currentPage: number;
	pages: number;
	collector: InteractionCollector<ButtonInteraction>;

	createRow: (data: IValue<T>, index: number) => Promise<string> | string;
	finalizeEmbed?: (embed: MessageEmbed) => Promise<MessageEmbed> | MessageEmbed;

	constructor(data: IPaginatedEmbedData<T>) {
		this.author = data.author;
		this.target = data.target;
		this.values = data.values;
		this.limit = data.limit ?? 10;
		this.template = data.template;
		this.deletable = data.deletable ?? true;
		this.rollback = !!data.rollback;
		this.showCurrentPageBtn = !!data.showCurrentPageBtn;
		this.ephemeral = !!data.ephemeral;
		this.idle = data.idle ?? 60000;
		this.deleteOnEnd = !!data.deleteOnEnd;

		this.t = ((key: string | string[], options: TOptions<StringMap>) =>
			i18next.t(key, { ...options, locale: data.locale })) as TFunction;
		this.currentPage = 1;
		this.pages = Math.ceil(this.values.length / this.limit);

		this.createRow = data.createRow;
		this.finalizeEmbed = data.finalizeEmbed;
	}

	async paginate() {
		const reply = await (async () => {
			const embed = await this.createEmbed();
			const components = this.pages > 1 ? [this.buttons()] : [];

			if (this.target instanceof Message) {
				return this.target.reply({
					embeds: [embed],
					components,
				});
			}
			if (this.target instanceof Channel) {
				return this.target.send({
					embeds: [embed],
					components,
				});
			}
			if (this.target instanceof BaseCommandInteraction) {
				if (this.target.replied || this.target.deferred) {
					return this.target.editReply({
						embeds: [embed],
						components,
					});
				}
				return this.target.reply({
					embeds: [embed],
					components,
					ephemeral: this.ephemeral,
					fetchReply: true,
				});
			}

			return null;
		})();

		if (this.pages <= 1) {
			return;
		}

		if (reply) {
			this.collector = new InteractionCollector<ButtonInteraction>(this.target.client, {
				interactionType: 'MESSAGE_COMPONENT',
				componentType: 'BUTTON',
				message: reply,
				idle: this.idle,
				filter: (i) => (this.author ? this.author.id === i.user.id : true),
			});

			const editReply = async () => {
				if (this.target instanceof BaseCommandInteraction) {
					const embed = await this.createEmbed();
					await this.target.editReply({
						embeds: [embed],
						components: [this.buttons()],
					});
				} else if (reply instanceof Message) {
					const embed = await this.createEmbed();
					await reply.edit({
						embeds: [embed],
						components: [this.buttons()],
					});
				}
			};

			this.collector.on('collect', async (interaction) => {
				if (interaction.customId === 'previous') {
					this.currentPage = this.currentPage > 1 ? this.currentPage - 1 : this.pages;
					await editReply();
					await interaction.deferUpdate().catch(() => {
						// Nothing
					});
				} else if (interaction.customId === 'next') {
					this.currentPage = this.currentPage < this.pages ? this.currentPage + 1 : 1;
					await editReply();
					await interaction.deferUpdate().catch(() => {
						// Nothing
					});
				} else if (interaction.customId === 'delete') {
					if (reply instanceof Message) {
						try {
							await reply.delete();
						} catch {
							// Nothing
						}
					}
				}
			});

			this.collector.on('end', async (_, reason) => {
				if (this.deleteOnEnd && ['time', 'idle'].includes(reason) && reply instanceof Message) {
					try {
						await reply.delete();
					} catch {
						// Nothing
					}
				}
			});
		}
	}

	private async createEmbed() {
		const embed = new YuneEmbed(this.template);

		if (!this.showCurrentPageBtn) {
			embed.setFooter({
				text: this.t('misc:paginated_embed.template.footer', {
					context: this.template?.footer?.text ? 'with_text' : null,
					text: this.template?.footer?.text,
					current_page: this.currentPage,
					pages: this.pages,
				}),
			});
		}

		const start = (this.currentPage - 1) * this.limit;
		const end = start + this.limit;

		for (let i = start; i < end; i++) {
			const value = this.values[i];
			if (!value) break;

			const row = await this.createRow(value, i);
			embed.addDescription(row);
		}

		if (this.finalizeEmbed) {
			return this.finalizeEmbed(embed);
		}

		return embed;
	}

	private buttons() {
		const previousBtn = new MessageButton()
			.setCustomId('previous')
			.setStyle('SECONDARY')
			.setLabel(this.t('misc:paginated_embed.buttons.previous'))
			.setDisabled(this.rollback ? false : this.currentPage <= 1);

		const nextBtn = new MessageButton()
			.setCustomId('next')
			.setStyle('SECONDARY')
			.setLabel(this.t('misc:paginated_embed.buttons.next'))
			.setDisabled(this.rollback ? false : this.currentPage >= this.pages);

		const actionRow = new MessageActionRow().addComponents([previousBtn, nextBtn]);

		if (
			this.deletable &&
			!(
				this.target instanceof BaseCommandInteraction &&
				(((this.target.replied || this.target.deferred) && this.target.ephemeral) || this.ephemeral)
			)
		) {
			const deleteBtn = new MessageButton()
				.setCustomId('delete')
				.setStyle('DANGER')
				.setLabel(this.t('misc:paginated_embed.buttons.delete'));

			actionRow.addComponents(deleteBtn);
		}

		if (this.showCurrentPageBtn) {
			const currentPageBtn = new MessageButton()
				.setCustomId('current_page')
				.setDisabled(true)
				.setStyle('SECONDARY')
				.setLabel(
					this.t('misc:paginated_embed.buttons.current_page', {
						current_page: this.currentPage,
						pages: this.pages,
					})
				);

			actionRow.addComponents(currentPageBtn);
		}

		return actionRow;
	}
}
