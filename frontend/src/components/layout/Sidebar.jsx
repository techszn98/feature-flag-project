import { Link, NavLink } from "react-router-dom";
import {
  Activity,
  Braces,
  Fingerprint,
  Flag,
  KeyRound,
  LayoutDashboard,
} from "lucide-react";

const sections = [
  { label: "Workspace overview", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Feature Flags", icon: Flag, to: "/feature-flags" },
  { label: "Environment access", icon: KeyRound, to: "/environment-access" },
  { label: "Evaluation", icon: Activity, to: "/evaluation" },
  { label: "Identity traits", icon: Fingerprint, to: "/identity-traits" },
  { label: "API reference", icon: Braces, to: "/api-reference" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link
        className="brand"
        to="/dashboard"
        aria-label="Feature Flag API home"
      >
        <span className="brand-mark">F</span>
        <span>Feature Flag API</span>
      </Link>
      <nav className="side-nav" aria-label="Workspace navigation">
        {sections.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `side-link${isActive ? " active" : ""}`
            }
          >
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {/* credential-note and sidebar-foot stay exactly as they are */}
    </aside>
  );
}
