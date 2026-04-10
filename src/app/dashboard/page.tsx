"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  listId: string | null;
  createdAt: string;
};

type TaskList = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  email: string;
};

// --------------- Countdown ---------------

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Countdown({ dueDate }: { dueDate: string }) {
  const due = new Date(dueDate).getTime();
  const diffMs = due - Date.now();
  const intervalMs =
    diffMs > 7 * 24 * 3600 * 1000 ? 60_000
    : diffMs > 3 * 24 * 3600 * 1000 ? 60_000
    : 1_000;

  const now = useNow(intervalMs);
  const diff = Math.abs(Math.floor((due - now) / 1000));
  const overdue = due < now;
  const secsUntilDue = Math.floor((due - now) / 1000);

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  let label: string;
  if (overdue) {
    if (days > 0) label = `${days}d ${hours}h overdue`;
    else if (hours > 0) label = `${hours}h ${minutes}m overdue`;
    else label = `${minutes}m ${seconds}s overdue`;
  } else if (secsUntilDue > 7 * 24 * 3600) {
    label = `${days}d`;
  } else if (secsUntilDue > 3 * 24 * 3600) {
    label = `${days}d ${hours}h`;
  } else {
    label = `${hours}h ${minutes}m ${seconds}s`;
  }

  return (
    <span
      className={`text-xs font-mono tabular-nums px-2 py-0.5 rounded-md shrink-0 ${
        overdue
          ? "text-red-400 bg-red-500/10 border border-red-500/20"
          : "text-zinc-400 bg-zinc-800/80 border border-zinc-700/50"
      }`}
    >
      {label}
    </span>
  );
}

// --------------- Shared ---------------

const inputClass =
  "w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all";

