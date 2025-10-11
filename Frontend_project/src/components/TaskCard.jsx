export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onApprove,
  onClose,
  onReopen,
  isManager,
  currentUser,
}) {
  if (!task) return null;

  return (
    <div className="card task-card" style={{ marginBottom: 12 }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 6px 0" }}>{task.title}</h4>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            {task.description}
          </div>
          <div className="task-meta" style={{ marginTop: 8 }}>
            Start: {task.startDate ? task.startDate.slice(0, 10) : "—"} • Due:{" "}
            {task.dueDate ? task.dueDate.slice(0, 10) : "—"}
          </div>
        </div>

        <div style={{ width: 120, textAlign: "right" }}>
          <div style={{ fontWeight: 700, color: "var(--accent)" }}>
            {task.priority}
          </div>
          <div
            style={{
              fontSize: 12,
              color: task.status === "Closed" ? "#6b6b6b" : "var(--fg)",
            }}
          >
            {task.status}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <div style={{ color: "var(--muted)" }}>
          Assignee: {task.assignee || "(unassigned)"}
          {task.createdBy ? ` • Created by ${task.createdBy}` : ""}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {isManager && task.status === "Pending Approval" && (
            <button
              className="btn"
              onClick={() => onApprove && onApprove(task.id)}
            >
              Approve
            </button>
          )}

          {isManager && task.status === "Closed" && (
            <button
              className="btn"
              onClick={() => onReopen && onReopen(task.id)}
            >
              Reopen
            </button>
          )}

          {!isManager &&
            task.status !== "Closed" &&
            currentUser === task.assignee && (
              <button
                className="btn"
                onClick={() => onClose && onClose(task.id)}
              >
                Close
              </button>
            )}

          <button className="btn" onClick={() => onEdit && onEdit(task)}>
            Edit
          </button>
          <button className="btn" onClick={() => onDelete && onDelete(task.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
