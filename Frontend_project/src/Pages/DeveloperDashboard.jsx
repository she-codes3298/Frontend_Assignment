import { useEffect, useMemo, useState, useRef } from "react";
import { subscribeToTasks, createTask, saveTask, updateTask, deleteTask } from "../lib/tasks";
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
  const [showNotification, setShowNotification] = useState(false);
  const [newTaskDetails, setNewTaskDetails] = useState(null);
  const [dateError, setDateError] = useState("");
  const [loading, setLoading] = useState(true);
  const previousTaskCount = useRef(0);

  // Subscribe to real-time task updates
  useEffect(() => {
    const unsubscribe = subscribeToTasks((updatedTasks) => {
      const myNewTasks = updatedTasks.filter((t) => t.assignee === user.username);
      const currentCount = myNewTasks.length;
      
      // Check if a new task was manually assigned
      if (!loading && currentCount > previousTaskCount.current) {
        const sortedTasks = myNewTasks.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const latestTask = sortedTasks[0];
        
        if (latestTask && latestTask.manuallyAssigned && latestTask.createdBy !== user.username) {
          setNewTaskDetails(latestTask);
          setShowNotification(true);
        }
      }
      
      previousTaskCount.current = currentCount;
      setTasks(updatedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.username, loading]);

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

  async function handleCreate(data) {
    const error = validateDates(data.startDate, data.dueDate);
    if (error) {
      setDateError(error);
      return;
    }
    
    try {
      const t = createTask({
        ...data,
        assignee: data.assignee || user.username,
        createdBy: user.username,
      });
      await saveTask(t);
      setCreating(false);
      setDateError("");
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task. Please try again.");
    }
  }

  async function handleUpdate(data) {
    const error = validateDates(data.startDate, data.dueDate);
    if (error) {
      setDateError(error);
      return;
    }
    
    try {
      if (!editing.firestoreId) {
        console.error("No firestoreId found for task");
        return;
      }
      
      await updateTask(editing.firestoreId, data);
      setEditing(null);
      setDateError("");
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    }
  }

  async function handleDelete(firestoreId) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    
    try {
      await deleteTask(firestoreId);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    }
  }

  async function handleClose(firestoreId) {
    try {
      await updateTask(firestoreId, {
        status: "Pending Approval",
        pendingApproval: true,
      });
    } catch (error) {
      console.error("Error closing task:", error);
      alert("Failed to close task. Please try again.");
    }
  }

  async function handleLogTime(firestoreId, { seconds, note }) {
    try {
      const task = tasks.find(t => t.firestoreId === firestoreId);
      if (!task) return;

      const logs = (task.timeLogs || []).concat([
        { by: user.username, seconds, note, at: new Date().toISOString() },
      ]);
      const total = (task.timeSpentSeconds || 0) + seconds;

      await updateTask(firestoreId, {
        timeLogs: logs,
        timeSpentSeconds: total,
      });
    } catch (error) {
      console.error("Error logging time:", error);
      alert("Failed to log time. Please try again.");
    }
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

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

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

      {showNotification && newTaskDetails && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2000,
          padding: "20px",
          overflowY: "auto",
        }}>
          <div className="card" style={{
            width: "90%",
            maxWidth: "500px",
            padding: "24px",
            textAlign: "center",
            border: "3px solid var(--accent)",
            margin: "auto",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
            <h2 style={{ marginBottom: "16px", color: "var(--accent)" }}>
              New Task Assigned!
            </h2>
            <div style={{ textAlign: "left", marginBottom: "20px" }}>
              <h3 style={{ marginBottom: "12px" }}>{newTaskDetails.title}</h3>
              <p style={{ color: "var(--muted)", marginBottom: "12px" }}>
                {newTaskDetails.description}
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <strong>Priority:</strong> {newTaskDetails.priority}
                </div>
                <div>
                  <strong>Start:</strong> {newTaskDetails.startDate?.slice(0, 10)}
                </div>
                <div>
                  <strong>Due:</strong> {newTaskDetails.dueDate?.slice(0, 10)}
                </div>
              </div>
              <div style={{ marginTop: "12px" }}>
                <strong>Assigned by:</strong> {newTaskDetails.createdBy}
              </div>
            </div>
            <button
              className="btn primary"
              onClick={() => {
                setShowNotification(false);
                setNewTaskDetails(null);
              }}
              style={{ width: "100%", padding: "12px" }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {overdueTasks.length > 0 && (
        <div className="alert alert-error">
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <span style={{color:"red"}}>
            You have {overdueTasks.length} overdue task
            {overdueTasks.length > 1 ? "s" : ""}! Please review and update{" "}
            {overdueTasks.length > 1 ? "them" : "it"} immediately.
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
                gap: 12,
                marginBottom:4,
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
              <>
                <TaskForm
                  users={users}
                  onCancel={() => {
                    setCreating(false);
                    setDateError("");
                  }}
                  onSave={handleCreate}
                />
                {dateError && (
                  <div style={{
                    backgroundColor: "#ff4444",
                    color: "white",
                    padding: "8px 12px",
                    marginTop: "8px",
                    marginBottom: "8px",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}>
                    ⚠️ {dateError}
                  </div>
                )}
              </>
            )}
            {editing && (
              <>
                <TaskForm
                  initial={editing}
                  users={users}
                  onCancel={() => {
                    setEditing(null);
                    setDateError("");
                  }}
                  onSave={handleUpdate}
                />
                {dateError && (
                  <div style={{
                    backgroundColor: "#ff4444",
                    color: "white",
                    padding: "8px 12px",
                    marginTop: "8px",
                    marginBottom: "8px",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}>
                    ⚠️ {dateError}
                  </div>
                )}
              </>
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
                  key={t.firestoreId}
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