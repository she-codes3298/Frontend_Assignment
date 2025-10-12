import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";

const TASKS_COLLECTION = "tasks";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// Load all tasks from Firestore
export async function loadTasks() {
  try {
    const tasksRef = collection(db, TASKS_COLLECTION);
    const q = query(tasksRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      firestoreId: doc.id // Store Firestore document ID
    }));
  } catch (error) {
    console.error("Error loading tasks:", error);
    return [];
  }
}

// Save a new task to Firestore
export async function saveTask(task) {
  try {
    const tasksRef = collection(db, TASKS_COLLECTION);
    const docRef = await addDoc(tasksRef, task);
    return { ...task, firestoreId: docRef.id };
  } catch (error) {
    console.error("Error saving task:", error);
    throw error;
  }
}

// Batch save multiple tasks (for seeding)
export async function saveTasks(tasks) {
  try {
    const promises = tasks.map(task => saveTask(task));
    await Promise.all(promises);
  } catch (error) {
    console.error("Error saving tasks:", error);
    throw error;
  }
}

// Update an existing task in Firestore
export async function updateTask(firestoreId, updates) {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, firestoreId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

// Delete a task from Firestore
export async function deleteTask(firestoreId) {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, firestoreId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

// Subscribe to real-time updates
export function subscribeToTasks(callback) {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const q = query(tasksRef, orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      ...doc.data(),
      firestoreId: doc.id
    }));
    callback(tasks);
  }, (error) => {
    console.error("Error in tasks subscription:", error);
  });
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
    manuallyAssigned: overrides.manuallyAssigned || false,
    assignedAt: overrides.assignedAt || null,
  };
}

// Seed initial tasks if database is empty
export async function seedIfEmpty() {
  try {
    const tasks = await loadTasks();
    if (tasks.length > 0) return;
    
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
    
    await saveTasks([t1, t2]);
  } catch (error) {
    console.error("Error seeding tasks:", error);
  }
}