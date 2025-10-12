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

import "./DeveloperDashboard.css";

export default function DeveloperDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    seedIfEmpty();
    setTasks(loadTasks());
  }, []);

  // keep in sync across tabs/windows: reload tasks when localStorage changes
  useEffect(() => {
    function onStorage(e) {
      if (e.key === null || e.key === undefined) return;
      if (e.key === "bugapp_tasks_v1") {
        setTasks(loadTasks());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => saveTasks(tasks), [tasks]);

  function handleCreate(data) {
    const t = createTask({
      ...data,
      assignee: data.assignee || user.username,
      createdBy: user.username,
    });
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

  function handleClose(id) {
    setTasks((s) =>
      s.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "Pending Approval",
              pendingApproval: true,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  }

  function handleLogTime(id, { seconds, note }) {
    setTasks((s) =>
      s.map((t) => {
        if (t.id !== id) return t;
        const logs = (t.timeLogs || []).concat([
          { by: user.username, seconds, note, at: new Date().toISOString() },
        ]);
        const total = (t.timeSpentSeconds || 0) + seconds;
        return {
          ...t,
          timeLogs: logs,
          timeSpentSeconds: total,
          updatedAt: new Date().toISOString(),
        };
      })
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

  // Calculate overdue tasks for current user
  const overdueTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter(
      (t) =>
        (t.assignee === user.username || t.createdBy === user.username) &&
        t.dueDate &&
        new Date(t.dueDate) < now &&
        t.status !== "Closed"
    );
  }, [tasks, user]);

  return (
    <div className="container dev-dashboard">
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
        {/* Overdue Tasks Alert */}
        {overdueTasks.length > 0 && (
          <div className="alert alert-error">
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <span>
              You have {overdueTasks.length} overdue task
              {overdueTasks.length > 1 ? "s" : ""}! Please review and update{" "}
              {overdueTasks.length > 1 ? "them" : "it"} immediately.
            </span>
          </div>
        )}

        <div className="dashboard-grid">
          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>Your Tasks</h3>
              <div className="filter-bar">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Sort: Date</option>
                  <option value="priority">Sort: Priority</option>
                </select>
              </div>
            </div>
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
            {(() => {
              let list = tasks.filter(
                (t) =>
                  t.assignee === user.username ||
                  t.createdBy === user.username ||
                  t.assignee === null
              );
              if (statusFilter !== "All") {
                if (statusFilter === "Pending")
                  list = list.filter((t) => t.status === "Pending Approval");
                else list = list.filter((t) => t.status === statusFilter);
              }
              if (sortBy === "priority") {
                const order = { High: 0, Medium: 1, Low: 2 };
                list = list.sort(
                  (a, b) => order[a.priority] - order[b.priority]
                );
              } else {
                list = list.sort(
                  (a, b) =>
                    new Date(b.startDate || b.createdAt) -
                    new Date(a.startDate || a.createdAt)
                );
              }
              return list.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={(task) => setEditing(task)}
                  onDelete={handleDelete}
                  onClose={handleClose}
                  onLogTime={handleLogTime}
                  isManager={false}
                  currentUser={user.username}
                />
              ));
            })()}
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
