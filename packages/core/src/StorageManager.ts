import LRUCache from 'lru-cache'

import { Storage } from './Storage'
import { StorageOptions, ManagerStorageOption } from './StorageOptions'
import { getStorageFactory } from './StorageFactory'

const DEFAULT_MAX_SIZE = 1000
const defaultSizeCalculator = () => 1

export type StorageManagerOptions = {
  maxSize?: number
  sizeCalculator?: (value: Storage, key: string) => number
}

const DEFAULT_MANAGER: StorageManagerOptions = {
  maxSize: DEFAULT_MAX_SIZE,
  sizeCalculator: defaultSizeCalculator
}

class StorageManager {
  private storages: LRUCache<string, Storage>

  constructor(options: StorageManagerOptions = DEFAULT_MANAGER) {
    const { maxSize, sizeCalculator } = options
    this.storages = new LRUCache({ max: maxSize, length: sizeCalculator })
  }

  has(id: string): boolean {
    return this.storages.has(id)
  }

  get<O extends StorageOptions = any>(id: string): Storage<O> {
    const storage = this.storages.get(id)
    if (!storage) throw new Error('Storage not found.')
    return storage
  }

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
   *
   * @param options
   * @param ttl max age in milliseconds
   */
  async create<O extends StorageOptions>(
    options: ManagerStorageOption<O>,
    ttl?: number
  ): Promise<Storage> {
    const storage = getStorageFactory().create(options)
    await storage.initialize()
    this.storages.set(options.id, storage, ttl)
    return storage
  }
}

const storageManager = new StorageManager()

export function getStorageManager() {
  return storageManager
}
