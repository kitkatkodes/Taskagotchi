import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync('taskagotchi.db');
    initDb(_db);
  }
  return _db;
}

function initDb(db: SQLite.SQLiteDatabase) {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      icon TEXT DEFAULT '⭐',
      category TEXT DEFAULT 'personal',
      frequency TEXT DEFAULT 'daily',
      time_of_day TEXT DEFAULT 'anytime',
      reminder_time TEXT,
      color TEXT DEFAULT '#FF6B9D',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      completed_date TEXT NOT NULL,
      completed_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, completed_date)
    );

    CREATE TABLE IF NOT EXISTS pet (
      id INTEGER PRIMARY KEY DEFAULT 1,
      pet_type TEXT DEFAULT 'neko',
      pet_name TEXT DEFAULT 'Neko',
      health INTEGER DEFAULT 80,
      energy INTEGER DEFAULT 80,
      mood TEXT DEFAULT 'happy',
      evolution_stage INTEGER DEFAULT 1,
      total_xp INTEGER DEFAULT 0,
      coins INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY DEFAULT 1,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      total_completions INTEGER DEFAULT 0,
      last_completion_date TEXT,
      onboarding_done INTEGER DEFAULT 0
    );

    INSERT OR IGNORE INTO pet (id) VALUES (1);
    INSERT OR IGNORE INTO user_stats (id) VALUES (1);
  `);
}

// ─── Habits ────────────────────────────────────────────────────────────────

export interface Habit {
  id: string;
  title: string;
  icon: string;
  category: string;
  frequency: string;
  time_of_day: string;
  reminder_time: string | null;
  color: string;
  is_active: number;
  created_at: string;
  sort_order: number;
}

export interface HabitWithStatus extends Habit {
  completed_today: boolean;
}

export function getAllHabits(): Habit[] {
  const db = getDb();
  return db.getAllSync<Habit>(
    'SELECT * FROM habits WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC'
  );
}

export function getHabitsWithTodayStatus(): HabitWithStatus[] {
  const db = getDb();
  const today = getTodayString();
  return db.getAllSync<HabitWithStatus>(`
    SELECT h.*,
      CASE WHEN hl.id IS NOT NULL THEN 1 ELSE 0 END as completed_today
    FROM habits h
    LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.completed_date = ?
    WHERE h.is_active = 1
    ORDER BY h.sort_order ASC, h.created_at ASC
  `, [today]);
}

export function insertHabit(habit: Omit<Habit, 'created_at'>): void {
  const db = getDb();
  db.runSync(
    `INSERT INTO habits (id, title, icon, category, frequency, time_of_day, reminder_time, color, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [habit.id, habit.title, habit.icon, habit.category, habit.frequency,
     habit.time_of_day, habit.reminder_time, habit.color, habit.is_active, habit.sort_order]
  );
}

export function updateHabit(id: string, updates: Partial<Habit>): void {
  const db = getDb();
  const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), id];
  db.runSync(`UPDATE habits SET ${fields} WHERE id = ?`, values);
}

export function deleteHabit(id: string): void {
  const db = getDb();
  db.runSync('UPDATE habits SET is_active = 0 WHERE id = ?', [id]);
}

// ─── Habit Logs ────────────────────────────────────────────────────────────

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_date: string;
  completed_at: string;
}

export function logHabitCompletion(habitId: string): void {
  const db = getDb();
  const today = getTodayString();
  const id = `${habitId}_${today}`;
  db.runSync(
    'INSERT OR IGNORE INTO habit_logs (id, habit_id, completed_date) VALUES (?, ?, ?)',
    [id, habitId, today]
  );
}

export function removeHabitCompletion(habitId: string): void {
  const db = getDb();
  const today = getTodayString();
  db.runSync(
    'DELETE FROM habit_logs WHERE habit_id = ? AND completed_date = ?',
    [habitId, today]
  );
}

export function getCompletionsForDate(date: string): string[] {
  const db = getDb();
  return db.getAllSync<{ habit_id: string }>(
    'SELECT habit_id FROM habit_logs WHERE completed_date = ?', [date]
  ).map(r => r.habit_id);
}

export function getCompletionHistory(days: number): Record<string, string[]> {
  const db = getDb();
  const rows = db.getAllSync<{ completed_date: string; habit_id: string }>(
    `SELECT completed_date, habit_id FROM habit_logs
     WHERE completed_date >= date('now', '-${days} days')
     ORDER BY completed_date DESC`
  );
  return rows.reduce((acc, row) => {
    if (!acc[row.completed_date]) acc[row.completed_date] = [];
    acc[row.completed_date].push(row.habit_id);
    return acc;
  }, {} as Record<string, string[]>);
}

// ─── Pet ───────────────────────────────────────────────────────────────────

export interface PetRow {
  id: number;
  pet_type: string;
  pet_name: string;
  health: number;
  energy: number;
  mood: string;
  evolution_stage: number;
  total_xp: number;
  coins: number;
}

export function getPet(): PetRow {
  const db = getDb();
  return db.getFirstSync<PetRow>('SELECT * FROM pet WHERE id = 1')!;
}

export function updatePet(updates: Partial<Omit<PetRow, 'id'>>): void {
  const db = getDb();
  const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(updates)];
  db.runSync(`UPDATE pet SET ${fields} WHERE id = 1`, values);
}

// ─── User Stats ────────────────────────────────────────────────────────────

export interface UserStats {
  id: number;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  last_completion_date: string | null;
  onboarding_done: number;
}

export function getUserStats(): UserStats {
  const db = getDb();
  return db.getFirstSync<UserStats>('SELECT * FROM user_stats WHERE id = 1')!;
}

export function updateUserStats(updates: Partial<Omit<UserStats, 'id'>>): void {
  const db = getDb();
  const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(updates)];
  db.runSync(`UPDATE user_stats SET ${fields} WHERE id = 1`, values);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getTodayCompletionRate(): number {
  const db = getDb();
  const today = getTodayString();
  const total = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habits WHERE is_active = 1'
  )?.count ?? 0;
  if (total === 0) return 0;
  const done = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habit_logs WHERE completed_date = ?', [today]
  )?.count ?? 0;
  return Math.round((done / total) * 100);
}
