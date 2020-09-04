import { Storage, FilesReadable, PathAbs, StorageOptions } from 'storage-core'
import pathModule from 'path'
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'
import { Readable, PassThrough } from 'stream'
import { ListResult } from 'storage-core'
import {
  AzureStorageAccount,
  AzureStorageAccountOptions
} from './AzureStorageAccount'

export interface AzureBlobStorageOptions
  extends StorageOptions,
    AzureStorageAccountOptions {
  container: string
}

export class AzureBlobStorage extends Storage<AzureBlobStorageOptions> {
  blobClient: BlobServiceClient
  containerClient: ContainerClient

  constructor(
    options: AzureBlobStorageOptions,
    provider?: AzureStorageAccount
  ) {
    super(options)

    this.blobClient = (provider || new AzureStorageAccount(options)).blobClient
    this.containerClient = this.blobClient.getContainerClient(options.container)
  }

  @PathAbs()
  async getTopLevel(path?: string): Promise<ListResult[]> {
    const iterator = this.containerClient
      .listBlobsByHierarchy('/', { prefix: path ? `${path}/` : '' })
      .byPage({ maxPageSize: 1000 })

    const { value } = await iterator.next()
    const { blobItems, blobPrefixes } = value.segment

    const dirs: ListResult[] = blobPrefixes.map((b: any) => ({
      name: pathModule.basename(b.name),
      path: b.name.slice(0, -1),
      isFile: false,
      raw: b
    }))
    const files: ListResult[] = blobItems.map((b: any) => ({
      name: pathModule.basename(b.name),
      path: b.name,
      size: b.properties.contentLength,
      createdAt: b.properties.createdOn,
      lastModified: b.properties.lastModified,
      isFile: true,
      raw: b
    }))

    return dirs.concat(files)
  }

  @PathAbs()
  async getFileSize(path: string): Promise<number> {
    const props = await this.containerClient
      .getBlockBlobClient(path)
      .getProperties()
    return props.contentLength || 0
  }

  @PathAbs()
  getFilesStream(path?: string | undefined): Readable {
    let iterator = this.containerClient.listBlobsFlat({ prefix: path })
    return new FilesReadable(async () => {
      const { value } = await iterator.next()
      return (
        value && [
          {
            path: value.name,
            name: value.name,
            size: value.properties.contentLength,
            createdAt: value.properties.createdOn,
            lastModified: value.properties.lastModified,
            raw: value
          }
        ]
      )
    })
  }

  @PathAbs()
  readFile(filePath: string): Promise<Buffer> {
    return this.containerClient.getBlockBlobClient(filePath).downloadToBuffer()
  }

  @PathAbs()
  async writeFile(filePath: string, data: string | Buffer): Promise<void> {
    await this.containerClient
      .getBlockBlobClient(filePath)
      .upload(data, data.length)
  }

  @PathAbs()
  async deleteFile(filePath: string): Promise<void> {
    await this.containerClient.getBlockBlobClient(filePath).delete()
  }

  @PathAbs()
  async createWriteStream(filePath: string) {
    // Failed if file is not already created
    await this.writeFile(filePath, '')

    const stream = new PassThrough()
    this.containerClient.getBlockBlobClient(filePath).uploadStream(stream)
    return stream
  }

  @PathAbs()
  async createReadStream(filePath: string) {
    const download = await this.containerClient
      .getBlockBlobClient(filePath)
      .download()
    const stream = download.readableStreamBody
    if (!stream) throw new Error('Readable stream is undefined.')
    return stream as Readable
  }

  async makeDir(_: string): Promise<void> {}
}
