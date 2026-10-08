export interface TextItem {
  id: string;
  title: string;
  content: string;
  words: string[];
  lastReadWordIndex: number;
  createdAt: number;
  updatedAt: number;
}

export interface ReaderSettings {
  wpm: number;
  wordsPerChunk: number;
  timerMinutes: number; // 0 means unlimited
  fontSize: number;
}

export type RootStackParamList = {
  Home: undefined;
  AddText: undefined;
  Reader: { textId: string };
};
