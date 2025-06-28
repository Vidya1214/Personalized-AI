import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, difficulty } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Please provide a topic' });
    }

    // Mock quiz generation (replace with actual AI API call)
    const mockQuestions = generateMockQuiz(topic, difficulty);
    
    res.status(200).json({ questions: mockQuestions });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
}

function generateMockQuiz(topic: string, difficulty: string) {
  // This is a mock function - in production, you'd use an AI API
  const questions = [
    {
      question: `What is the main concept related to "${topic}"?`,
      options: ["Primary concept", "Secondary concept", "Tertiary concept", "Related concept"],
      answer: "Primary concept"
    },
    {
      question: `Which difficulty level are you practicing at?`,
      options: ["Easy", "Medium", "Hard", "Expert"],
      answer: difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard'
    },
    {
      question: `How would you categorize "${topic}"?`,
      options: ["Science", "History", "Literature", "Mathematics"],
      answer: "Science"
    }
  ];
  
  return questions;
}
