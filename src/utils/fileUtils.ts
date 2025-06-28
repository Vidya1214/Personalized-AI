import fs from 'fs';
import path from 'path';

export interface FileProcessingResult {
  content: string;
  error?: string;
}

export async function processUploadedFile(filePath: string, originalName: string): Promise<FileProcessingResult> {
  try {
    const fileExtension = path.extname(originalName).toLowerCase();
    
    switch (fileExtension) {
      case '.txt':
      case '.md':
        return await processTextFile(filePath);
      case '.pdf':
        return await processPDFFile(filePath);
      default:
        return { content: '', error: 'Unsupported file type' };
    }
  } catch (error) {
    console.error('File processing error:', error);
    return { content: '', error: 'Failed to process file' };
  }
}

async function processTextFile(filePath: string): Promise<FileProcessingResult> {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic validation
    if (!content.trim()) {
      return { content: '', error: 'File appears to be empty' };
    }
    
    // Limit content size (approximately 4000 tokens for GPT-3.5)
    const maxLength = 12000; // characters
    const processedContent = content.length > maxLength 
      ? content.substring(0, maxLength) + '...(content truncated)'
      : content;
    
    return { content: processedContent };
  } catch (error) {
    return { content: '', error: 'Failed to read text file' };
  }
}

async function processPDFFile(filePath: string): Promise<FileProcessingResult> {
  // For now, return a message about PDF processing
  // In a production app, you'd use a library like pdf2pic or pdf-parse
  return { 
    content: '', 
    error: 'PDF processing is not yet implemented. Please convert your PDF to text and upload as a .txt file.' 
  };
}

export function ensureUploadDir(uploadDir: string): void {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

export function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('File cleanup error:', error);
  }
}

export function validateFileSize(file: any, maxSize: number = 10 * 1024 * 1024): boolean {
  return file.size <= maxSize;
}

export function validateFileType(filename: string, allowedTypes: string[] = ['.txt', '.md', '.pdf']): boolean {
  const extension = path.extname(filename).toLowerCase();
  return allowedTypes.includes(extension);
}