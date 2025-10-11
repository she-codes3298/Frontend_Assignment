export default function ManagerDashboard({ user, onLogout }) {
  return (
    <div className="container">
      <header className="app-header">
        <h2>Welcome, {user.username}</h2>
        <div className="role">Manager</div>
        <button className="btn" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main>
        <h3>All Tasks</h3>
        <p>
          Managers can view and approve all tasks. Placeholder for analytics.
        </p>
      </main>
    </div>
  );
}