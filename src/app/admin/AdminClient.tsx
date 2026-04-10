"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Stats = { users: number; lists: number; tasks: number; totalTasksCreated: number };

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  signupIp: string | null;
  lastAccessAt: string | null;
  lastAccessIp: string | null;
  _count: { todos: number };
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  list: { name: string } | null;
};

function fmt(date: string | null) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    + " " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function fmtShort(date: string | null) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    + " " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function StatCard({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
      <p className="text-zinc-500 text-sm font-medium">{label}</p>
      <p className="text-4xl font-bold text-zinc-100 mt-2">
        {value?.toLocaleString() ?? "—"}
      </p>
    </div>
  );
}

function UserTasksModal({
  user,
  onClose,
}: {
  user: AdminUser;
  onClose: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin?type=user-tasks&userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => { setTasks(data); setLoading(false); });
  }, [user.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">{user.name}</h2>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No tasks</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                <div className={`mt-0.5 w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center ${task.completed ? "bg-violet-600 border-violet-600" : "border-zinc-600"}`}>
                  {task.completed && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {task.list && (
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">{task.list.name}</span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-zinc-500">Due {fmt(task.dueDate)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminClient({ adminName }: { adminName: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "users">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetch("/api/admin?type=stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoadingStats(false); });
  }, []);

  useEffect(() => {
    if (tab === "users" && users.length === 0) {
      setLoadingUsers(true);
      fetch("/api/admin?type=users")
        .then((r) => r.json())
        .then((data) => { setUsers(data); setLoadingUsers(false); });
    }
  }, [tab]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  const tabs = [
    {
      id: "overview" as const,
      label: "Overview",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      id: "users" as const,
      label: "Users",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Taskr</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-violet-600/20 border border-violet-500/30 text-violet-400">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-medium rounded-lg transition-all">
              User View
            </a>
            <span className="text-sm text-zinc-400">Hey, <span className="text-zinc-200">{adminName}</span></span>
            <button onClick={handleLogout} className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">Sign out</button>
          </div>
        </div>
      </nav>

      {/* Body */}
      <div className="flex-1 flex justify-center gap-6 px-6 py-8 max-w-6xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-52 shrink-0">
          <div className="sticky top-24 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 backdrop-blur-xl flex flex-col gap-0.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                  tab === t.id ? "bg-violet-600/20 text-violet-300" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {tab === "overview" && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-200 mb-6">Overview</h2>
              {loadingStats ? (
                <div className="flex justify-center py-16">
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <StatCard label="Total Users" value={stats?.users} />
                    <StatCard label="Total Lists" value={stats?.lists} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Active Tasks" value={stats?.tasks} />
                    <StatCard label="Lifetime Tasks Created" value={stats?.totalTasksCreated} />
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "users" && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-200 mb-6">Users</h2>
              {loadingUsers ? (
                <div className="flex justify-center py-16">
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm table-fixed">
                    <colgroup>
                      <col className="w-[14%]" />
                      <col className="w-[18%]" />
                      <col className="w-[14%]" />
                      <col className="w-[13%]" />
                      <col className="w-[14%]" />
                      <col className="w-[13%]" />
                      <col className="w-[8%]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                        <th className="px-3 py-3 text-left font-medium">Name</th>
                        <th className="px-3 py-3 text-left font-medium">Email</th>
                        <th className="px-3 py-3 text-left font-medium">Signed Up</th>
                        <th className="px-3 py-3 text-left font-medium">Signup IP</th>
                        <th className="px-3 py-3 text-left font-medium">Last Access</th>
                        <th className="px-3 py-3 text-left font-medium">Last IP</th>
                        <th className="px-3 py-3 text-right font-medium">Tasks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                        >
                          <td className="px-3 py-3 text-zinc-200 font-medium truncate">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="truncate">{user.name}</span>
                              {user.role === "admin" && (
                                <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-violet-600/20 border border-violet-500/30 text-violet-400">admin</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-zinc-400 truncate">{user.email}</td>
                          <td className="px-3 py-3 text-zinc-400 text-xs whitespace-nowrap">{fmtShort(user.createdAt)}</td>
                          <td className="px-3 py-3 text-zinc-500 font-mono text-xs truncate">{user.signupIp ?? "—"}</td>
                          <td className="px-3 py-3 text-zinc-400 text-xs whitespace-nowrap">{fmtShort(user.lastAccessAt)}</td>
                          <td className="px-3 py-3 text-zinc-500 font-mono text-xs truncate">{user.lastAccessIp ?? "—"}</td>
                          <td className="px-3 py-3 text-zinc-400 text-right">{user._count.todos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {selectedUser && (
        <UserTasksModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
