declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DEVELOPMENT_TOKEN: string;
			DEVELOPMENT_GUILD_ID: string;
			MONGODB_URI: string;
		}
	}
}

export {};
