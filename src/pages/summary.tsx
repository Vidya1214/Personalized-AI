import { useState } from 'react';

export default function SummaryPage() {
  const [topic, setTopic] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    setSummary(data.result);
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <h1 className="text-3xl font-bold mb-4 text-blue-800">AI Topic Summary</h1>
      <input
        type="text"
        placeholder="Enter a topic (e.g., Climate Change)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="border p-3 w-full max-w-md rounded mb-4"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Generating...' : 'Generate Summary'}
      </button>
      {summary && (
        <div className="mt-6 bg-gray-100 p-4 rounded w-full max-w-2xl text-left shadow">
          <h2 className="text-xl font-semibold text-blue-700 mb-2">Summary:</h2>
          <p className="text-gray-800 whitespace-pre-line">{summary}</p>
        </div>
      )}
    </main>
  );
}
