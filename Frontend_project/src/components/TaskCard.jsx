import { useState } from "react";

function fmtSeconds(s) {
  if (!s) return "0m";
  const mins = Math.floor(s / 60);
  const hours = Math.floor(mins / 60);
  const remM = mins % 60;
  if (hours) return `${hours}h ${remM}m`;
  return `${remM}m`;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onApprove,
  onClose,
  onReopen,
  onLogTime,
  isManager,
  currentUser,
}) {
  const [logSeconds, setLogSeconds] = useState(0);
  const [note, setNote] = useState("");

  if (!task) return null;

  const total = task.timeSpentSeconds || 0;

  // Check if task is overdue
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "Closed";

  // Check if current user can edit/delete this task
  const canModify = !isManager && (currentUser === task.assignee || currentUser === task.createdBy);
  
  // Check if current user can close this task
  const canClose = !isManager && 
                   currentUser === task.assignee && 
                   task.status !== "Closed" && 
                   task.status !== "Pending Approval";

  function submitLog(e) {
    e.preventDefault();
    let mins = Number(logSeconds) || 0;
    if (mins <= 0) return;
    const secs = Math.floor(mins * 60);
    onLogTime && onLogTime(task.firestoreId, { seconds: secs, note: note || "" });
    setLogSeconds(0);
    setNote("");
  }

  return (
    <div
      className="card task-card dark-olive"
      style={{
        marginBottom: 12,
        border: isOverdue ? "2px solid #ff4444" : undefined,
        boxShadow: isOverdue ? "0 0 10px rgba(255, 68, 68, 0.3)" : undefined,
      }}
    >
      {isOverdue && (
        <div
          style={{
            backgroundColor: "#ff4444",
            color: "white",
            padding: "6px 12px",
            marginBottom: "8px",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: "bold",
          }}
        >
          ⚠️ OVERDUE - Due date: {task.dueDate.slice(0, 10)}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 8px 0" }}>{task.title}</h4>

          <div className="muted small" style={{ marginBottom: "8px" }}>
            {task.description}
          </div>

          <div className="task-meta" style={{ marginBottom: "8px" }}>
            Start: {task.startDate ? task.startDate.slice(0, 10) : "—"} • Due:{" "}
            {task.dueDate ? task.dueDate.slice(0, 10) : "—"}
          </div>

          <div className="muted" style={{ marginBottom: "8px" }}>
            Assignee: {task.assignee || "(unassigned)"}
            {task.createdBy ? ` • Created by ${task.createdBy}` : ""}
          </div>

          <div className="muted" style={{ marginBottom: "12px" }}>
            Total time: <strong>{fmtSeconds(total)}</strong>
          </div>

          {!isManager && currentUser === task.assignee && task.status !== "Closed" && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                className="small-input"
                type="number"
                min="1"
                placeholder="minutes"
                value={logSeconds}
                onChange={(e) => setLogSeconds(e.target.value)}
                style={{ width: "100px" }}
              />
              <button className="btn" onClick={submitLog} type="button">
                Log Time
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            width: "220px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div>
            <div
              className="priority"
              style={{
                fontWeight: "bold",
                marginBottom: "4px",
                color: "var(--accent)",
              }}
            >
              {task.priority}
            </div>
            <div className="status" style={{ fontSize: "14px" }}>
              {task.status}
            </div>
          </div>

          {!isManager && currentUser === task.assignee && task.status !== "Closed" && (
            <div>
              <input
                className="small-input"
                placeholder="note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "auto",
            }}
          >
            {/* Developer View Buttons */}
            {!isManager && canModify && (
              <>
                {/* Close button - only for open/in-progress tasks assigned to current user */}
                {canClose && (
                  <button
                    className="btn"
                    onClick={() => onClose && onClose(task.firestoreId)}
                    style={{ width: "100%" }}
                  >
                    Close
                  </button>
                )}
                
                {/* Edit button - always available for tasks user can modify */}
                <button
                  className="btn"
                  onClick={() => onEdit && onEdit(task)}
                  style={{ width: "100%" }}
                >
                  Edit
                </button>
                
                {/* Delete button - always available for tasks user can modify */}
                <button
                  className="btn"
                  onClick={() => onDelete && onDelete(task.firestoreId)}
                  style={{ width: "100%" }}
                >
                  Delete
                </button>
              </>
            )}

            {/* Manager View Buttons */}
            {isManager && task.status === "Pending Approval" && (
              <>
                <button
                  className="btn"
                  onClick={() => onApprove && onApprove(task.firestoreId)}
                  style={{ width: "100%" }}
                >
                  Approve
                </button>
                <button
                  className="btn"
                  onClick={() => onReopen && onReopen(task.firestoreId)}
                  style={{ width: "100%" }}
                >
                  Reopen
                </button>
              </>
            )}

            {isManager && task.status === "Closed" && (
              <button
                className="btn"
                onClick={() => onReopen && onReopen(task.firestoreId)}
                style={{ width: "100%" }}
              >
                Reopen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}