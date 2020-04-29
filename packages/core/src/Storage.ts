import { WriteStream, ReadStream } from 'fs'
import { StorageOptions } from './StorageOptions'

export abstract class Storage<O extends StorageOptions> {
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
  abstract async initialize(): Promise<void>

  /**
   * Terminate storage setup and releases all resources
   *
   * @remarks
   * Typically used to terminate connections
   */
  abstract async terminate(): Promise<void>

  /**
   * Returns all files in storage
   */
  abstract async getFilePaths(path?: string): Promise<string[]>

  abstract async readFile(filePath: string): Promise<Buffer>

  abstract async writeFile(
    filePath: string,
    data: string | Buffer
  ): Promise<void>

  abstract async deleteFile(filePath: string): Promise<void>

  abstract createWriteStream(filePath: string, options?: any): WriteStream

  abstract createReadStream(filePath: string, options?: any): ReadStream

  abstract makeDir(path: string): Promise<void>
}
