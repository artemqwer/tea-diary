import Dexie, { Table } from 'dexie';

// 1. Інтерфейси (Типи даних)
export interface Tea {
  id?: number; // Dexie сам згенерує ID (автоінкремент)
  name: string;
  type: 'Puer' | 'Oolong' | 'Red' | 'Green' | 'White';
  year: number;
  origin: string;
  remaining: number; // грами
  total: number; // грами (початкова вага)
}

export interface Session {
  id?: number;
  teaId: number;
  date: Date;
  duration: number; // секунди
  steeps: number; // кількість проливів
  rating: number; // 1-5
}

// 2. Клас бази даних
export class TeaDatabase extends Dexie {
  teas!: Table<Tea>;
  sessions!: Table<Session>;

  constructor() {
    super('TeaDiaryDB');

    // Описуємо структуру (схему).
    // Перераховуємо тільки поля, які будуть в індексі (для пошуку)
    this.version(1).stores({
      teas: '++id, name, type',
      sessions: '++id, teaId, date',
    });
  }
}

// 3. Експортуємо готовий екземпляр бази
export const db = new TeaDatabase();

// 4. Функція для створення демо-даних
export async function populateInitialData() {
  const count = await db.teas.count();
  if (count === 0) {
    await db.teas.bulkAdd([
      {
        name: 'Lao Ban Zhang 2015',
        type: 'Puer',
        year: 2015,
        origin: 'Menghai',
        remaining: 45,
        total: 357,
      },
      {
        name: 'Duck Shit Oolong (Ya Shi Xiang)',
        type: 'Oolong',
        year: 2023,
        origin: 'Phoenix Mts',
        remaining: 20,
        total: 50,
      },
      {
        name: 'Dian Hong Golden Bud',
        type: 'Red',
        year: 2022,
        origin: 'Yunnan',
        remaining: 85,
        total: 100,
      },
    ]);
  }
}
