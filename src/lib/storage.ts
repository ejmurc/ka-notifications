import { StorageData } from '../types/extension';

export class StorageManager {
  private static cache: StorageData | null = null;

  static async getAll(): Promise<StorageData> {
    if (!this.cache) {
      this.cache = await new Promise<StorageData>((resolve) => {
        chrome.storage.local.get(null, (data) => resolve(data as StorageData));
      });
    }
    return this.cache;
  }

  static async getItem<K extends keyof StorageData>(key: K): Promise<StorageData[K] | undefined> {
    if (this.cache) return this.cache[key];
    const data = await new Promise<StorageData>((resolve) => {
      chrome.storage.local.get([key], (result) => resolve(result as StorageData));
    });
    return data[key];
  }

  static async setItem<K extends keyof StorageData>(key: K, value: StorageData[K]): Promise<void> {
    this.cache = { ...(this.cache || {}), [key]: value };
    return chrome.storage.local.set({ [key]: value });
  }

  static async setAll(data: Partial<StorageData>): Promise<void> {
    this.cache = { ...(this.cache || {}), ...data };
    return chrome.storage.local.set(data);
  }

  static async removeItem<K extends keyof StorageData>(key: K): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => resolve());
    });
  }

  static async removeAll(keys: (keyof StorageData)[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, () => resolve());
    });
  }
}
