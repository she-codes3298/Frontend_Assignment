# 🐞 Bug Tracker Application

A **responsive and user-friendly bug tracking system** built using **React (Vite)** and **Tailwind CSS**.  
This application allows managers and developers to **create, assign, track, and manage tasks efficiently**, helping teams streamline their workflow and stay productive.

---

## 🚀 Live Demo

🔗 **Deployed on Vercel:** [Bug Tracker App](https://frontend-assignment-seven-gamma.vercel.app/)

---

## 🧠 Overview

The **Bug Tracker App** provides two separate dashboards — one for **Managers** and one for **Developers**.  
Each user can log in, assign or receive tasks, update progress, and track activity visually through an interactive dashboard and graph.

---

## ✨ Key Features

### 👩‍💼 Manager Dashboard
- Login using pre-defined credentials  
- Assign tasks with fields like:
  - Task Title  
  - Description  
  - Priority  
  - Start Date & Due Date  
- **Date validation** ensures:
  - Start Date cannot be before the current date  
  - Start Date cannot exceed the Due Date  
- Approve or reject task closure requests  
- Receive a **warning notification** when a task is pending approval  
- Apply filters such as:
  - All  
  - Open  
  - In Progress  
  - Pending Approval  

### 👩‍💻 Developer Dashboard
- Login using pre-defined credentials  
- View and manage tasks assigned by the Manager  
- Create new tasks with additional fields:
  - Prerequisites  
  - Tech Stack  
  - Milestones  
- Request task closure and send it for approval  
- See **real-time updates** reflected on both dashboards  

### 📊 Activity Graph
- Displays the **number of activities performed each day**  
- Helps visualize productivity and project progress  

---

## 💡 Highlights

- Fully **responsive** design (works on all screen sizes)  
- **Local Storage** integration for persistent data between sessions  
- Clean and **professional color theme**  
- Smooth and **interactive user experience**  
- **Real-time-like updates** between dashboards  

> ⚠️ Note: The current version stores data in **LocalStorage**, which is ideal for demonstration.  
> For production, this can be upgraded to use a backend (e.g., Firebase, MongoDB + Express, or Supabase).

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)  
- **Styling:** Tailwind CSS  
- **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`)  
- **Data Storage:** LocalStorage  
- **Deployment:** Vercel  

---

## ⚙️ Installation & Setup

To run the app locally:

```bash
# 1️⃣ Clone this repository
git clone https://github.com/your-username/bug-tracker-app.git

# 2️⃣ Navigate into the project directory
cd bug-tracker-app

# 3️⃣ Install dependencies
npm install

# 4️⃣ Start the development server
npm run dev
