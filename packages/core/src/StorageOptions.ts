export interface StorageOptions {}

export type FactorStorageOption<O extends StorageOptions = any> = O & {
  type: string
}

export type ManagerStorageOption<
  O extends StorageOptions = any
> = FactorStorageOption<O> & { id: string }
