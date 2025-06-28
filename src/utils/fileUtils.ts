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
  try {
    // Dynamically import pdf-parse to handle potential module issues
    const pdfParse = require('pdf-parse');
    
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    if (!pdfData.text.trim()) {
      return { content: '', error: 'PDF appears to be empty or contains no readable text' };
    }
    
    // Limit content size
    const maxLength = 12000;
    const processedContent = pdfData.text.length > maxLength 
      ? pdfData.text.substring(0, maxLength) + '...(content truncated)'
      : pdfData.text;
    
    return { content: processedContent };
  } catch (error) {
    console.error('PDF processing error:', error);
    return { 
      content: '', 
      error: 'Failed to process PDF. Please ensure the PDF contains readable text or convert to .txt format.' 
    };
  }
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