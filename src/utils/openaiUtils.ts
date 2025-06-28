export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenAIService {
  private config: OpenAIConfig;

  constructor(config: Partial<OpenAIConfig> = {}) {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-3.5-turbo',
      maxTokens: 800,
      temperature: 0.7,
      ...config
    };

    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
  }

  async generateCompletion(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI completion error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateSummary(content: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful educational assistant. Provide clear, concise summaries that are easy to understand. Focus on the main concepts, key points, and important details. Structure your response with clear paragraphs and make it engaging for learners.'
      },
      {
        role: 'user',
        content: `Please provide a comprehensive summary of the following content in simple terms. Break it down into main concepts and explain them clearly:\n\n${content}`
      }
    ];

    return this.generateCompletion(messages);
  }

  async generateQuiz(content: string, difficulty: string = 'medium', questionCount: number = 5): Promise<any> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a quiz generator. Generate exactly ${questionCount} multiple choice questions based on the provided content. Each question should have 4 options (A, B, C, D) and be at ${difficulty} difficulty level. 

Return the response in valid JSON format with this exact structure:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ]
}

Make sure:
- Questions test understanding, not just memorization
- All 4 options are plausible
- The correct answer is clearly indicated
- Questions cover different aspects of the content
- Difficulty matches the requested level`
      },
      {
        role: 'user',
        content: `Generate a ${difficulty} level quiz with ${questionCount} multiple choice questions based on this content:\n\n${content}`
      }
    ];

    const response = await this.generateCompletion(messages);
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Raw response:', response);
      
      // Return fallback quiz if JSON parsing fails
      return {
        questions: this.generateFallbackQuiz(content, difficulty, questionCount)
      };
    }
  }

  private generateFallbackQuiz(content: string, difficulty: string, count: number) {
    const fallbackQuestions = [
      {
        question: "Based on the provided content, what is the main topic being discussed?",
        options: ["Primary concept", "Secondary details", "Background information", "Conclusion"],
        answer: "Primary concept"
      },
      {
        question: `What difficulty level is this quiz set to?`,
        options: ["Easy", "Medium", "Hard", "Expert"],
        answer: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
      },
      {
        question: "Which approach is best for studying this material?",
        options: ["Memorization only", "Understanding concepts", "Skipping details", "Reading once"],
        answer: "Understanding concepts"
      },
      {
        question: "What is the most important aspect when learning new material?",
        options: ["Speed", "Comprehension", "Repetition", "Note-taking"],
        answer: "Comprehension"
      },
      {
        question: "How many questions are in this quiz?",
        options: ["3", "4", "5", "6"],
        answer: count.toString()
      }
    ];

    return fallbackQuestions.slice(0, count);
  }
}