import { Storage } from 'storage-core'
import {
  Storage as GoogleStorage,
  Bucket as GoogleBucket,
  CreateReadStreamOptions,
  CreateWriteStreamOptions,
  StorageOptions
} from '@google-cloud/storage'

import { GcpBucketStorageOptions } from './GcpBucketStorageOptions'

export class GcpBucketStorage extends Storage<GcpBucketStorageOptions> {
  googleStorage: GoogleStorage
  bucket: GoogleBucket

  constructor(options: GcpBucketStorageOptions) {
    super(options)

    const gcpOptions: StorageOptions = {
      ...options,
      credentials: {
        client_email: options.clientEmail,
        private_key: options.privateKey
      }
    }

    console.log(gcpOptions)

    this.googleStorage = new GoogleStorage(gcpOptions)

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
    return (stat && stat.size) || 0
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
    options?: CreateWriteStreamOptions
  ) {
    return this.bucket.file(filePath).createWriteStream(options)
  }

  async createReadStream(filePath: string, options?: CreateReadStreamOptions) {
    const file = this.bucket.file(filePath)
    return file.createReadStream(options)
  }

  async makeDir(_path: string): Promise<void> {}
}
