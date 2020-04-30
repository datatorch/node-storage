import { Readable } from 'stream'
import { StorageOptions } from './StorageOptions'

export abstract class Storage<O extends StorageOptions = any> {
  public readonly options: O

  constructor(options: O) {
    this.options = options
  }

  /**
   * Performs initialization to the storage type.
   *
   * @remarks
   * Typically used to check for permissions and/or validate connection
   */
  abstract initialize(): Promise<void>

  /**
   * Terminate storage setup and releases all resources
   *
   * @remarks
   * Typically used to terminate connections
   */
  abstract terminate(): Promise<void>

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
