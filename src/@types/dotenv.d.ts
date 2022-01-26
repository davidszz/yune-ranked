declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DEVELOPMENT_TOKEN: string;
			MONGODB_URI: string;
		}
	}
}

export {};
