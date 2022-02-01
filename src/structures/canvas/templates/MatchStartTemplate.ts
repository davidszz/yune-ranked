import type { User } from 'discord.js';
import { TFunction } from 'i18next';

import { MemberRank, RankAssets } from '@utils/Constants';

import { BaseCanvas } from '../BaseCanvas';

interface IMatchStartUser {
	user: User;
	rank: string | MemberRank;
}

export class MatchStartTemplate extends BaseCanvas<IMatchStartUser[]> {
	constructor(t: TFunction, data: IMatchStartUser[]) {
		super(t, 400, Math.ceil(data.length / 2) * 35 + 42);
		this.data = data;
	}

	async build() {
		this.ctx.fillStyle = '#FFF';
		this.setFont('bold 16px Poppins');

		this.fillText({
			text: this.t('create_queue.embeds.started.fields.team_1.name'),
			x: 0,
			y: 0,
			verticalAlign: 'top',
		});

		this.fillText({
			text: this.t('create_queue.embeds.started.fields.team_2.name'),
			x: 0 + this.width / 2,
			y: 0,
			verticalAlign: 'top',
		});

		for (let i = 0; i < this.data.length; i++) {
			const { user, rank } = this.data[i];

			const x = i < Math.ceil(this.data.length / 2) ? 0 : this.width / 2;
			const y = 30 + Math.floor(i % (this.data.length / 2)) * 40;

			await this.drawUser({
				avatar: user.displayAvatarURL({ format: 'png' }),
				username: user.username,
				rank,
				x,
				y,
			});
		}

		return this.toBuffer();
	}

	private async drawUser(options: { x: number; y: number; username: string; avatar: string; rank: string }) {
		this.ctx.beginPath();

		await this.drawRoundedImage({ image: options.avatar, size: 26, x: options.x, y: options.y });

		this.ctx.fillStyle = '#FFFFFF';
		this.setFont('bold 12px "Montserrat"');
		this.fillText({
			text: options.username.slice(0, 16),
			x: options.x + 24 + 8,
			y: options.y + 1,
			verticalAlign: 'top',
		});

		const rankAssets = RankAssets[options.rank as keyof typeof RankAssets];
		const badge = await this.loadImage(rankAssets.badge);
		if (badge) {
			this.ctx.drawImage(badge, options.x + 24 + 8, options.y + 13, 15, 15);
		}

		this.setFont('10px "Montserrat"');
		this.fillText({
			text: this.t(`misc:ranks.names.${options.rank}`),
			x: options.x + 24 + 8 + (badge ? 18 : 0),
			y: options.y + 24,
			verticalAlign: 'bottom',
		});

		this.ctx.closePath();
	}
}
