import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-white">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center text-center p-6">
        <h1 className="text-5xl font-extrabold text-blue-700 mb-4 drop-shadow-lg">EduMate</h1>
        <p className="text-lg text-gray-700 mb-6 max-w-xl mx-auto">Your AI-powered learning assistant – get simple summaries and personalized quizzes for real topics.</p>
        <div className="space-x-4 mb-8">
          <Link href="/summary" className="px-8 py-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition text-lg font-semibold">Get AI Summary</Link>
          <Link href="/quiz" className="px-8 py-4 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition text-lg font-semibold">Take a Quiz</Link>
        </div>
        <div className="mt-8 max-w-2xl mx-auto bg-white/80 rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-blue-800 mb-2">Why EduMate?</h2>
          <ul className="text-left text-gray-700 space-y-2">
            <li>• Instantly get easy-to-understand summaries for any topic.</li>
            <li>• Practice with personalized quizzes to reinforce your learning.</li>
            <li>• Clean, distraction-free interface for focused study.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
