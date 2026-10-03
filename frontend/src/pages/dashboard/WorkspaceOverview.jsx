import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Braces,
  Fingerprint,
  Flag,
  KeyRound,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../api/client.js";
import AppLayout from "../../components/layout/AppLayout.jsx";
import { Link } from "react-router-dom";

const modules = [
  {
    id: "feature-flags",
    to: "/feature-flags",
    title: "Feature flags",
    description: "Create and manage the flags owned by this client context.",
    endpoint: "GET /api/v1/flags · Bearer JWT",
    icon: Flag,
    tint: "blue",
  },
  {
    id: "environment-access",
    to: "/environment-access",
    title: "Environment access",
    description: "Generate runtime credentials for an existing environment.",
    endpoint: "POST /api/v1/environments/:id/keys",
    icon: KeyRound,
    tint: "green",
  },
  {
    id: "evaluation",
    to: "/evaluation",
    title: "Evaluation workbench",
    description: "Evaluate flags for an identity and optional traits.",
    endpoint: "POST /api/v1/evaluate · X-Environment-Key",
    icon: Activity,
    tint: "amber",
  },
  {
    id: "identity-traits",
    to: "/identity-traits",
    title: "Identity traits",
    description: "Update JSON traits for an identity using a runtime key.",
    endpoint: "PUT /api/v1/identities/:identifier/traits",
    icon: Fingerprint,
    tint: "rose",
  },
];
export default function WorkspaceOverview() {
  const [connection, setConnection] = useState("checking");
  const [apiMessage, setApiMessage] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/health")
      .then((result) => {
        if (active) {
          setConnection("connected");
          setApiMessage(result.message || "API is running");
        }
      })
      .catch(() => {
        if (active) setConnection("offline");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppLayout>
      <main className="workspace-content" id="overview">
        <div className="page-heading">
          <div>
            <div className="section-eyebrow">CLIENT / PROJECT OWNER</div>
            <h1>Workspace Overview</h1>
            <p>
              One place to manage releases, environments, and runtime
              evaluation.
            </p>
          </div>
          <span className={`connection-chip ${connection}`}>
            <i />{" "}
            {connection === "checking"
              ? "Checking API"
              : connection === "connected"
                ? "Management session active"
                : "API unreachable"}
          </span>
        </div>

        <section className="workspace-banner" aria-label="Workspace context">
          <div className="banner-icon">
            <Layers3 size={19} />
          </div>
          <div>
            <strong>Client / Project Owner workspace</strong>
            <p>
              Feature flags and environment keys belong to your authenticated
              client context.
            </p>
          </div>
          <span className="environment-label">
            <span /> Existing environment · Production
          </span>
        </section>

        <div className="module-grid">
          {modules.map(
          ({ id, to, title, description, endpoint, icon: Icon, tint }) => (
            <Link className="module-card" to={to} key={id}>
              <div className={`module-icon ${tint}`}>
                <Icon size={19} strokeWidth={1.8} />
              </div>
              <div className="module-heading">
                <h2>{title}</h2>
                <ArrowUpRight size={16} />
              </div>
              <p>{description}</p>
              <code>{endpoint}</code>
            </Link>
          ),
        )}
        </div>

        <section className="connection-panel" aria-live="polite">
          <div className="connection-panel-heading">
            <div className="panel-heading-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2>Self-hosted API connection</h2>
              <p>
                {connection === "connected"
                  ? `${apiMessage} · ${import.meta.env.VITE_API_URL}`
                  : connection === "offline"
                    ? "The API did not respond. Check the configured base URL and try again."
                    : "Checking the configured API endpoint…"}
              </p>
            </div>
            <span className={`health-label ${connection}`}>
              <i />
              {connection === "connected"
                ? "Healthy"
                : connection === "offline"
                  ? "Offline"
                  : "Checking"}
            </span>
          </div>
          <div className="connection-details">
            <div>
              <span>MANAGEMENT AUTH</span>
              <strong>
                <ShieldCheck size={15} /> Bearer JWT
              </strong>
            </div>
            <div>
              <span>RUNTIME AUTH</span>
              <strong>
                <KeyRound size={15} /> Environment Key
              </strong>
            </div>
            <div>
              <span>API VERSION</span>
              <strong>
                <Braces size={15} /> /api/v1
              </strong>
            </div>
          </div>
        </section>

        <section className="api-reference" id="api-reference">
          <div className="reference-heading">
            <div>
              <div className="section-eyebrow">CONNECTED SURFACE</div>
              <h2>API reference</h2>
            </div>
            <span>AUTHENTICATION · MANAGEMENT · RUNTIME</span>
          </div>
          <div className="reference-strip">
            <code>POST /auth/register</code>
            <code>POST /auth/login</code>
            <code>GET /auth/me</code>
            <code>POST /auth/google</code>
          </div>
        </section>
        <footer className="workspace-footer">
          <span>FEATURE FLAG API</span>
          <span>Runtime credentials stay separate from management access.</span>
        </footer>
      </main>
    </AppLayout>
  );
}
