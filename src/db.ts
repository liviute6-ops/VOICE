import Dexie, { Table } from 'dexie';

export interface HistoryItem {
  id?: number;
  timestamp: Date;
  text: string;
  mergedAudio: Blob;
  characterAudios: { name: string; audio: Blob; compactAudio?: Blob }[];
}

export class MyDatabase extends Dexie {
  history!: Table<HistoryItem>;

  constructor() {
    super('VoiceOfficeDB');
    this.version(1).stores({
      history: '++id, timestamp' // Primary key and indexed props
    });
  }
}

export const db_history = new MyDatabase();