function ListSelect({
  lists,
  value,
  onChange,
}: {
  lists: TaskList[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all text-sm appearance-none"
      >
        {lists.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function ModalShell({ onBackdrop, children }: { onBackdrop: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onBackdrop} />
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

// --------------- Add Task Modal ---------------

function AddTaskModal({
  lists,
  defaultListId,
  onAdd,
  onCancel,
}: {
  lists: TaskList[];
  defaultListId: string;
  onAdd: (title: string, dueDate: string | null, listId: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [listId, setListId] = useState(defaultListId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), dueDate || null, listId);
  }

  return (
    <ModalShell onBackdrop={onCancel}>
      <h2 className="text-lg font-semibold text-zinc-100 mb-5">Add Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" required autoFocus className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Due Date</label>
          <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">List</label>
          <ListSelect lists={lists} value={listId} onChange={setListId} />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all">Add</button>
        </div>
      </form>
    </ModalShell>
  );
}

// --------------- Edit Task Modal ---------------

function EditTaskModal({
  task,
  lists,
  onSave,
  onDeleteRequest,
  onCancel,
}: {
  task: Task;
  lists: TaskList[];
  onSave: (id: string, title: string, dueDate: string | null, listId: string | null) => void;
  onDeleteRequest: (task: Task) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ""
  );
  const [listId, setListId] = useState(task.listId ?? lists[0]?.id ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(task.id, title.trim(), dueDate || null, listId || null);
  }

  return (
    <ModalShell onBackdrop={onCancel}>
      <h2 className="text-lg font-semibold text-zinc-100 mb-5">Edit Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Due Date</label>
          <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">List</label>
          <ListSelect lists={lists} value={listId} onChange={setListId} />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => onDeleteRequest(task)} className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-medium rounded-xl transition-all">Delete</button>
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all">Save</button>
        </div>
      </form>
    </ModalShell>
  );
}

// --------------- Confirm Delete Task Modal ---------------

function ConfirmDeleteTaskModal({
  task,
  onConfirm,
  onCancel,
}: {
  task: Task;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ModalShell onBackdrop={onCancel}>
      <h2 className="text-lg font-semibold text-zinc-100 mb-2">Delete Task</h2>
      <p className="text-zinc-400 text-sm mb-6">
        Are you sure you want to delete{" "}
        <span className="text-zinc-200 font-medium">&ldquo;{task.title}&rdquo;</span>?
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-all">Delete</button>
      </div>
    </ModalShell>
  );
}

// --------------- Edit List Modal ---------------

function EditListModal({
  list,
  isDefault,
  onSave,
  onDeleteRequest,
  onCancel,
}: {
  list: TaskList;
  isDefault: boolean;
  onSave: (id: string, name: string) => void;
  onDeleteRequest: (list: TaskList) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(list.name);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(list.id, name.trim());
  }

  return (
    <ModalShell onBackdrop={onCancel}>
      <h2 className="text-lg font-semibold text-zinc-100 mb-5">Edit List</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus className={inputClass} />
        </div>

        {/* Delete section */}
        <div className={`rounded-xl border p-4 ${isDefault ? "border-zinc-800 opacity-50" : "border-red-500/20 bg-red-500/5"}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={`text-sm font-medium ${isDefault ? "text-zinc-500" : "text-red-400"}`}>Delete List</p>
              {isDefault && (
                <p className="text-xs text-zinc-600 mt-0.5">The default list cannot be deleted</p>
              )}
            </div>
            <button
              type="button"
              disabled={isDefault}
              onClick={() => onDeleteRequest(list)}
              className="px-3 py-1.5 text-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500/10 disabled:hover:border-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all">Cancel</button>
          <button type="submit" className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all">Save</button>
        </div>
      </form>
    </ModalShell>
  );
}

// --------------- Delete List Modal ---------------

function DeleteListModal({
  list,
  otherLists,
  defaultListId,
  onConfirm,
  onCancel,
}: {
  list: TaskList;
  otherLists: TaskList[];
  defaultListId: string;
  onConfirm: (moveToListId: string | null) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"move" | "delete">("move");
  const [moveToListId, setMoveToListId] = useState(defaultListId);

  return (
    <ModalShell onBackdrop={onCancel}>
      <h2 className="text-lg font-semibold text-zinc-100 mb-2">Delete List</h2>
      <p className="text-zinc-400 text-sm mb-5">
        Are you sure you want to delete{" "}
        <span className="text-zinc-200 font-medium">&ldquo;{list.name}&rdquo;</span>?
      </p>

      <div className="space-y-2 mb-5">
        <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-all">
          <input
            type="radio"
            name="deleteMode"
            checked={mode === "move"}
            onChange={() => setMode("move")}
            className="mt-0.5 accent-violet-500"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-200">Move tasks to another list</p>
            {mode === "move" && otherLists.length > 0 && (
              <div className="mt-2">
                <ListSelect lists={otherLists} value={moveToListId} onChange={setMoveToListId} />
              </div>
            )}
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-all">
          <input
            type="radio"
            name="deleteMode"
            checked={mode === "delete"}
            onChange={() => setMode("delete")}
            className="mt-0.5 accent-violet-500"
          />
          <div>
            <p className="text-sm font-medium text-zinc-200">Delete all tasks in this list</p>
            <p className="text-xs text-zinc-500 mt-0.5">This cannot be undone</p>
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all">Cancel</button>
        <button
          onClick={() => onConfirm(mode === "move" ? moveToListId : null)}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-all"
        >
          Delete
        </button>
      </div>
    </ModalShell>
  );
}

// --------------- New List Modal ---------------

function NewListModal({ onSave, onCancel }: { onSave: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-zinc-100 mb-5">New List</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="List name" required autoFocus className={inputClass} />
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --------------- Page ---------------

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<Task | null>(null);
  const [editingList, setEditingList] = useState<TaskList | null>(null);
  const [deletingList, setDeletingList] = useState<TaskList | null>(null);
  const [showNewListModal, setShowNewListModal] = useState(false);

  async function fetchData() {
    const res = await fetch("/api/me");
    if (!res.ok) { router.push("/login"); return; }
    const data = await res.json();
    setUser(data.user);
    setTasks(data.todos);
    setLists(data.lists);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleAddTask(title: string, dueDate: string | null, listId: string) {
    setShowAddModal(false);
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dueDate, listId }),
    });
    if (res.ok) { const task = await res.json(); setTasks((prev) => [task, ...prev]); }
  }

  async function handleToggle(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    const res = await fetch("/api/todos", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!res.ok) fetchData();
  }

  async function handleDeleteTask(id: string) {
    setConfirmDeleteTask(null);
    setEditingTask(null);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const res = await fetch("/api/todos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!res.ok) fetchData();
  }

  async function handleSaveEdit(id: string, title: string, dueDate: string | null, listId: string | null) {
    setEditingTask(null);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title, dueDate, listId } : t)));
    const res = await fetch("/api/todos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, title, dueDate, listId }) });
    if (!res.ok) fetchData();
  }

  async function handleSaveList(id: string, name: string) {
    setEditingList(null);
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
    const res = await fetch("/api/lists", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name }) });
    if (!res.ok) fetchData();
  }

  async function handleDeleteList(list: TaskList, moveToListId: string | null) {
    setDeletingList(null);
    setEditingList(null);
    setLists((prev) => prev.filter((l) => l.id !== list.id));
    if (selectedListId === list.id) setSelectedListId(null);
    if (moveToListId) {
      setTasks((prev) => prev.map((t) => t.listId === list.id ? { ...t, listId: moveToListId } : t));
    } else {
      setTasks((prev) => prev.filter((t) => t.listId !== list.id));
    }
    await fetch("/api/lists", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: list.id, moveToListId }) });
  }

  async function handleCreateList(name: string) {
    setShowNewListModal(false);
    const res = await fetch("/api/lists", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (res.ok) {
      const list = await res.json();
      setLists((prev) => [...prev, list]);
      setSelectedListId(list.id);
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const defaultListId = lists[0]?.id ?? "";
  const visibleTasks = selectedListId === null ? tasks : tasks.filter((t) => t.listId === selectedListId);
  const completedCount = visibleTasks.filter((t) => t.completed).length;
  const addModalDefaultList = selectedListId ?? defaultListId;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Taskr</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">Hey, <span className="text-zinc-200">{user?.name}</span></span>
            <button onClick={handleLogout} className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">Sign out</button>
          </div>
        </div>
      </nav>

      {/* Body */}
      <div className="flex-1 flex justify-center gap-6 px-6 py-8 max-w-5xl mx-auto w-full">

        {/* Sidebar */}
        <aside className="w-52 shrink-0">
          <div className="sticky top-24 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 backdrop-blur-xl flex flex-col gap-0.5">
            {/* All Tasks */}
            <button
              onClick={() => setSelectedListId(null)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                selectedListId === null ? "bg-violet-600/20 text-violet-300" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              All Tasks
              <span className="ml-auto text-xs text-zinc-500">{tasks.length}</span>
            </button>

            <div className="my-2 border-t border-zinc-800/60" />

            {/* Lists */}
            {lists.map((list) => (
              <div key={list.id} className="group relative">
                <button
                  onClick={() => setSelectedListId(list.id)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                    selectedListId === list.id ? "bg-violet-600/20 text-violet-300" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="truncate">{list.name}</span>
                  <span className="ml-auto text-xs text-zinc-500 shrink-0">{tasks.filter((t) => t.listId === list.id).length}</span>
                </button>
              </div>
            ))}

            <div className="my-2 border-t border-zinc-800/60" />

            <button
              onClick={() => setShowNewListModal(true)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New List
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-zinc-200">
              {selectedListId === null ? "All Tasks" : lists.find((l) => l.id === selectedListId)?.name ?? "Tasks"}
            </h2>
            <div className="flex items-center gap-2">
              {selectedListId !== null && (
                <button
                  onClick={() => setEditingList(lists.find((l) => l.id === selectedListId) ?? null)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-xl transition-all duration-200"
                >
                  Edit List
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {visibleTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
                  <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" />
                  </svg>
                </div>
                <p className="text-zinc-500 text-lg font-medium">No tasks yet</p>
                <p className="text-zinc-600 text-sm mt-1">Add your first task to get started</p>
              </div>
            ) : (
              visibleTasks.map((task, i) => {
                const listName = lists.find((l) => l.id === task.listId)?.name;
                return (
                  <div key={task.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="group relative flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl transition-all duration-200 hover:border-zinc-700 cursor-pointer" onClick={() => setEditingTask(task)}>
                      {/* Edit overlay */}
                      <div className="absolute inset-0 rounded-xl bg-zinc-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                        <span className="text-sm font-medium text-zinc-200">Edit</span>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggle(task.id); }}
                        className={`relative z-10 flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                          task.completed ? "bg-violet-600 border-violet-600 shadow-sm shadow-violet-600/30" : "border-zinc-600 hover:border-violet-500"
                        }`}
                      >
                        {task.completed && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <span className={`flex-1 transition-all duration-200 ${task.completed ? "text-zinc-500 line-through" : "text-zinc-100"}`}>
                        {task.title}
                      </span>

                      {selectedListId === null && listName && (
                        <span className="text-xs px-2 py-0.5 rounded-md text-zinc-400 bg-zinc-800/80 border border-zinc-700/50 shrink-0">
                          {listName}
                        </span>
                      )}

                      {task.dueDate && !task.completed && <Countdown dueDate={task.dueDate} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {visibleTasks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between text-sm text-zinc-500">
              <span>{completedCount} of {visibleTasks.length} completed</span>
              <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / visibleTasks.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddTaskModal lists={lists} defaultListId={addModalDefaultList} onAdd={handleAddTask} onCancel={() => setShowAddModal(false)} />
      )}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          lists={lists}
          onSave={handleSaveEdit}
          onDeleteRequest={(task) => { setEditingTask(null); setConfirmDeleteTask(task); }}
          onCancel={() => setEditingTask(null)}
        />
      )}
      {confirmDeleteTask && (
        <ConfirmDeleteTaskModal
          task={confirmDeleteTask}
          onConfirm={() => handleDeleteTask(confirmDeleteTask.id)}
          onCancel={() => setConfirmDeleteTask(null)}
        />
      )}
      {editingList && (
        <EditListModal
          list={editingList}
          isDefault={editingList.id === defaultListId}
          onSave={handleSaveList}
          onDeleteRequest={(list) => { setEditingList(null); setDeletingList(list); }}
          onCancel={() => setEditingList(null)}
        />
      )}
      {deletingList && (
        <DeleteListModal
          list={deletingList}
          otherLists={lists.filter((l) => l.id !== deletingList.id)}
          defaultListId={defaultListId}
          onConfirm={(moveToListId) => handleDeleteList(deletingList, moveToListId)}
          onCancel={() => setDeletingList(null)}
        />
      )}
      {showNewListModal && (
        <NewListModal onSave={handleCreateList} onCancel={() => setShowNewListModal(false)} />
      )}
    </div>
  );
}
