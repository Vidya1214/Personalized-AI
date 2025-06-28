import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-blue-900 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-extrabold tracking-tight hover:text-blue-200 transition">
          EduMate
        </Link>
        <nav className="space-x-6">
          <Link href="/summary" className="hover:text-blue-300 transition">Summary</Link>
          <Link href="/quiz" className="hover:text-blue-300 transition">Quiz</Link>
        </nav>
      </div>
    </header>
  );
}
