import { StorageOptions } from 'storage-core'

export interface GoogleStorageCredentials {
  client_email: string
  private_key: string
}

export interface GoogleCloudStorageOptions extends StorageOptions {
  bucket: string
  projectId?: string
  keyFilename?: string
  email?: string
  autoRetry?: boolean
  autoRetries?: number
  credentials?: GoogleStorageCredentials
}
