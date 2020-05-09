import { StorageOptions } from 'storage-core'

export interface GcpBucketStorageOptions extends StorageOptions {
  bucket: string
  projectId?: string
  clientEmail: string
  privateKey: string
  autoRetry?: boolean
  autoRetries?: number
}
