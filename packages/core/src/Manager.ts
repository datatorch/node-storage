import LRUCache from 'lru-cache'

import { Storage, StorageOptions } from './Storage'
import { getStorageFactory, FactoryStorageOption } from './Factory'

const DEFAULT_MAX_SIZE = 1000
const defaultSizeCalculator = () => 1

export type ManagerStorageOption<
  O extends StorageOptions = any
> = FactoryStorageOption<O> & { id: string }

export type StorageManagerOptions = {
  maxSize?: number
  sizeCalculator?: (value: Storage, key: string) => number
}

const DEFAULT_MANAGER: StorageManagerOptions = {
  maxSize: DEFAULT_MAX_SIZE,
  sizeCalculator: defaultSizeCalculator
}

export default class StorageManager {
  /** Cache map */
  private storages: LRUCache<string, Storage>

  constructor(options: StorageManagerOptions = DEFAULT_MANAGER) {
    const { maxSize, sizeCalculator } = options
    this.storages = new LRUCache({
      max: maxSize,
      length: sizeCalculator
    })
  }

  /**
   * Checks if cache contains storage unit
   *
   * @param id identifier associated with storage unit
   */
  has(id: string): boolean {
    return this.storages.has(id)
  }

  /**
   * Retrieves storage unit from cache
   *
   * @param id identifier associated with storage unit
   */
  get<O extends StorageOptions = any>(id: string): Storage<O> {
    const storage = this.storages.get(id)
    if (!storage) throw new Error('Storage not found.')
    return storage
  }

  /**
   * Gets or creates a storage unit from cache.
   *
   * @remarks
   * Created storage will also be cached. Requires storage type to be registered
   * in the storage factory.
   *
   * @param options options of storage
   * @param ttl max age in milliseconds before storage is removed
   */
  async getOrCreate<O extends StorageOptions>(
    options: ManagerStorageOption<O>,
    ttl?: number
  ): Promise<Storage<O>> {
    if (!options.id) return this.create(options, ttl)
    try {
      return this.get(options.id)
    } catch (ex) {
      return this.create(options, ttl)
    }
  }

  /**
   * Creates a storage unit based on the configuration parameters.
   *
   * @remarks
   * Created storage will also be cached. Requires storage type to be registered
   * in the storage factory.
   *
   * @param options options of storage
   * @param ttl max age in milliseconds before storage is removed
   */
  async create<O extends StorageOptions>(
    options: ManagerStorageOption<O>,
    ttl?: number
  ): Promise<Storage<O>> {
    const storage = getStorageFactory().create(options)
    this.storages.set(options.id, storage, ttl)
    return storage
  }
}

const storageManager = new StorageManager()

export function getStorageManager(): StorageManager {
  return storageManager
}
