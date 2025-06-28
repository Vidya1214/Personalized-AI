import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Question {
  question: string;
  options: string[];
  answer: string;
}

export default function QuizPage() {
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [quizStarted, setQuizStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

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

  const handleGenerateQuiz = async (e: React.FormEvent) => {
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
    resetQuiz();

    try {
      const formData = new FormData();
      
      if (inputType === 'file' && file) {
        formData.append('file', file);
      } else {
        formData.append('topic', topic);
      }
      formData.append('difficulty', difficulty);

      const res = await fetch('/api/quiz', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await res.json();
      setQuestions(data.questions || []);
      setUserAnswers(new Array(data.questions?.length || 0).fill(''));
      setQuizStarted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer('');
    setShowResult(false);
    setQuizStarted(false);
    setUserAnswers([]);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (selectedAnswer === questions[currentIndex].answer) {
      setScore(score + 1);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(userAnswers[currentIndex + 1] || '');
    } else {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(userAnswers[currentIndex - 1] || '');
    }
  };

  const restartQuiz = () => {
    resetQuiz();
  };

  if (quizStarted && questions.length > 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 to-white">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center p-6">
          {!showResult ? (
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Question {currentIndex + 1} of {questions.length}</span>
                  <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                {questions[currentIndex].question}
              </h2>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {questions[currentIndex].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option)}
                    className={`block w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedAnswer === option
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedAnswer}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentIndex + 1 === questions.length ? 'Finish Quiz' : 'Next'}
                </button>
              </div>
            </div>
          ) : (
            /* Results */
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">
                  {score / questions.length >= 0.8 ? '🎉' : score / questions.length >= 0.6 ? '👍' : '📚'}
                </div>
                <h2 className="text-3xl font-bold text-green-700 mb-2">Quiz Complete!</h2>
                <p className="text-xl text-gray-600">
                  Your Score: <span className="font-bold text-green-600">{score}/{questions.length}</span>
                </p>
                <p className="text-lg text-gray-500">
                  {Math.round((score / questions.length) * 100)}% Correct
                </p>
              </div>

              {/* Performance Message */}
              <div className="mb-6 p-4 rounded-lg bg-gray-50">
                <p className="text-gray-700">
                  {score / questions.length >= 0.8 
                    ? "Excellent work! You have a strong understanding of the topic."
                    : score / questions.length >= 0.6 
                      ? "Good job! You're on the right track. Consider reviewing the material."
                      : "Keep studying! Practice makes perfect."}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={restartQuiz}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Take Another Quiz
                </button>
                <button
                  onClick={() => window.location.href = '/summary'}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Generate Summary
                </button>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 to-white">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-4 text-green-700">Generate a Quiz</h1>
        
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl w-full mb-8">
          {/* Input Type Selector */}
          <div className="mb-4">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setInputType('text')}
                className={`px-4 py-2 rounded-lg transition ${
                  inputType === 'text' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Enter Topic
              </button>
              <button
                onClick={() => setInputType('file')}
                className={`px-4 py-2 rounded-lg transition ${
                  inputType === 'file' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          <form onSubmit={handleGenerateQuiz}>
            {inputType === 'text' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Topic:
                </label>
                <textarea
                  placeholder="Enter a topic or paste your content here (e.g., Photosynthesis, World War II, etc.)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical min-h-[100px]"
                  rows={4}
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File:
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".txt,.md,.pdf"
                    className="hidden"
                    id="file-upload-quiz"
                  />
                  <label htmlFor="file-upload-quiz" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="text-gray-400">
                        <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">
                        TXT, MD, or PDF (max 10MB)
                      </p>
                    </div>
                  </label>
                  {file && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Difficulty Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level:
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Quiz...
                </div>
              ) : (
                'Generate Quiz'
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Instructions */}
        <div className="max-w-2xl w-full bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">How to use:</h2>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• <strong>Enter Topic:</strong> Type any subject you want to learn about</li>
            <li>• <strong>Upload File:</strong> Upload your study materials (text, markdown, or PDF)</li>
            <li>• <strong>Choose Difficulty:</strong> Select the appropriate challenge level</li>
            <li>• <strong>Take Quiz:</strong> Answer questions and track your progress</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}