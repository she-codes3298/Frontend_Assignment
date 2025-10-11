import { useEffect, useMemo, useState } from "react";
import { loadTasks, saveTasks, createTask, seedIfEmpty } from "../lib/tasks";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DeveloperDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    seedIfEmpty();
    setTasks(loadTasks());
  }, []);

  useEffect(() => saveTasks(tasks), [tasks]);

  function handleCreate(data) {
    const t = createTask({ ...data, assignee: data.assignee || user.username });
    setTasks((s) => [t, ...s]);
    setCreating(false);
  }

  function handleUpdate(data) {
    setTasks((s) =>
      s.map((t) =>
        t.id === editing.id
          ? { ...t, ...data, updatedAt: new Date().toISOString() }
          : t
      )
    );
    setEditing(null);
  }

  function handleDelete(id) {
    setTasks((s) => s.filter((t) => t.id !== id));
  }

  function myTasks() {
    return tasks.filter(
      (t) =>
        t.assignee === user.username ||
        t.createdBy === user.username ||
        t.assignee === null
    );
  }

  const chartData = useMemo(() => {
    const map = {};
    const all = tasks.filter(
      (t) =>
        t.assignee === user.username ||
        t.createdBy === user.username ||
        t.assignee === null
    );
    all.forEach((t) => {
      const d = t.startDate
        ? t.startDate.slice(0, 10)
        : t.createdAt.slice(0, 10);
      map[d] = (map[d] || 0) + (t.status === "Closed" ? 0 : 1);
    });
    return Object.keys(map)
      .sort()
      .map((k) => ({ date: k, active: map[k] }));
  }, [tasks, user]);

  const users = Array.from(
    new Set(
      tasks
        .map((t) => t.assignee)
        .filter(Boolean)
        .concat(user.username)
    )
  );

  return (
    <div className="container">
      <header className="app-header">
        <div>
          <h2>Welcome, {user.username}</h2>
          <div className="role">Developer</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setCreating(true)}>
            New Task
          </button>
          <button className="btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main>
        <div
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}
        >
          <section>
            <h3>Your Tasks</h3>
            {creating && (
              <TaskForm
                users={users}
                onCancel={() => setCreating(false)}
                onSave={handleCreate}
              />
            )}
            {editing && (
              <TaskForm
                initial={editing}
                users={users}
                onCancel={() => setEditing(null)}
                onSave={handleUpdate}
              />
            )}
            {myTasks().map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onEdit={(task) => setEditing(task)}
                onDelete={handleDelete}
                isManager={false}
              />
            ))}
          </section>

          <aside>
            <h3>Activity</h3>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
