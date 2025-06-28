export default function Footer() {
  return (
    <footer className="w-full bg-blue-900 text-white py-4 mt-10 shadow-inner">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <span className="text-sm">© {new Date().getFullYear()} EduMate. All rights reserved.</span>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition">GitHub</a>
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
