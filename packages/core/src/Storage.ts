import { Readable, Writable } from 'stream'
import { ListResult } from './Files'
export interface StorageOptions {}

export abstract class Storage<O extends StorageOptions = any> {
  public readonly options: O

  constructor(options: O) {
    this.options = options
  }

  abstract getTopLevel(path?: string): Promise<ListResult[]>

  abstract getFilesStream(path?: string): Readable

  abstract readFile(filePath: string): Promise<Buffer>

  abstract writeFile(filePath: string, data: string | Buffer): Promise<void>

  abstract deleteFile(filePath: string): Promise<void>

  abstract getFileSize(filePath: string): Promise<number>

  abstract createWriteStream(filePath: string): Promise<Writable>

  abstract createReadStream(filePath: string): Promise<Readable>

  abstract makeDir(path: string): Promise<void>
}
