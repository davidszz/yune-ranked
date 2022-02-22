import type { User } from 'discord.js';
import type { TFunction } from 'i18next';

import type { IMemberSchema } from '@database/schemas/MemberSchema';
import { Assets } from '@utils/Constants';
import { Ranks } from '@utils/Ranks';
import { UserRank } from '@utils/UserRank';

import { BaseCanvas } from '../BaseCanvas';

interface IMemberData {
	user: User;
	data: IMemberSchema;
}

export class ProfileTemplate extends BaseCanvas<IMemberData> {
	constructor(t: TFunction, data: IMemberData) {
		super(t, 1200, 800);
		this.data = data;
	}

	async build() {
		this.roundRect({
			height: this.height,
			width: this.width,
			radius: 16,
			x: 0,
			y: 0,
		});

		const { user, data } = this.data;

		const { ctx } = this;
		ctx.clip();

		ctx.beginPath();
		ctx.fillStyle = '#13131a';
		ctx.rect(0, 0, this.width, this.height);
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.fillStyle =
			(await user
				.fetch(true)
				.then((res) => res.hexAccentColor)
				.catch<null>(() => null)) ?? '#0084ff';
		ctx.rect(0, 0, this.width, 300);
		ctx.fill();
		ctx.closePath();

		/**
		 * Draws the user avatar
		 */
		ctx.beginPath();
		ctx.fillStyle = '#13131a';
		this.roundRect({
			height: 256 + 16 * 2,
			width: 256 + 16 * 2,
			x: 70 - 16,
			y: 300 - 256 / 2 - 16,
			radius: 256 + 16 * 2,
		});
		ctx.fill();
		ctx.closePath();

		await this.drawRoundedImage({
			image: user.displayAvatarURL({ extension: 'png', size: 256 }),
			size: 256,
			x: 70,
			y: 300 - 256 / 2,
		});

		/**
		 * Draws the username
		 */
		ctx.beginPath();
		ctx.fillStyle = '#ffffff';
		this.setFont('bold 42px "Poppins"');
		const measuredUsername = this.fillText({
			text: user.username,
			x: 70,
			y: 300 + 256 / 2 + 64,
		});

		ctx.fillStyle = '#757575';
		this.setFont('36px "Poppins"');
		this.fillText({
			text: `#${user.discriminator}`,
			x: 70 + measuredUsername.width + 4,
			y: 300 + 256 / 2 + 64,
		});
		ctx.closePath();

		/**
		 * Draw user status: wins, loses and mvp
		 */
		const mvpIcon = await this.loadImage(Assets.images('icons/mvp.png'));
		const winsIcon = await this.loadImage(Assets.images('icons/wins.png'));
		const losesIcon = await this.loadImage(Assets.images('icons/loses.png'));

		ctx.drawImage(winsIcon, 70, 300 + 256 / 2 + 32 + 82);
		ctx.drawImage(losesIcon, 70 + 148, 300 + 256 / 2 + 32 + 82);
		ctx.drawImage(mvpIcon, 70 + 148 * 2, 300 + 256 / 2 + 32 + 82);

		ctx.beginPath();
		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'center';
		this.setFont('bold 30px "Montserrat"');

		this.fillText({
			text: data.wins.toString(),
			x: 70 + 24,
			y: 300 + 256 / 2 + 32 + 82 + 48 + 16,
			verticalAlign: 'top',
		});

		this.fillText({
			text: data.loses.toString(),
			x: 70 + 24 + 148,
			y: 300 + 256 / 2 + 32 + 82 + 48 + 16,
			verticalAlign: 'top',
		});

		this.fillText({
			text: data.mvps.toString(),
			x: 70 + 24 + 148 * 2,
			y: 300 + 256 / 2 + 32 + 82 + 48 + 16,
			verticalAlign: 'top',
		});
		ctx.closePath();

		/**
		 * Draws user rank
		 */
		const rank = Ranks[data.rank] ?? Ranks[UserRank.Unranked];
		const regalia = await this.loadImage(rank?.assets.regalia);

		ctx.drawImage(regalia, 690, 420, 390, 390);

		ctx.beginPath();
		ctx.textAlign = 'center';
		ctx.fillStyle = '#767676';
		this.setFont('bold 18px "Montserrat"');
		this.fillText({
			text: 'RANK',
			x: 690 + 390 / 2,
			y: 440,
		});

		ctx.fillStyle = '#ffffff';
		this.setFont('bold 22px "Montserrat"');
		this.fillText({
			text: `${this.t(`misc:ranks.names.${rank.name}`).toUpperCase()}${
				rank.division ? ` ${'I'.repeat(rank.division)}` : ''
			}`,
			x: 690 + 390 / 2,
			y: 466,
		});

		if (rank.maxPdl) {
			ctx.fillStyle = '#DDDDDD';
			this.setFont('18px "Montserrat"');
			this.fillText({
				text: `${data.pdl} PDL${data.pdl > 1 ? 's' : ''}`,
				x: 690 + 390 / 2,
				y: 490,
			});
		}
		ctx.closePath();

		return this.toBuffer();
	}
}
