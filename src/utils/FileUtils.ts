import path from 'path';

export class FileUtils {
	static get rootPath() {
		return path.dirname(require.main.filename);
	}

	static resolve(...pathSegments: string[]) {
		return path.resolve(...pathSegments);
	}
}
