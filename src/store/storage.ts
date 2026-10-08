import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextItem, ReaderSettings } from '../types';

const TEXTS_KEY = '@speed_reader_texts';
const SETTINGS_KEY = '@speed_reader_settings';

const DEFAULT_SETTINGS: ReaderSettings = {
  wpm: 300,
  wordsPerChunk: 1,
  timerMinutes: 0,
  fontSize: 20,
};

export const getTexts = async (): Promise<TextItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TEXTS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading texts', e);
    return [];
  }
};

export const saveText = async (text: Omit<TextItem, 'id' | 'words' | 'lastReadWordIndex' | 'createdAt' | 'updatedAt'>) => {
  try {
    const texts = await getTexts();
    // basic word splitting by whitespace
    const words = text.content.trim().split(/\s+/).filter(w => w.length > 0);
    const newText: TextItem = {
      ...text,
      id: Date.now().toString(),
      words,
      lastReadWordIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await AsyncStorage.setItem(TEXTS_KEY, JSON.stringify([newText, ...texts]));
    return newText;
  } catch (e) {
    console.error('Error saving text', e);
    throw e;
  }
};

export const updateTextProgress = async (id: string, index: number) => {
  try {
    const texts = await getTexts();
    const updatedTexts = texts.map(t => {
      if (t.id === id) {
        return { ...t, lastReadWordIndex: index, updatedAt: Date.now() };
      }
      return t;
    });
    await AsyncStorage.setItem(TEXTS_KEY, JSON.stringify(updatedTexts));
  } catch (e) {
    console.error('Error updating text progress', e);
  }
};

export const deleteText = async (id: string) => {
  try {
    const texts = await getTexts();
    const updatedTexts = texts.filter(t => t.id !== id);
    await AsyncStorage.setItem(TEXTS_KEY, JSON.stringify(updatedTexts));
  } catch (e) {
    console.error('Error deleting text', e);
  }
};

export const getSettings = async (): Promise<ReaderSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    return jsonValue != null ? { ...DEFAULT_SETTINGS, ...JSON.parse(jsonValue) } : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Error reading settings', e);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: ReaderSettings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
};



