import * as fs from 'fs'

import pathModule from 'path'
import globby from 'globby'

import { PathAbs, Storage, StorageOptions } from './Storage'
import { FilesTransform } from './utils'
import { Readable } from 'stream'
import { ListResult } from './Files'

export interface LocalStorageOptions extends StorageOptions {
  path: string
}

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

  @PathAbs()
  async getTopLevel(path?: string): Promise<ListResult[]> {
    const fullPath = this.fullPath(path)
    const files: any[] = await globby(`${fullPath}/*`, {
      onlyFiles: false,
      onlyDirectories: false,
      objectMode: true
    })

    const rootPath = pathModule.resolve(this.fullPath())
    const formatPath = (path: string) =>
      pathModule.resolve(path).replace(`${rootPath}/`, '')

    return files.map(f => ({
      path: formatPath(f.path),
      name: pathModule.basename(f.path),
      raw: f,
      isFile: f.dirent.isFile()
    }))
  }

  @PathAbs()
  getFilesStream(path?: string): Readable {
    const fullPath = this.fullPath(path)

    const rootPath = pathModule.resolve(this.fullPath())
    const formatPath = (path: string) =>
      pathModule.resolve(path).replace(`${rootPath}/`, '')

    const trans = new FilesTransform((f: any) => ({
      name: pathModule.basename(f.path),
      path: formatPath(f.path),
      size: f.stats.size,
      raw: f
    }))
    return globby
      .stream(`${fullPath}/**/*`, {
        objectMode: true,
        onlyFiles: true,
        stats: true
      })
      .pipe(trans)
  }

  @PathAbs()
  async getFileSize(filePath: string): Promise<number> {
    const stat = await fs.promises.stat(this.fullPath(filePath))
    return stat.size
  }

  @PathAbs()
  async readFile(filePath: string): Promise<Buffer> {
    const fullPath = this.fullPath(filePath)
    return fs.promises.readFile(fullPath)
  }

  @PathAbs()
  async writeFile(filePath: string, data: string | Buffer): Promise<void> {
    await this.makeDir(filePath)
    const fullPath = this.fullPath(filePath)
    await fs.promises.writeFile(fullPath, data)
  }

  @PathAbs()
  async deleteFile(filePath: string): Promise<void> {
    await fs.promises.unlink(this.fullPath(filePath))
  }

  @PathAbs()
  async makeDir(path: string) {
    const dir = pathModule.dirname(path)
    await fs.promises.mkdir(this.fullPath(dir), { recursive: true })
  }

  @PathAbs()
  async createWriteStream(path: string) {
    await this.makeDir(path)
    return fs.createWriteStream(this.fullPath(path))
  }

  @PathAbs()
  async createReadStream(path: string, options?: any) {
    return fs.createReadStream(this.fullPath(path), options)
  }

  @PathAbs()
  fullPath(path?: string): string {
    return path ? pathModule.join(this.options.path, path) : this.options.path
  }
}
