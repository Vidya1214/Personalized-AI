import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

// Disable default body parsing to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: './uploads',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads');
    }

    const [fields, files] = await form.parse(req);
    
    let content = '';
    
    // Handle file upload
    if (files.file && files.file[0]) {
      const file = files.file[0];
      const fileContent = fs.readFileSync(file.filepath, 'utf8');
      content = fileContent;
      
      // Clean up uploaded file
      fs.unlinkSync(file.filepath);
    } 
    // Handle text input
    else if (fields.topic && fields.topic[0]) {
      content = fields.topic[0];
    } else {
      return res.status(400).json({ error: 'Please provide either a file or topic text' });
    }

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful educational assistant. Provide clear, concise summaries that are easy to understand.'
          },
          {
            role: 'user',
            content: `Please provide a comprehensive summary of the following content in simple terms:\n\n${content}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const data = await openAIResponse.json();
    const summary = data.choices[0].message.content;

    res.status(200).json({ result: summary });
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
}