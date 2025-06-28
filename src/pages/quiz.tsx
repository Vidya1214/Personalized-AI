import { useState } from 'react';

const questions = [
  {
    question: "What gas do plants absorb during photosynthesis?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    answer: "Carbon Dioxide"
  },
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: "Paris"
  }
];

export default function QuizPage() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-green-50">
      <h1 className="text-3xl font-bold mb-4 text-green-700">Quick Quiz</h1>
      <div className="bg-white shadow rounded p-6 max-w-xl w-full text-left">
        <h2 className="text-lg font-semibold mb-2">{questions[index].question}</h2>
        <div className="space-y-2 mb-4">
          {questions[index].options.map(opt => (
            <button
              key={opt}
              onClick={() => setSelected(opt)}
              className={`block w-full text-left px-4 py-2 rounded border transition ${
                selected === opt ? 'bg-green-100 border-green-500' : 'bg-gray-50'
              }`}
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
    </main>
  );
}
