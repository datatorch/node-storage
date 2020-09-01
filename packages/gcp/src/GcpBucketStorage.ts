import { Storage, FilesTransform, ListResult, PathAbs } from 'storage-core'
import pathModule from 'path'

import {
  Storage as GoogleStorage,
  Bucket as GoogleBucket,
  CreateReadStreamOptions,
  CreateWriteStreamOptions,
  StorageOptions,
  File
} from '@google-cloud/storage'

import { GcpBucketStorageOptions } from './GcpBucketStorageOptions'
import { Readable, Writable } from 'stream'

const formatFile = (f: File) => ({
  name: pathModule.basename(f.name),
  path: f.name,
  size: f.metadata.size,
  md5Hash: f.metadata.md5Hash,
  createdAt: new Date(f.metadata.timeCreated),
  updatedAt: new Date(f.metadata.updated),
  isFile: true,
  raw: f.metadata
})

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

    this.googleStorage = new GoogleStorage(gcpOptions)

    const { bucket } = this.options
    this.bucket = this.googleStorage.bucket(bucket)
  }

  @PathAbs()
  getTopLevel(path?: string): Promise<ListResult[]> {
    return new Promise((resolve, reject) => {
      this.bucket.getFiles(
        {
          autoPaginate: false,
          directory: path,
          delimiter: '/'
        },
        (err, files, _, { prefixes } = {}) => {
          if (err) reject(err)

          const dirs: ListResult[] = (prefixes || []).map((d: string) => ({
            name: pathModule.basename(d),
            path: d.slice(0, -1),
            isFile: false,
            raw: d
          }))
          const f: ListResult[] = (files || []).map(formatFile)

          resolve(dirs.concat(f))
        }
      )
    })
  }

  @PathAbs()
  async getFiles(path?: string): Promise<string[]> {
    const [files] = await this.bucket.getFiles({ directory: path })
    return files.map(f => f.name)
  }

  @PathAbs()
  getFilesStream(path?: string): Readable {
    const trans = new FilesTransform(formatFile)
    return this.bucket.getFilesStream({ directory: path }).pipe(trans)
  }

  @PathAbs()
  async getFileSize(filePath: string): Promise<number> {
    const stat = (await this.bucket.file(filePath).getMetadata()).find(r => r)
    return (stat && stat.size) || 0
  }

  @PathAbs()
  async readFile(filePath: string): Promise<Buffer> {
    const [buffer] = await this.bucket.file(filePath).download()
    return buffer
  }

  @PathAbs()
  async writeFile(filePath: string, data: string | Buffer): Promise<void> {
    await this.bucket.file(filePath).save(data)
  }

  @PathAbs()
  async deleteFile(filePath: string): Promise<void> {
    await this.bucket.file(filePath).delete()
  }

  @PathAbs()
  async createWriteStream(
    filePath: string,
    options?: CreateWriteStreamOptions
  ): Promise<Writable> {
    return this.bucket.file(filePath).createWriteStream(options)
  }

  @PathAbs()
  async createReadStream(
    filePath: string,
    options?: CreateReadStreamOptions
  ): Promise<Readable> {
    const file = this.bucket.file(filePath)
    return file.createReadStream(options)
  }

  async makeDir(_path: string): Promise<void> {}
}
