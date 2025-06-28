import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { OpenAIService } from '../../utils/openaiUtils';
import { processUploadedFile, ensureUploadDir, cleanupFile, validateFileSize, validateFileType } from '../../utils/fileUtils';

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
    // Initialize OpenAI service
    let openAIService: OpenAIService;
    try {
      openAIService = new OpenAIService();
    } catch (error) {
      console.error('OpenAI initialization error:', error);
      return res.status(500).json({ 
        error: 'AI service configuration error. Please check your API key.' 
      });
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    ensureUploadDir(uploadDir);

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    });

    const [fields, files] = await form.parse(req);
    
    let content = '';
    let filePath = '';
    
    try {
      // Handle file upload
      if (files.file && files.file[0]) {
        const file = files.file[0];
        
        // Validate file
        if (!validateFileSize(file)) {
          return res.status(400).json({ error: 'File size exceeds 10MB limit' });
        }
        
        if (!validateFileType(file.originalFilename || '')) {
          return res.status(400).json({ error: 'Unsupported file type. Please upload .txt, .md, or .pdf files.' });
        }
        
        filePath = file.filepath;
        const result = await processUploadedFile(file.filepath, file.originalFilename || '');
        
        if (result.error) {
          return res.status(400).json({ error: result.error });
        }
        
        content = result.content;
      } 
      // Handle text input
      else if (fields.topic && fields.topic[0]) {
        content = fields.topic[0];
      } else {
        return res.status(400).json({ error: 'Please provide either a file or topic text' });
      }

      // Validate content
      if (!content.trim()) {
        return res.status(400).json({ error: 'Content appears to be empty' });
      }

      if (content.length < 10) {
        return res.status(400).json({ error: 'Content is too short to generate a meaningful summary' });
      }

      // Generate summary using OpenAI
      const summary = await openAIService.generateSummary(content);

      if (!summary) {
        throw new Error('Empty response from AI service');
      }

      res.status(200).json({ result: summary });
    } catch (error) {
      console.error('Summary generation error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return res.status(500).json({ error: 'AI service configuration error' });
        }
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
          return res.status(429).json({ error: 'AI service temporarily unavailable. Please try again later.' });
        }
      }
      
      res.status(500).json({ error: 'Failed to generate summary' });
    } finally {
      // Clean up uploaded file
      if (filePath) {
        cleanupFile(filePath);
      }
    }
  } catch (error) {
    console.error('Request processing error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
}