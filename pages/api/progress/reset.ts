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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get all progress records for the user
    const records = await base('Progress')
      .select({
        filterByFormula: `{userId} = '${userId}'`
      })
      .all();

    // Delete all progress records for the user
    if (records.length > 0) {
      const recordIds = records.map(record => record.id);
      
      // Airtable only allows deleting 10 records at a time
      for (let i = 0; i < recordIds.length; i += 10) {
        const batch = recordIds.slice(i, i + 10);
        await base('Progress').destroy(batch);
      }
    }

    return res.status(200).json({ message: 'Progress reset successfully' });
  } catch (error) {
    console.error('Error resetting progress:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 