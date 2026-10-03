import { Braces, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout.jsx";
import CodeBlock from "../../components/common/CodeBlock.jsx";
import ThemeToggle from "../../components/common/ThemeToggle.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  API_REFERENCE_GROUPS,
  formatApiBaseUrl,
  formatJson,
} from "../../utils/formatters.js";

const apiBaseUrl = formatApiBaseUrl(import.meta.env.VITE_API_URL || "/api/v1");

function requestExample(endpoint) {
  if (endpoint.request) return formatJson(endpoint.request);
  if (endpoint.method === "GET" || endpoint.method === "DELETE") {
    return "// No request body";
  }
  return "{}";
}

function responseExample(endpoint) {
  return formatJson(
    endpoint.response ?? {
      success: true,
      message: "Request completed",
      data: null,
    },
  );
}

function ReferenceContent() {
  return (
    <main className="workspace-content api-reference-page">
      <div className="page-heading">
        <div>
          <div className="section-eyebrow">INTEGRATION GUIDE</div>
          <h1>API Reference</h1>
          <p>
            Endpoints, authentication boundaries, and example payloads for the
            deployed API.
          </p>
        </div>
      </div>

      <section className="api-base-panel" aria-label="API base URL">
        <span>BASE URL</span>
        <code>{apiBaseUrl}</code>
      </section>

      <nav className="api-section-nav" aria-label="API reference sections">
        {API_REFERENCE_GROUPS.map((group) => (
          <a key={group.id} href={`#${group.id}`}>
            {group.title}
          </a>
        ))}
      </nav>

      <div className="api-groups">
        {API_REFERENCE_GROUPS.map((group) => (
          <section
            className="api-group"
            id={group.id}
            key={group.id}
            aria-labelledby={`${group.id}-title`}
          >
            <div className="api-group-heading">
              <div>
                <div className="section-eyebrow">ENDPOINTS</div>
                <h2 id={`${group.id}-title`}>{group.title}</h2>
              </div>
              <span>{group.auth}</span>
            </div>
            <div className="endpoint-list">
              {group.endpoints.map((endpoint) => (
                <details
                  className="endpoint-item"
                  key={`${endpoint.method}-${endpoint.path}`}
                >
                  <summary>
                    <span
                      className={`method-badge method-${endpoint.method.toLowerCase()}`}
                    >
                      {endpoint.method}
                    </span>
                    <code>{endpoint.path}</code>
                    <span className="endpoint-summary">{endpoint.summary}</span>
                  </summary>
                  <div className="endpoint-detail">
                    <div className="endpoint-auth">
                      <span>AUTHENTICATION</span>
                      <strong>{endpoint.auth ?? group.auth}</strong>
                    </div>
                    <div className="endpoint-code-grid">
                      <CodeBlock
                        code={requestExample(endpoint)}
                        label="Request"
                      />
                      <CodeBlock
                        code={responseExample(endpoint)}
                        label="Response"
                      />
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function PublicReferenceLayout({ children }) {
  return (
    <div className="public-api-shell">
      <header className="home-header">
        <div className="home-header-inner">
          <Link className="home-brand" to="/">
            <span className="home-brand-mark">
              <Layers3 size={18} />
            </span>
            <span>Feature Flag API</span>
          </Link>
          <nav className="public-api-nav" aria-label="Documentation navigation">
            <ThemeToggle variant="home" />
            <Link to="/">Homepage</Link>
            <Link className="home-button home-button-secondary" to="/login">
              Sign In
            </Link>
            <Link className="home-button home-button-primary" to="/register">
              Get Started
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="public-api-footer">
        <div className="home-container">
          <Braces size={16} /> API documentation · Community Edition
        </div>
      </footer>
    </div>
  );
}

export default function ApiReference() {
  const { user } = useAuth();
  const content = <ReferenceContent />;
  return user ? (
    <AppLayout>{content}</AppLayout>
  ) : (
    <PublicReferenceLayout>{content}</PublicReferenceLayout>
  );
}
