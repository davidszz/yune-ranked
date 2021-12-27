import type { Bot } from '@client'

interface LoaderOptions {
  preLoad: boolean
}

export abstract class Loader {
  preLoad: boolean
  abstract initialize(): void | Promise<void>

  constructor(public client: Bot, options: LoaderOptions) {
    this.preLoad = options.preLoad
  }
}
