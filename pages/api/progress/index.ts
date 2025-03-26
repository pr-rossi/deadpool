import { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';

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
  try {
    if (req.method === 'POST') {
      const { userId, exerciseId, completed } = req.body;

      if (!userId || !exerciseId) {
        return res.status(400).json({ message: 'User ID and Exercise ID are required' });
      }

      // Create or update progress record
      const records = await base('Progress')
        .select({
          filterByFormula: `AND({userId} = '${userId}', {exerciseId} = '${exerciseId}')`,
        })
        .firstPage();

      if (records.length > 0) {
        // Update existing record
        await records[0].updateFields({
          completed: completed,
        });
      } else {
        // Create new record
        await base('Progress').create([
          {
            fields: {
              userId,
              exerciseId,
              completed,
            },
          },
        ]);
      }

      return res.status(200).json({ message: 'Progress updated successfully' });
    } else if (req.method === 'GET') {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Get all progress records for a user
      const records = await base('Progress')
        .select({
          filterByFormula: `{userId} = '${userId}'`,
        })
        .all();

      const progress = records.map(record => ({
        exerciseId: record.fields.exerciseId,
        completed: record.fields.completed,
        lastUpdated: record._rawJson.lastModifiedTime, // Use Airtable's Last modified time
      }));

      return res.status(200).json({ progress });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Progress error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 