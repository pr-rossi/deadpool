import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Creating programs table...');
  await sql`
    CREATE TABLE IF NOT EXISTS programs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      duration_weeks INT NOT NULL,
      difficulty TEXT,
      is_active BOOLEAN DEFAULT FALSE,
      source TEXT DEFAULT 'default',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log('Creating program_exercises table...');
  await sql`
    CREATE TABLE IF NOT EXISTS program_exercises (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
      exercise_order INT,
      workout_week INT NOT NULL,
      workout_day TEXT NOT NULL,
      exercise_group TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      rounds INT,
      reps TEXT,
      rest TEXT,
      notes TEXT,
      video_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log('Creating indexes...');
  await sql`CREATE INDEX IF NOT EXISTS idx_programs_user_id ON programs(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_program_exercises_program ON program_exercises(program_id)`;

  console.log('Seeding default program...');
  const existing = await sql`SELECT id FROM programs WHERE id = '00000000-0000-0000-0000-000000000001'`;
  if (existing.length === 0) {
    await sql`
      INSERT INTO programs (id, user_id, name, description, duration_weeks, difficulty, source)
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        'default',
        '12-Week Strength Program',
        'A comprehensive strength training program designed to build muscle and increase overall strength.',
        12,
        'Intermediate',
        'default'
      )
    `;
    console.log('Default program seeded.');
  } else {
    console.log('Default program already exists.');
  }

  // Add program_id to progress if not exists
  console.log('Adding program_id to progress table...');
  try {
    await sql`ALTER TABLE progress ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id)`;
    console.log('Added program_id column.');
  } catch (e) {
    console.log('program_id column may already exist:', e.message);
  }

  console.log('Verifying...');
  const programs = await sql`SELECT * FROM programs`;
  console.log(`Programs: ${programs.length}`);

  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `;
  console.log('Tables:', tables.map(t => t.table_name).join(', '));

  console.log('Migration complete!');
}

migrate().catch(console.error);
