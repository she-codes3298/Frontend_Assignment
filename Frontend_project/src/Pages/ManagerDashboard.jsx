import { useEffect, useMemo, useState } from "react";
import { loadTasks, saveTasks, seedIfEmpty, createTask } from "../lib/tasks";
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
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    assignee: "",
    priority: "Medium",
  });
  const [dateError, setDateError] = useState("");

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

  function validateDates(startDate, dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate) {
      const start = new Date(startDate);
      if (start < today) {
        return "Start date cannot be in the past";
      }
    }
    
    if (dueDate) {
      const due = new Date(dueDate);
      if (due < today) {
        return "Due date cannot be in the past";
      }
    }
    
    if (startDate && dueDate) {
      const start = new Date(startDate);
      const due = new Date(dueDate);
      if (due < start) {
        return "Due date cannot be before start date";
      }
    }
    
    return "";
  }

  function handleFormChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate dates when they change
    if (field === "startDate" || field === "dueDate") {
      const newData = { ...formData, [field]: value };
      const error = validateDates(newData.startDate, newData.dueDate);
      setDateError(error);
    }
  }

  function handleAssignTask(e) {
    e.preventDefault();
    
    // Final validation
    const error = validateDates(formData.startDate, formData.dueDate);
    if (error) {
      setDateError(error);
      return;
    }
    
    if (!formData.title.trim()) {
      alert("Please enter a task title");
      return;
    }
    
    if (!formData.assignee) {
      alert("Please select an assignee");
      return;
    }

    const newTask = createTask({
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate || new Date().toISOString(),
      dueDate: formData.dueDate || null,
      assignee: formData.assignee,
      createdBy: user.username,
      priority: formData.priority,
      status: "Open",
    });

    setTasks(prev => [newTask, ...prev]);
    
    // Reset form
    setFormData({
      title: "",
      description: "",
      startDate: "",
      dueDate: "",
      assignee: "",
      priority: "Medium",
    });
    setDateError("");
    setShowAssignForm(false);
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

  // Get unique users from tasks
  const users = Array.from(
    new Set(
      tasks
        .map((t) => t.assignee)
        .filter(Boolean)
    )
  ).concat(["Rupali"]).filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="container">
      <header className="app-header">
        <div>
          <h2>Welcome, {user.username}</h2>
          <div className="role">Manager</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setShowAssignForm(true)}>
             New Assignment
          </button>
          <button className="btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Task Assignment Form Modal */}
      {showAssignForm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <div className="card" style={{
            width: "90%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflow: "auto",
          }}>
            <h3>Assign New Task</h3>
            <div>
              <div className="field">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  placeholder="Enter task title"
                />
              </div>

              <div className="field">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder="Enter task description"
                  rows="4"
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleFormChange("priority", e.target.value)}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Assign To *</label>
                  <select
                    value={formData.assignee}
                    onChange={(e) => handleFormChange("assignee", e.target.value)}
                  >
                    <option value="">Select Developer</option>
                    {users.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <div style={{ flex: 1 }}>
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange("startDate", e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleFormChange("dueDate", e.target.value)}
                  />
                </div>
              </div>

              {dateError && (
                <div style={{
                  backgroundColor: "#ff4444",
                  color: "white",
                  padding: "8px 12px",
                  marginTop: "12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}>
                  ⚠️ {dateError}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setShowAssignForm(false);
                    setFormData({
                      title: "",
                      description: "",
                      startDate: "",
                      dueDate: "",
                      assignee: "",
                      priority: "Medium",
                    });
                    setDateError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn primary"
                  disabled={!!dateError}
                  onClick={handleAssignTask}
                >
                  Assign Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Approval Alert - Outside main */}
      {pendingApprovalTasks.length > 0 && (
        <div className="alert alert-warning">
          <span style={{ fontSize: "20px" }}>🔔</span>
          <span style={{color:"orange"}}>
            {pendingApprovalTasks.length} task
            {pendingApprovalTasks.length > 1 ? "s" : ""} waiting for your
            approval!
          </span>
        </div>
      )}

      {/* Overdue Tasks Alert - Outside main */}
      {overdueTasks.length > 0 && (
        <div className="alert alert-error">
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <span style={{color:"red"}}>
            {overdueTasks.length} overdue task
            {overdueTasks.length > 1 ? "s" : ""} need attention!
          </span>
        </div>
      )}

      <main>
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
          </aside>
        </div>
      </main>
    </div>
  );
}