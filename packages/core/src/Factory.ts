import { Storage, StorageOptions } from './Storage'
import { LocalStorage } from './LocalStorage'

export type FactoryStorageOption<O extends StorageOptions = any> = O & {
  type: string
}

export type FactoryProviderOptions<O = any> = O & { type: string }

export class StorageFactory {
  private map = new Map<string, new (options: any) => Storage<any>>()

  constructor() {
    this.register('local', LocalStorage)
  }

  register<T extends Storage<any>>(
    type: string,
    StorageType: { new (options: any): T }
  ): void {
    this.map.set(type, StorageType)
  }

  create<O extends StorageOptions>(
    options: FactoryStorageOption<O>
  ): Storage<O> {
    const StorageType = this.map.get(options.type)
    if (!StorageType)
      throw new Error(`'${options.type}' has not been registered.`)
    return new StorageType(options)
  }
}

const storageFactory = new StorageFactory()

export function getStorageFactory() {
  return storageFactory
}
