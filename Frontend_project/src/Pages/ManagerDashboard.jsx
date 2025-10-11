import { useEffect, useMemo, useState } from "react";
import { loadTasks, saveTasks, seedIfEmpty } from "../lib/tasks";
import TaskCard from "../components/TaskCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ManagerDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    seedIfEmpty();
    setTasks(loadTasks());
  }, []);

  useEffect(() => saveTasks(tasks), [tasks]);

  function handleDelete(id) {
    setTasks((s) => s.filter((t) => t.id !== id));
  }

  function handleApprove(id) {
    setTasks((s) =>
      s.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "Closed",
              pendingApproval: false,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  }

  function handleReopen(id) {
    setTasks(s => s.map(t => t.id === id ? { ...t, status: 'Open', updatedAt: new Date().toISOString() } : t))
  }

  const chartData = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const d = t.startDate
        ? t.startDate.slice(0, 10)
        : t.createdAt.slice(0, 10);
      map[d] = (map[d] || 0) + (t.status === "Closed" ? 0 : 1);
    });
    return Object.keys(map)
      .sort()
      .map((k) => ({ date: k, active: map[k] }));
  }, [tasks]);

  return (
    <div className="container">
      <header className="app-header">
        <div>
          <h2>Welcome, {user.username}</h2>
          <div className="role">Manager</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
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
            <h3>All Tasks</h3>
            {tasks.map((t) => (
              <TaskCard key={t.id} task={t} onEdit={() => {}} onDelete={handleDelete} onApprove={handleApprove} onReopen={handleReopen} isManager={true} currentUser={user.username} />
            ))}
          </section>

          <aside>
            <h3>Active Tasks</h3>
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
