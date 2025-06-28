import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SummaryPage() {
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputType, setInputType] = useState<'text' | 'file'>('text');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.txt') && !selectedFile.name.endsWith('.md')) {
        setError('Please upload a text file (.txt, .md) or PDF');
        return;
      }
      
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputType === 'text' && !topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    
    if (inputType === 'file' && !file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const formData = new FormData();
      
      if (inputType === 'file' && file) {
        formData.append('file', file);
      } else {
        formData.append('topic', topic);
      }

      const res = await fetch('/api/summary', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await res.json();
      setSummary(data.result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-white">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-4 text-blue-800">AI Topic Summary</h1>
        
        <div className="bg-white shadow rounded-lg p-6 max-w-2xl w-full mb-8">
          {/* Input Type Selector */}
          <div className="mb-4">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setInputType('text')}
                className={`px-4 py-2 rounded-lg transition ${
                  inputType === 'text' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Enter Topic
              </button>
              <button
                onClick={() => setInputType('file')}
                className={`px-4 py-2 rounded-lg transition ${
                  inputType === 'file' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {inputType === 'text' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Topic:
                </label>
                <textarea
                  placeholder="Enter a topic or paste your content here (e.g., Climate Change, Photosynthesis, etc.)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px]"
                  rows={4}
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File:
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".txt,.md,.pdf"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="text-gray-400">
                        <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-600">
                        {file ? (
                          <span className="text-blue-600 font-medium">{file.name}</span>
                        ) : (
                          <>
                            <span className="text-blue-600 hover:text-blue-500">Click to upload</span>
                            <span> or drag and drop</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        TXT, MD, PDF up to 10MB
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Summary...
                </div>
              ) : (
                'Generate AI Summary'
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>

        {summary && (
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl shadow-lg">
            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              AI Generated Summary:
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">{summary}</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}