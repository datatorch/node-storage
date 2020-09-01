import { getStorageManager, StorageManager } from './Manager'
import { Storage } from './Storage'

export abstract class StorageProvider<T extends Storage = any> {
  readonly manager: StorageManager

  constructor(manager?: StorageManager) {
    this.manager = manager ?? getStorageManager()
  }

  abstract getStorage(name: string): Promise<T>
  abstract createStorage(name: string): Promise<T>
  abstract deleteStorage(name: string): Promise<any>
}
