import type { StorageData } from '../types/extension';
import { storageKeyset } from './defaults';

export class StorageManager {
  static async get<K extends keyof StorageData>(key: K): Promise<StorageData[K] | undefined> {
    const result = await chrome.storage.local.get([key]);
    return result[key] as StorageData[K];
  }

  static async getAll(): Promise<Partial<StorageData>> {
    const result = await chrome.storage.local.get([...storageKeyset]);
    return result as Partial<StorageData>;
  }

  static set<K extends keyof StorageData>(key: K, value: StorageData[K]): Promise<void>;
  static set(data: Partial<StorageData>): Promise<void>;
  static set<K extends keyof StorageData>(
    keyOrData: K | Partial<StorageData>,
    value?: StorageData[K],
  ): Promise<void> {
    if (typeof keyOrData === 'string') {
      return chrome.storage.local.set({ [keyOrData]: value });
    }
    return chrome.storage.local.set(keyOrData);
  }

  static remove<K extends keyof StorageData>(key: K | K[]): Promise<void> {
    return chrome.storage.local.remove(key);
  }

  static clear(): Promise<void> {
    return chrome.storage.local.clear();
  }
}
