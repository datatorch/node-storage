import { Readable } from 'stream'

export interface StorageOptions {}

export abstract class Storage<O extends StorageOptions = any> {
  public readonly options: O

  constructor(options: O) {
    this.options = options
  }

  /**
   * Returns all files in storage
   */
  abstract getFilePaths(path?: string): Promise<string[]>

  abstract readFile(filePath: string): Promise<Buffer>

  abstract writeFile(filePath: string, data: string | Buffer): Promise<void>

  abstract deleteFile(filePath: string): Promise<void>

  abstract getFileSize(filePath: string): Promise<number>

  abstract createWriteStream(
    filePath: string,
    options?: { stream?: Readable }
  ): Promise<Readable>

  abstract createReadStream(filePath: string): Promise<Readable>

  abstract makeDir(path: string): Promise<void>
}
