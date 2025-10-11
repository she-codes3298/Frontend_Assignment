export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onApprove,
  isManager,
}) {
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h4 style={{ margin: "0 0 6px 0" }}>{task.title}</h4>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            {task.description}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
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
          gap: 8,
          marginTop: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          Assignee: {task.assignee || "(unassigned)"}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isManager && task.status === "Pending Approval" && (
            <button className="btn" onClick={() => onApprove(task.id)}>
              Approve
            </button>
          )}
          <button className="btn" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button className="btn" onClick={() => onDelete(task.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
