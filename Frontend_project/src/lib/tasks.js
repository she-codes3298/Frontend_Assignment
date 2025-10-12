const STORAGE_KEY = "bugapp_tasks_v1";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function createTask(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title: overrides.title || "New task",
    description: overrides.description || "",
    priority: overrides.priority || "Medium",
    status: overrides.status || "Open",
    assignee: overrides.assignee || null,
    createdBy: overrides.createdBy || null,
    // time tracking
    timeSpentSeconds: overrides.timeSpentSeconds || 0,
    timeLogs: overrides.timeLogs || [], // { by, seconds, note, at }
    startDate: overrides.startDate || now,
    dueDate: overrides.dueDate || null,
    prerequisites: overrides.prerequisites || "",
    milestones: overrides.milestones || "",
    techstack: overrides.techstack || "",
    createdAt: now,
    updatedAt: now,
    pendingApproval: overrides.pendingApproval || false,
  };
}

export function updateTask(tasks, id, patch) {
  return tasks.map((t) =>
    t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
  );
}

export function seedIfEmpty() {
  const tasks = loadTasks();
  if (tasks.length) return;
  const t1 = createTask({
    title: "Fix login redirect",
    description: "Redirect to dashboard after auth",
    priority: "High",
    assignee: "Rupali",
    startDate: new Date().toISOString(),
    status: "Open",
  });
  const t2 = createTask({
    title: "Add analytics",
    description: "Trend chart for active tasks",
    priority: "Medium",
    assignee: "Rupali",
    startDate: new Date().toISOString(),
    status: "Open",
  });
  saveTasks([t1, t2]);
}
