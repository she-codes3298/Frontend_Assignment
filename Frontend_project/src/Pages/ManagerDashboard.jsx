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
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    seedIfEmpty();
    setTasks(loadTasks());
  }, []);

  // keep in sync across tabs/windows
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "bugapp_tasks_v1") {
        setTasks(loadTasks());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => saveTasks(tasks), [tasks]);

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
    setTasks((s) =>
      s.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "Open",
              pendingApproval: false,
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

  // Calculate pending approval tasks
  const pendingApprovalTasks = useMemo(() => {
    return tasks.filter((t) => t.status === "Pending Approval");
  }, [tasks]);

  // Calculate overdue tasks
  const overdueTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "Closed"
    );
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
        {/* Pending Approval Alert */}
        {pendingApprovalTasks.length > 0 && (
          <div className="alert alert-warning">
            <span style={{ fontSize: "20px" }}>🔔</span>
            <span>
              {pendingApprovalTasks.length} task
              {pendingApprovalTasks.length > 1 ? "s" : ""} waiting for your
              approval!
            </span>
          </div>
        )}

        {/* Overdue Tasks Alert */}
        {overdueTasks.length > 0 && (
          <div className="alert alert-error">
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <span>
              {overdueTasks.length} overdue task
              {overdueTasks.length > 1 ? "s" : ""} need attention!
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
              }}
            >
              <h3>All Tasks</h3>
              <div className="filter-bar">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Approval">Pending Approval</option>
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

            {(() => {
              let list = tasks.slice();
              if (statusFilter !== "All")
                list = list.filter((t) => t.status === statusFilter);
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
              return list.length > 0 ? (
                list.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onApprove={handleApprove}
                    onReopen={handleReopen}
                    onLogTime={handleLogTime}
                    isManager={true}
                    currentUser={user.username}
                  />
                ))
              ) : (
                <div
                  className="card"
                  style={{ textAlign: "center", padding: 24 }}
                >
                  <p className="muted">No tasks found</p>
                </div>
              );
            })()}
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

            {/* Time by Developer removed per request */}
          </aside>
        </div>
      </main>
    </div>
  );
}
