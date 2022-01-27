import { Guild } from 'discord.js';
import readdir from 'readdirp';

import { Logger } from '@services/Logger';
import { Command } from '@structures/Command';
import { Loader } from '@structures/Loader';
import { FileUtils } from '@utils/FileUtils';

export class CommandsLoader extends Loader {
	async initialize() {
		const files = readdir(FileUtils.resolve(FileUtils.rootPath, 'commands'), {
			directoryFilter: '!sub',
		});

		const status = { failed: 0, success: 0 };
		for await (const file of files) {
			if (/\.(js|ts)$/g.test(file.basename)) {
				try {
					const File = (await import(file.fullPath)).default;
					const command = new File(this.client);
					if (command instanceof Command) {
						this.client.commands.set(command.name, command);
						status.success++;
					}
				} catch (err) {
					status.failed++;
					Logger.error(`An error ocurrent on loader ${__filename} initialization:`, err);
				}
			}

			if (status.failed) {
				Logger.warn(`${status.success} commands loaded and ${status.failed} failed`);
			} else {
				Logger.success(`All ${status.success} commands loaded!`);
			}
		}

		if (!process.argv.includes('--no-deploy')) {
			Logger.info('Registering guild commands...');

			if (this.client.guild) {
				await this.registerCommands();
			} else {
				Logger.warn('Commands not registered because the bot is not in the guild.');
			}

			this.client.off('guildCreate', (guild) => this.handleGuildCreate(guild));
			this.client.on('guildCreate', (guild) => this.handleGuildCreate(guild));
		}
	}

	private async registerCommands() {
		const commands = this.client.commands.map((cmd) => cmd.data);
		try {
			await this.client.guild.commands.set(commands);
			Logger.success(`Commands have been registered successfully!`);
		} catch (err) {
			Logger.error('Failed to register the commands:', err);
		}
	}

	private async handleGuildCreate(guild: Guild) {
		if (guild.id === this.client.guildId) {
			await this.registerCommands();
		}
	}
}
