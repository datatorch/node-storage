import { Storage, FilesReadable, ListResult } from 'storage-core'
import { S3, AWSError } from 'aws-sdk'
import pathModule from 'path'

import { Readable, PassThrough, Writable } from 'stream'
import { AwsS3StorageOptions } from './AwsS3StorageOptions'
import { PromiseResult } from 'aws-sdk/lib/request'

const formatContent = (f: S3.Object) => ({
  path: f.Key || '',
  name: pathModule.basename(f.Key || ''),
  size: f.Size,
  updatedAt: f.LastModified,
  md5Hash: f.ETag,
  isFile: true,
  raw: f as object
})

export class AwsS3Storage extends Storage<AwsS3StorageOptions> {
  s3: S3

  constructor(options: AwsS3StorageOptions) {
    super(options)
    this.s3 = new S3({ ...options })
  }

  async getTopLevel(path?: string): Promise<ListResult[]> {
    const request = await this.s3
      .listObjectsV2({
        Bucket: this.options.bucket,
        Prefix: path ? `${path}/` : '',
        Delimiter: '/'
      })
      .promise()

    const { CommonPrefixes, Contents } = request

    const dirs: ListResult[] =
      (CommonPrefixes &&
        CommonPrefixes.map(p => ({
          name: pathModule.basename(p.Prefix || ''),
          path: (p.Prefix || '').slice(0, -1),
          isFile: false,
          raw: p
        }))) ||
      []

    const files: ListResult[] =
      (Contents &&
        Contents.filter(c => c.Key && c.Key[c.Key.length - 1] !== '/').map(c =>
          formatContent(c)
        )) ||
      []

    return dirs.concat(files)
  }

  getFilesStream(path?: string): Readable {
    let request: PromiseResult<S3.ListObjectsV2Output, AWSError> | undefined
    let ContinuationToken: string | undefined

    return new FilesReadable(async () => {
      if (request && !request.IsTruncated) return null

      request = await this.s3
        .listObjectsV2({
          Bucket: this.options.bucket,
          Prefix: path,
          ContinuationToken
        })
        .promise()

      ContinuationToken = request.NextContinuationToken
      const contents = request.Contents
      return (
        contents &&
        contents
          .filter(c => c.Key && c.Key[c.Key.length - 1] !== '/')
          .map(f => formatContent(f))
      )
    })
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
      .putObject({
        Bucket: this.options.bucket,
        Key: filePath,
        Body: data
      })
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
    this.s3
      .upload({ Bucket: this.options.bucket, Key: filePath, Body: pass })
      .promise()
    return pass
  }

  async createReadStream(filePath: string): Promise<Readable> {
    return this.s3
      .getObject({ Bucket: this.options.bucket, Key: filePath })
      .createReadStream()
  }

  async makeDir(_: string): Promise<void> {}
}
