import type { Yune } from '@client';
import { Job } from '@structures/Job';

export default class NicknameChangerJob extends Job {
	constructor(client: Yune) {
		super(client, {
			name: 'nicknameChangerJob',
			interval: 2000,
			startInstantly: true,
		});
	}

	async execute() {
		if (this.client.guild && this.client.nicknameQueue?.length) {
			const template = this.client.nicknameTemplate;
			if (template) {
				const nicknameData = this.client.nicknameQueue.shift();
				const member = await this.client.guild.members.fetch(nicknameData.userId).catch(() => {
					// Nothing
				});

				if (member) {
					const newNickname = template
						.replace(/{rank}/gi, nicknameData.rank.toString())
						.replace(/{username}/gi, member.user.username);

					if (newNickname && member.nickname !== newNickname) {
						try {
							await member.setNickname(newNickname);
						} catch {
							// Nothing
						}
					}
				} else {
					await this.execute();
				}
			}
		}
	}
}
