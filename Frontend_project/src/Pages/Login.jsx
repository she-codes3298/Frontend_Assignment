import { useState } from "react";

const users = [
  { username: "Rupali", password: "RUPAli@123", role: "developer" },
  { username: "Upasana", password: "Faltyx@123", role: "manager" },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const found = users.find(
      (u) => u.username === username && u.password === password
    );
    if (!found) {
      setError("Invalid credentials");
      return;
    }
    const payload = { username: found.username, role: found.role };
    localStorage.setItem("bugapp_user", JSON.stringify(payload));
    onLogin(payload);
  }

  return (
    <div className="center-page">
      <form className="card login-card" onSubmit={submit}>
        <h1 className="title">Bug/Task Tracker</h1>
        <div className="field">
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="actions">
          <button className="btn primary" type="submit">
            Sign in
          </button>
        </div>
        <div className="hint">
          Developer: Rupali (RUPAli@123) / Manager: Upasana (Faltyx@123)
        </div>
      </form>
    </div>
  );
}
