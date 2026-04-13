import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

export default function sql(strings: TemplateStringsArray, ...values: any[]): Promise<Record<string, any>[]> {
  return getSql()(strings, ...values) as Promise<Record<string, any>[]>;
}
