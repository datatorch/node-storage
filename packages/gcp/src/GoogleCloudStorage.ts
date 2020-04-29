import { ReadStream, WriteStream } from 'fs'
import { Storage } from 'storage-core'
import {
  Storage as GoogleStorage,
  Bucket as GoogleBucket,
  CreateReadStreamOptions,
  CreateWriteStreamOptions
} from '@google-cloud/storage'

import { GoogleCloudStorageOptions } from './GoogleCloudStorageOptions'

export class GoogleCloudStorage extends Storage<GoogleCloudStorageOptions> {
  googleStorage: GoogleStorage
  bucket: GoogleBucket

  constructor(options: GoogleCloudStorageOptions) {
    super(options)
    this.googleStorage = new GoogleStorage(this.options)
    const { bucket } = this.options
    this.bucket = this.googleStorage.bucket(bucket)
  }

  async initialize(): Promise<void> {}
  async terminate(): Promise<void> {}

  async getFilePaths(path?: string | undefined): Promise<string[]> {
    const [files] = await this.bucket.getFiles({
      directory: path
    })
    return files.map(f => f.name)
  }

  getSize(_path?: string | undefined): Promise<number> {
    throw new Error('Method not implemented.')
  }

  async readFile(filePath: string): Promise<Buffer> {
    const [buffer] = await this.bucket.file(filePath).download()
    return buffer
  }

  async writeFile(filePath: string, data: string | Buffer): Promise<void> {
    await this.bucket.file(filePath).save(data)
  }

  async deleteFile(_filePath: string): Promise<void> {
    await this.bucket.file(name).delete()
  }

  createWriteStream(
    filePath: string,
    options?: CreateWriteStreamOptions
  ): WriteStream {
    return this.bucket.file(filePath).createWriteStream(options) as WriteStream
  }

  createReadStream(
    filePath: string,
    options?: CreateReadStreamOptions
  ): ReadStream {
    const file = this.bucket.file(filePath)
    return file.createReadStream(options) as ReadStream
  }

  async makeDir(_path: string): Promise<void> {}
}
