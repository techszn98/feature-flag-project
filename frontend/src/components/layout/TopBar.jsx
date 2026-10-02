import { LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import Button from "../common/Button.jsx";

export default function TopBar() {
  const { user, signOut } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-context">
        <span>CLIENT / PROJECT OWNER</span>
        <strong>Self-hosted API workspace</strong>
      </div>
      <div className="topbar-actions">
        <span className="session-indicator">
          <i /> Management session active
        </span>
        <span className="topbar-email">{user?.email}</span>
        <Button
          className="icon-button"
          type="button"
          aria-label="Sign out"
          title="Sign out"
          onClick={signOut}
        >
          <LogOut size={17} />
        </Button>
      </div>
    </header>
  );
}
