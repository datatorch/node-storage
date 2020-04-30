import { Storage } from 'storage-core'
import {
  Storage as GoogleStorage,
  Bucket as GoogleBucket,
  CreateReadStreamOptions,
  CreateWriteStreamOptions
} from '@google-cloud/storage'

import { GoogleCloudStorageOptions } from './GoogleCloudStorageOptions'
import { Readable } from 'stream'

export class GoogleCloudStorage extends Storage<GoogleCloudStorageOptions> {
  googleStorage: GoogleStorage
  bucket: GoogleBucket

  constructor(options: GoogleCloudStorageOptions) {
    super(options)
    this.googleStorage = new GoogleStorage(this.options)
    const { bucket } = this.options
    this.bucket = this.googleStorage.bucket(bucket)
  }

  async getFilePaths(path?: string | undefined): Promise<string[]> {
    const [files] = await this.bucket.getFiles({
      directory: path
    })
    return files.map(f => f.name)
  }

  async getFileSize(filePath: string): Promise<number> {
    const stat = (await this.bucket.file(filePath).getMetadata()).find(r => r)
    return stat?.size || 0
  }

  async readFile(filePath: string): Promise<Buffer> {
    const [buffer] = await this.bucket.file(filePath).download()
    return buffer
  }

  async writeFile(filePath: string, data: string | Buffer): Promise<void> {
    await this.bucket.file(filePath).save(data)
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.bucket.file(filePath).delete()
  }

  async createWriteStream(
    filePath: string,
    options?: { stream?: Readable } & CreateWriteStreamOptions
  ) {
    const stream = (options && options.stream) || new Readable()
    delete options?.stream
    const write = this.bucket.file(filePath).createWriteStream(options)
    stream.pipe(write)
    return stream
  }

  async createReadStream(filePath: string, options?: CreateReadStreamOptions) {
    const file = this.bucket.file(filePath)
    return file.createReadStream(options)
  }

  async makeDir(_path: string): Promise<void> {}
}
