import {
  Activity,
  Braces,
  Fingerprint,
  Flag,
  KeyRound,
  LayoutDashboard,
} from "lucide-react";

const sections = [
  { label: "Workspace overview", icon: LayoutDashboard, href: "#overview" },
  { label: "Feature flags", icon: Flag, href: "#feature-flags" },
  { label: "Environment access", icon: KeyRound, href: "#environment-access" },
  { label: "Evaluation", icon: Activity, href: "#evaluation" },
  { label: "Identity traits", icon: Fingerprint, href: "#identity-traits" },
  { label: "API reference", icon: Braces, href: "#api-reference" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <a className="brand" href="/dashboard" aria-label="Feature Flag API home">
        <span className="brand-mark">F</span>
        <span>Feature Flag API</span>
      </a>
      <nav className="side-nav" aria-label="Workspace navigation">
        {sections.map(({ label, icon: Icon, href }, index) => (
          <a
            className={`side-link${index === 0 ? " active" : ""}`}
            href={href}
            key={label}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
      <div className="credential-note">
        <span className="note-kicker">CREDENTIAL BOUNDARY</span>
        <p>
          Management uses a Bearer JWT. Runtime evaluation uses an Environment
          Key.
        </p>
      </div>
      <div className="sidebar-foot">SELF-HOSTED · API V1</div>
    </aside>
  );
}
