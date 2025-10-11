import { useEffect, useState } from "react";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import "./index.css";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("bugapp_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  function handleLogin(u) {
    setUser(u);
    window.history.pushState({}, "", "/dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("bugapp_user");
    setUser(null);
    window.history.pushState({}, "", "/");
  }

  useEffect(() => {
    function onPop() {
      const path = window.location.pathname;
      if (path === "/") return;
      if (path === "/dashboard" && !user)
        window.history.replaceState({}, "", "/");
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [user]);

  const path = window.location.pathname;

  if (!user && path !== "/") {
    window.history.replaceState({}, "", "/");
    return null;
  }

  return (
    <div className={`app-root ${user ? '' : 'auth-center'}`}>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}