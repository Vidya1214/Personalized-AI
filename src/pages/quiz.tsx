import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function QuizPage() {
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    setLoading(true);
    setError('');
    setQuestions([]);
    setIndex(0);
    setScore(0);
    setSelected('');
    setSubmitted(false);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty }),
      });
      if (!res.ok) throw new Error('Failed to generate quiz');
      const data = await res.json();
      setQuestions(data.questions);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selected === questions[index].answer) setScore(score + 1);
    setSubmitted(true);
  };

  const next = () => {
    setIndex(index + 1);
    setSelected('');
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-100 to-white">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-4 text-green-700">Generate a Quiz</h1>
        <form onSubmit={handleGenerateQuiz} className="bg-white shadow rounded p-6 max-w-xl w-full mb-8">
          <label className="block mb-2 font-semibold">Enter Topic:</label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Photosynthesis" className="border p-2 rounded w-full mb-4" required />
          <label className="block mb-2 font-semibold">Difficulty:</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="border p-2 rounded w-full mb-4">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </form>
        {questions.length > 0 && (
          <div className="bg-white shadow rounded p-6 max-w-xl w-full text-left">
            <h2 className="text-lg font-semibold mb-2">{questions[index].question}</h2>
            <div className="space-y-2 mb-4">
              {questions[index].options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => setSelected(opt)}
                  className={`block w-full text-left px-4 py-2 rounded border transition ${selected === opt ? 'bg-green-100 border-green-500' : 'bg-gray-50'}`}
                  disabled={submitted}
                >
                  {opt}
                </button>
              ))}
            </div>
            {!submitted ? (
              <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
            ) : (
              <div>
                <p className="mb-2">
                  {selected === questions[index].answer ? '✅ Correct!' : '❌ Incorrect.'}
                </p>
                {index + 1 < questions.length ? (
                  <button onClick={next} className="bg-green-500 text-white px-4 py-2 rounded">Next</button>
                ) : (
                  <p className="font-bold">Quiz Finished! Your score: {score}/{questions.length}</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
