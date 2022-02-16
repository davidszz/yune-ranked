import type { User } from 'discord.js';
import { TFunction } from 'i18next';

import { Ranks, UserRank } from '@utils/Constants';

import { BaseCanvas } from '../BaseCanvas';

interface IMatchStartUser {
	user: User;
	rank: UserRank;
}

export class MatchStartTemplate extends BaseCanvas<IMatchStartUser[]> {
	constructor(t: TFunction, data: IMatchStartUser[]) {
		super(t, 32, 0);
		this.data = data;
	}

	async build() {
		const users = await Promise.all(
			this.data.map(({ user, rank }) =>
				this.createUser({
					username: user.username,
					avatar: user.displayAvatarURL({ format: 'jpg' }),
					rank,
				})
			)
		);

		const chunkLength = Math.ceil(Math.max(this.data.length / 2, 1));

		const team1Width = users.slice(0, chunkLength).reduce((prev, next) => (next.width > prev ? next.width : prev), 0);
		this.width =
			team1Width +
			users.slice(chunkLength, this.data.length).reduce((prev, next) => (next.width > prev ? next.width : prev), 0) +
			24;

		this.height = users.slice(0, chunkLength).reduce((acc, val) => acc + val.height + 8, 0) + 24;

		this.ctx.beginPath();
		this.ctx.fillStyle = '#5c82ff';
		this.setFont('bold 12px Poppins');
		this.fillText({
			text: this.t('create_queue.canvas.team_blue'),
			x: 0,
			y: 0,
			verticalAlign: 'top',
		});

		this.ctx.fillStyle = '#ff5c5c';
		this.fillText({
			text: this.t('create_queue.canvas.team_red'),
			x: team1Width + 24,
			y: 0,
			verticalAlign: 'top',
		});
		this.ctx.closePath();

		for (let i = 0; i < chunkLength; i++) {
			this.ctx.drawImage(users[i], 0, 24 + users.slice(0, i).reduce((acc, val) => acc + val.height + 8, 0));
		}

		for (let i = chunkLength; i < this.data.length; i++) {
			this.ctx.drawImage(
				users[i],
				team1Width + 24,
				24 + users.slice(chunkLength, i).reduce((acc, val) => acc + val.height + 8, 0)
			);
		}

		return this.toBuffer();
	}

	private async createUser(data: { username: string; avatar: string; rank: UserRank }) {
		const canvas = this.createCanvas(0, 32);
		const padding = 6;

		const userRank = Ranks[data.rank];
		const rankName = this.t(`misc:ranks.names.${userRank.name}`);

		canvas.setFont('bold 14px Poppins');
		const usernameWidth = canvas.measureText(data.username).width;

		canvas.setFont('10px Montserrat');
		const rankWidth = canvas.measureText(rankName).width + 16 + 2;

		canvas.width = Math.max(usernameWidth, rankWidth) + 32 + padding;

		await canvas.drawRoundedImage({
			image: data.avatar,
			size: 32,
			x: 0,
			y: 0,
		});

		canvas.ctx.fillStyle = '#ffffff';
		canvas.setFont('bold 14px Poppins');

		canvas.fillText({
			text: data.username,
			x: 32 + padding,
			y: 7,
			verticalAlign: 'middle',
		});

		const rankAsset = userRank.assets.badge;
		if (rankAsset) {
			const rankBadge = await this.loadImage(rankAsset);
			if (rankBadge) {
				canvas.ctx.drawImage(rankBadge, 32 + padding, canvas.height - 16, 16, 16);
			}
		}

		canvas.setFont('10px Montserrat');
		canvas.fillText({
			text: rankName,
			x: 32 + padding + 16 + 2,
			y: canvas.height - 16 / 2,
			verticalAlign: 'middle',
		});

		return canvas;
	}
}
