import { StorageOptions } from 'storage-core'

export interface AwsS3StorageOptions extends StorageOptions {
  bucket: string
  accessKeyId: string
  secretAccessKey: string
}
