import initSqlJs, { Database as SqlJsDatabase, SqlValue } from 'sql.js';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'secureauth.db');

let database: SqlJsDatabase;

function persist(): void {
  if (!database) return;
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const data = database.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

class Statement {
  constructor(
    private readonly sql: string
  ) {}

  get(...params: SqlValue[]): Record<string, unknown> | undefined {
    const stmt = database.prepare(this.sql);
    try {
      if (params.length > 0) stmt.bind(params);
      if (stmt.step()) {
        return stmt.getAsObject() as Record<string, unknown>;
      }
      return undefined;
    } finally {
      stmt.free();
    }
  }

  all(...params: SqlValue[]): Record<string, unknown>[] {
    const stmt = database.prepare(this.sql);
    const results: Record<string, unknown>[] = [];
    try {
      if (params.length > 0) stmt.bind(params);
      while (stmt.step()) {
        results.push(stmt.getAsObject() as Record<string, unknown>);
      }
      return results;
    } finally {
      stmt.free();
    }
  }

  run(...params: SqlValue[]): { lastInsertRowid: number | bigint; changes: number } {
    database.run(this.sql, params);
    persist();
    const rowid = database.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0];
    const changes = database.getRowsModified();
    return {
      lastInsertRowid: typeof rowid === 'number' ? rowid : Number(rowid),
      changes,
    };
  }
}

export const db = {
  prepare(sql: string): Statement {
    return new Statement(sql);
  },
  exec(sql: string): void {
    database.exec(sql);
    persist();
  },
};

export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs();

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    database = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    database = new SQL.Database();
  }
}
