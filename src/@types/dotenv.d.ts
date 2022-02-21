declare global {
	namespace NodeJS {
		interface ProcessEnv {
			MONGODB_URI: string;
			SUPPORT_GUILD_URL: string;
			NODE_ENV?: string;
		}
	}
}

export {};
