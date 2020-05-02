import { Storage } from 'storage-core'
import { S3 } from 'aws-sdk'

import { Readable, PassThrough, Writable } from 'stream'
import { AwsS3StorageOptions } from './AwsS3StorageOptions'

export class AwsS3Storage extends Storage<AwsS3StorageOptions> {
  s3: S3

  constructor(options: AwsS3StorageOptions) {
    super(options)
    this.s3 = new S3({ ...options })
  }

  getFilePaths(_?: string | undefined): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  async readFile(filePath: string): Promise<Buffer> {
    const r = await this.s3
      .getObject({ Bucket: this.options.bucket, Key: filePath })
      .promise()

    let buffer: Buffer | undefined = undefined
    if (r.Body instanceof Buffer) buffer = r.Body
    if (typeof r.Body === 'string') buffer = Buffer.from(r.Body, 'utf8')
    if (r.Body instanceof Readable) {
      const chunks = []
      for await (let chunk of r.Body) {
        chunks.push(chunk)
      }
      buffer = Buffer.concat(chunks)
    }

    if (!buffer || !r.Body)
      throw new Error('Could not convert return body to buffer.')

    return buffer
  }

  async writeFile(filePath: string, data: string | Buffer): Promise<void> {
    await this.s3
      .putObject({ Bucket: this.options.bucket, Key: filePath, Body: data })
      .promise()
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.s3
      .deleteObject({ Bucket: this.options.bucket, Key: filePath })
      .promise()
  }

  async getFileSize(filePath: string): Promise<number> {
    const r = await this.s3
      .headObject({ Bucket: this.options.bucket, Key: filePath })
      .promise()
    return r.ContentLength || 0
  }

  async createWriteStream(filePath: string): Promise<Writable> {
    const pass = new PassThrough()
    this.s3.upload({ Bucket: this.options.bucket, Key: filePath, Body: pass })
    return pass
  }

  async createReadStream(filePath: string): Promise<Readable> {
    return this.s3
      .getObject({ Bucket: this.options.bucket, Key: filePath })
      .createReadStream()
  }

  async makeDir(_: string): Promise<void> {}
}
