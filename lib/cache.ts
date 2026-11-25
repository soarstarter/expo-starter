import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const WebStorage = {
  getItem: async (key: string) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
};

const storage = Platform.OS === 'web' ? WebStorage : AsyncStorage;

export async function getCacheJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCacheJson(key: string, value: unknown) {
  try {
    await storage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore cache writes.
  }
}
