import * as fs from 'fs'

import pathModule from 'path'
import globby from 'globby'

import { Storage } from './Storage'
import { LocalStorageOptions } from './LocalStorageOptions'
import { Readable } from 'stream'

export class LocalStorage extends Storage<LocalStorageOptions> {
  constructor(options: LocalStorageOptions) {
    super(options)
    this.initialize()
  }

  async initialize(): Promise<void> {
    const [, folder] = await Promise.all([
      fs.promises.access(
        this.options.path,
        fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK
      ),
      fs.promises.lstat(this.options.path)
    ])
    if (!folder.isDirectory()) throw new Error('Path is not a directory')
  }

  async terminate(): Promise<void> {}

  async getFilePaths(path?: string): Promise<string[]> {
    const fullPath = this.fullPath(path)
    return globby(`${fullPath}/**/*`, { onlyFiles: true })
  }

  async getFileSize(filePath: string): Promise<number> {
    const stat = await fs.promises.stat(this.fullPath(filePath))
    return stat.size
  }

  async readFile(filePath: string): Promise<Buffer> {
    const fullPath = this.fullPath(filePath)
    return fs.promises.readFile(fullPath)
  }

  async writeFile(filePath: string, data: string | Buffer): Promise<void> {
    await this.makeDir(filePath)
    const fullPath = this.fullPath(filePath)
    await fs.promises.writeFile(fullPath, data)
  }

  async deleteFile(filePath: string): Promise<void> {
    await fs.promises.unlink(this.fullPath(filePath))
  }

  async makeDir(path: string) {
    const dir = pathModule.dirname(path)
    await fs.promises.mkdir(this.fullPath(dir), { recursive: true })
  }

  async createWriteStream(path: string, options: { stream?: Readable }) {
    const stream = options?.stream || new Readable()
    await this.makeDir(path)
    stream.pipe(fs.createWriteStream(this.fullPath(path)))
    return stream
  }

  async createReadStream(path: string, options?: any) {
    return fs.createReadStream(this.fullPath(path), options)
  }

  fullPath(path?: string): string {
    return path ? pathModule.join(this.options.path, path) : this.options.path
  }
}
