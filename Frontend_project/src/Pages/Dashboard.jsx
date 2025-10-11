import DevDashboard from "./DevDashboard";
import ManagerDashboard from "./ManagerDashboard";

export default function Dashboard({ user, onLogout }) {
  if (!user) return null;
  if (user.role === "developer")
    return <DevDashboard user={user} onLogout={onLogout} />;
  if (user.role === "manager")
    return <ManagerDashboard user={user} onLogout={onLogout} />;
  return <div>Unknown role</div>;
}