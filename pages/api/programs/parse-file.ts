import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import formidable from 'formidable';
import fs from 'fs';
import { FILE_PARSE_PROMPT } from '../../../lib/ai/system-prompts';
import { extractProgram } from '../../../lib/ai/parse-program';

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 }); // 10MB
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fields, files } = await parseForm(req);

    const fileArray = files.file;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read file and convert to base64
    const fileBuffer = fs.readFileSync(file.filepath);
    const base64Data = fileBuffer.toString('base64');

    // Determine media type
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
    const mime = file.mimetype || '';
    if (mime.includes('png')) mediaType = 'image/png';
    else if (mime.includes('gif')) mediaType = 'image/gif';
    else if (mime.includes('webp')) mediaType = 'image/webp';

    // Call Claude with vision
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16384,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: FILE_PARSE_PROMPT,
          },
        ],
      }],
    });

    // Extract text content
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return res.status(500).json({ message: 'AI returned no text response' });
    }

    // Parse the program
    const program = extractProgram(textContent.text);
    if (!program) {
      return res.status(500).json({
        message: 'Failed to parse program from AI response',
        raw: textContent.text,
      });
    }

    // Cleanup temp file
    try { fs.unlinkSync(file.filepath); } catch {}

    return res.status(200).json({ program });
  } catch (error: any) {
    console.error('File parse error:', error);
    return res.status(500).json({ message: error.message || 'Failed to parse file' });
  }
}
