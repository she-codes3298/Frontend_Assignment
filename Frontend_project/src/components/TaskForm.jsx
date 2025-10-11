import { useState } from "react";

export default function TaskForm({
  initial = {},
  onSave,
  onCancel,
  users = [],
}) {
  const [form, setForm] = useState({
    title: initial.title || "",
    description: initial.description || "",
    priority: initial.priority || "Medium",
    status: initial.status || "Open",
    assignee: initial.assignee || "",
    startDate: initial.startDate ? initial.startDate.slice(0, 10) : "",
    dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : "",
    prerequisites: initial.prerequisites || "",
    milestones: initial.milestones || "",
    techstack: initial.techstack || "",
  });

  function change(field, value) {
    setForm((s) => ({ ...s, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    onSave({ ...form });
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>{initial.id ? "Edit Task" : "New Task"}</h3>
      <div className="field">
        <label>Title</label>
        <input
          value={form.title}
          onChange={(e) => change("title", e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => change("description", e.target.value)}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label>Priority</label>
          <select
            value={form.priority}
            onChange={(e) => change("priority", e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => change("status", e.target.value)}
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Pending Approval</option>
            <option>Closed</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <div style={{ flex: 1 }}>
          <label>Assignee</label>
          <select
            value={form.assignee}
            onChange={(e) => change("assignee", e.target.value)}
          >
            <option value="">(none)</option>
            {users.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Start</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => change("startDate", e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Due</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => change("dueDate", e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label>Prerequisites</label>
        <input
          value={form.prerequisites}
          onChange={(e) => change("prerequisites", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Milestones</label>
        <input
          value={form.milestones}
          onChange={(e) => change("milestones", e.target.value)}
        />
      </div>
      <div className="field">
        <label>Techstack</label>
        <input
          value={form.techstack}
          onChange={(e) => change("techstack", e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn primary" type="submit">
          Save
        </button>
      </div>
    </form>
  );
}
