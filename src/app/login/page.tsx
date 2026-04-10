"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/lib/actions";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Signing in..." : "Sign In"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, null);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Taskr
            </h1>
          </Link>
          <p className="text-zinc-400 mt-2">Welcome back</p>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
          {state?.error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <SubmitButton />
          </form>

          <p className="text-center text-zinc-400 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
