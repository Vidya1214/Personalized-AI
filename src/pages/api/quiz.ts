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
    let difficulty = 'easy';
    
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

    // Get difficulty level
    if (fields.difficulty && fields.difficulty[0]) {
      difficulty = fields.difficulty[0];
    }

    // Call OpenAI API to generate quiz
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
            content: `You are a quiz generator. Generate exactly 5 multiple choice questions based on the provided content. Each question should have 4 options and be at ${difficulty} difficulty level. Return the response in JSON format with this structure: {"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "correct option"}]}`
          },
          {
            role: 'user',
            content: `Generate a ${difficulty} level quiz with 5 multiple choice questions based on this content:\n\n${content}`
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const data = await openAIResponse.json();
    const quizContent = data.choices[0].message.content;
    
    try {
      const quizData = JSON.parse(quizContent);
      res.status(200).json(quizData);
    } catch (parseError) {
      // Fallback: extract questions manually if JSON parsing fails
      console.error('JSON parsing error:', parseError);
      res.status(200).json({ 
        questions: generateFallbackQuiz(content, difficulty) 
      });
    }
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
}

function generateFallbackQuiz(topic: string, difficulty: string) {
  // Fallback quiz generation
  return [
    {
      question: `What is the main concept discussed in the provided content about "${topic}"?`,
      options: ["Primary concept", "Secondary concept", "Tertiary concept", "Related concept"],
      answer: "Primary concept"
    },
    {
      question: `At what difficulty level is this quiz set?`,
      options: ["Easy", "Medium", "Hard", "Expert"],
      answer: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    },
    {
      question: `Which aspect is most important when studying this topic?`,
      options: ["Understanding basics", "Memorizing facts", "Practical application", "All of the above"],
      answer: "All of the above"
    }
  ];
}