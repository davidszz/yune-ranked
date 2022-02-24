declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV?: string;
			MONGODB_URI: string;
			SUPPORT_GUILD_URL: string;
			IMGUR_CLIENT_ID: string;
			IMGUR_CLIENT_SECRET: string;
			IMGUR_REFRESH_TOKEN: string;
		}
	}
}

export {};
