import { Storage } from 'storage-core'
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  ContainerClient
} from '@azure/storage-blob'
import { AzureBlobStorageOptions } from './AzureBlobStorageOptions'
import { Readable } from 'stream'

export class AzureBlobStorage extends Storage<AzureBlobStorageOptions> {
  blobClient: BlobServiceClient
  containerClient: ContainerClient

  constructor(options: AzureBlobStorageOptions) {
    super(options)
    const credentials = new StorageSharedKeyCredential(
      options.accountName,
      options.accountKey
    )
    this.blobClient = new BlobServiceClient(
      `https://${options.accountName}.blob.core.windows.net`,
      credentials
    )
    this.containerClient = this.blobClient.getContainerClient(options.container)
  }

  async initialize(): Promise<void> {}

  async terminate(): Promise<void> {}

  async getFileSize(path: string): Promise<number> {
    const props = await this.containerClient
      .getBlockBlobClient(path)
      .getProperties()
    return props.contentLength || 0
  }

  getFilePaths(_?: string | undefined): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  readFile(filePath: string): Promise<Buffer> {
    return this.containerClient.getBlockBlobClient(filePath).downloadToBuffer()
  }

  async writeFile(filePath: string, data: string | Buffer): Promise<void> {
    await this.containerClient
      .getBlockBlobClient(filePath)
      .upload(data, data.length)
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.containerClient.getBlockBlobClient(filePath).delete()
  }

  async createWriteStream(filePath: string, options?: { stream?: Readable }) {
    const stream = (options && options.stream) || new Readable()
    this.containerClient.getBlockBlobClient(filePath).uploadStream(stream)
    return stream
  }

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
