import { StorageOptions } from 'storage-core'

export interface AzureBlobStorageOptions extends StorageOptions {
  container: string
  accountName: string
  accountKey: string
  endpoint?: string
}
