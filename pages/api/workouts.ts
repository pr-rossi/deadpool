import { NextApiRequest, NextApiResponse } from 'next';
import Airtable, { Table, Records, Record } from 'airtable';
import { ExerciseRecord, Exercise } from '../../types';

const apiKey = process.env.AIRTABLE_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  throw new Error('Airtable API key or base ID is not set in environment variables');
}

const base = new Airtable({ apiKey }).base(baseId);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers for React Native app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const table = base('Workout');
    let allRecords: Exercise[] = [];

    await table.select({ view: 'Grid view' }).eachPage(
      (records: Records<ExerciseRecord>, fetchNextPage: () => void) => {
        allRecords = allRecords.concat(
          records.map((record: Record<ExerciseRecord>) => ({
            id: record.id,
            fields: record.fields,
          }))
        );
        fetchNextPage();
      }
    );

    return res.status(200).json({ workoutData: allRecords });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
