import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl" />

      <div className="relative text-center max-w-lg">
        <h1 className="text-7xl font-bold bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent leading-tight">
          Taskr
        </h1>
        <p className="text-zinc-400 mt-5 text-lg leading-relaxed">
          A minimal to-do list app built with Next.js
        </p>
        <div className="flex gap-4 justify-center mt-10">
          <Link
            href="/register"
            className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-violet-600/25"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 text-zinc-300 font-medium rounded-xl transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <a
          href="http://github.com/jordanxion/taskr"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 text-sm font-medium rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          View Source
        </a>
      </div>
    </div>
  );
}
