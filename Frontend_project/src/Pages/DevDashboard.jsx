export default function DevDashboard({ user, onLogout }) {
  return (
    <div className="container">
      <header className="app-header">
        <h2>Welcome, {user.username}</h2>
        <div className="role">Developer</div>
        <button className="btn" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main>
        <h3>Your Tasks</h3>
        <p>
          This view will show tasks assigned to you. For now it's a placeholder.
        </p>
      </main>
    </div>
  );
}