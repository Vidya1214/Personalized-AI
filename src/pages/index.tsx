import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-white text-center p-6">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-4">EduMate</h1>
      <p className="text-lg text-gray-700 mb-6 max-w-md">Your AI-powered learning assistant – get simple summaries and personalized quizzes for real topics.</p>
      <div className="space-x-4">
        <Link href="/summary" className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition">Get AI Summary</Link>
        <Link href="/quiz" className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition">Take a Quiz</Link>
      </div>
    </main>
  );
}
