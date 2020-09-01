import {
  BlobServiceClient,
  StorageSharedKeyCredential
} from '@azure/storage-blob'
import { StorageProvider } from 'storage-core'
import { AzureBlobStorage } from './AzureBlobStorage'

export interface AzureStorageAccountOptions {
  accountName: string
  accountKey: string
  endpoint?: string
}

export class AzureStorageAccount extends StorageProvider<AzureBlobStorage> {
  blobClient: BlobServiceClient

  constructor(private options: AzureStorageAccountOptions) {
    super()

    const credentials = new StorageSharedKeyCredential(
      options.accountName,
      options.accountKey
    )
    this.blobClient = new BlobServiceClient(
      options.endpoint ||
        `https://${options.accountName}.blob.core.windows.net`,
      credentials
    )
  }

  getStorage(name: string) {
    return new Promise<AzureBlobStorage>(resolve =>
      resolve(new AzureBlobStorage({ ...this.options, container: name }))
    )
  }

  async createStorage(name: string) {
    const container = await this.blobClient.createContainer(name)
    const storage = new AzureBlobStorage({ ...this.options, container: name })
    storage.containerClient = container.containerClient
    return storage
  }

  deleteStorage(name: string) {
    return this.blobClient.deleteContainer(name)
  }
}
