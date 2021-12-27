import path from 'path'

export class FileUtils {
  static get rootDir(): string {
    return path.dirname(require.main.filename)
  }
}
