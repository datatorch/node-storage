export interface StorageOptions {}

export type FactoryStorageOption<O extends StorageOptions = any> = O & {
  type: string
}

export type ManagerStorageOption<
  O extends StorageOptions = any
> = FactoryStorageOption<O> & { id: string }
