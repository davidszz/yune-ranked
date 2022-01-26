declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DEVELOPMENT_TOKEN: string;
		}
	}
}

export {};
