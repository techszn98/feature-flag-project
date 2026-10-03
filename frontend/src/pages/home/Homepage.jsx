import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  Code2,
  Fingerprint,
  Flag,
  KeyRound,
  Layers3,
  LockKeyhole,
  Menu,
  RefreshCw,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import ThemeToggle from "../../components/common/ThemeToggle.jsx";

const capabilities = [
  {
    icon: Flag,
    title: "Feature Flags",
    text: "Create, enable, disable, and target releases without changing application code.",
    code: "checkout_redesign   Enabled",
    tone: "blue",
  },
  {
    icon: SlidersHorizontal,
    title: "Environment Control",
    text: "Keep development, staging, and production behavior separate.",
    code: "environmentId   env_prod_...",
    tone: "green",
  },
  {
    icon: Braces,
    title: "Runtime Evaluation",
    text: "Ask the API which flags are active for an identity and its traits.",
    code: "POST /api/v1/evaluate",
    tone: "amber",
  },
  {
    icon: Fingerprint,
    title: "Identity Traits",
    text: "Use identity attributes to make thoughtful, targeted rollout decisions.",
    code: '{ "beta_tester": true }',
    tone: "rose",
  },
  {
    icon: KeyRound,
    title: "Runtime Credentials",
    text: "Use scoped environment keys for application runtime access.",
    code: "X-Environment-Key",
    tone: "green",
  },
  {
    icon: Server,
    title: "Self-Hosted",
    text: "Run the service in your own environment and keep control of your infrastructure.",
    code: "Application  →  API  →  Database",
    tone: "blue",
  },
];

const apiGroups = [
  {
    title: "Authentication",
    routes: ["POST /auth/register", "POST /auth/login", "GET /auth/me"],
  },
  {
    title: "Management",
    routes: ["POST /projects", "POST /flags", "GET /flags", "PUT /flags/:id"],
  },
  {
    title: "Runtime",
    routes: ["POST /evaluate", "PUT /identities/:id/traits"],
  },
];

function Brand() {
  return (
    <Link className="home-brand" to="/" aria-label="Feature Flag API home">
      <span className="home-brand-mark">
        <Layers3 size={19} strokeWidth={2.4} />
      </span>
      <span>Feature Flag API</span>
    </Link>
  );
}

function ProductPreview() {
  return (
    <div
      className="product-preview"
      aria-label="Feature Flag API dashboard preview"
    >
      <div className="preview-window-bar">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="preview-edition">COMMUNITY EDITION</span>
      </div>
      <div className="preview-app">
        <aside className="preview-rail" aria-hidden="true">
          <span className="preview-rail-mark">
            <Layers3 size={15} />
          </span>
          <span>
            <Layers3 size={14} />
          </span>
          <span className="selected">
            <Flag size={14} />
          </span>
          <span>
            <KeyRound size={14} />
          </span>
          <span>
            <Activity size={14} />
          </span>
          <span>
            <Fingerprint size={14} />
          </span>
          <span>
            <Braces size={14} />
          </span>
        </aside>
        <div className="preview-main">
          <div className="preview-title-row">
            <div>
              <strong>Feature Flags</strong>
              <small>Runtime control layer</small>
            </div>
            <span className="preview-create">Create flag</span>
          </div>
          <div className="preview-flags">
            <div className="preview-flag-row">
              <div>
                <code>checkout_redesign</code>
                <small>2 targeting rules</small>
              </div>
              <span className="preview-enabled">
                Enabled <i />
              </span>
            </div>
            <div className="preview-flag-row">
              <div>
                <code>maintenance_banner</code>
                <small>No targeting rules</small>
              </div>
              <span className="preview-disabled">
                Disabled <i />
              </span>
            </div>
          </div>
          <div className="preview-runtime-row">
            <div className="preview-env-box">
              <KeyRound size={14} />
              <div>
                <strong>Production Environment</strong>
                <code>env_prod_••••••••</code>
              </div>
            </div>
            <ArrowRight className="preview-flow-arrow" size={17} />
            <div className="preview-eval-box">
              <Activity size={14} />
              <div>
                <strong>Runtime Evaluation</strong>
                <code>user_123 · checkout_redesign true</code>
              </div>
            </div>
          </div>
          <div className="preview-steps">
            <span>Dashboard</span>
            <i />
            <span>Environment</span>
            <i />
            <span>Runtime evaluation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeWindow({ title, children }) {
  return (
    <div className="home-code-window">
      <div className="home-code-title">
        <span>{title}</span>
        <span className="window-dots">
          <i />
          <i />
        </span>
      </div>
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function StatusSwitch({ enabled = false }) {
  return (
    <span
      className={`dashboard-switch${enabled ? " on" : ""}`}
      aria-label={enabled ? "Enabled" : "Disabled"}
    >
      <i />
    </span>
  );
}

export default function Homepage() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const accountHref = user ? "/dashboard" : "/register";
  const accountLabel = user ? "Open workspace" : "Get Started";
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const sections = document.querySelectorAll(
      ".home-section, .home-final-cta",
    );
    if (!("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("home-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
    );

    sections.forEach((section) => {
      section.classList.add("home-reveal");
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="homepage">
      <header className="home-header">
        <div className="home-header-inner">
          <Brand />
          <div className="home-header-controls">
            <ThemeToggle variant="home" />
            <button
              className="home-menu-button"
              type="button"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          <nav
            className={`home-nav${menuOpen ? " open" : ""}`}
            aria-label="Main navigation"
          >
            <div className="home-nav-links">
              <a href="#product" onClick={closeMenu}>
                Product
              </a>
              <a href="#how-it-works" onClick={closeMenu}>
                How It Works
              </a>
              <Link to="/api-reference" onClick={closeMenu}>
                API Reference
              </Link>
            </div>
            <div className="home-nav-account">
              <ThemeToggle variant="home" />
              {!user && (
                <Link className="home-sign-in" to="/login" onClick={closeMenu}>
                  Sign In
                </Link>
              )}
              <Link
                className="home-button home-button-primary"
                to={accountHref}
                onClick={closeMenu}
              >
                {accountLabel}
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="home-hero" id="product">
          <div className="home-hero-inner">
            <div className="home-hero-copy">
              <span className="home-eyebrow-pill">
                <i /> SELF-HOSTED · COMMUNITY EDITION
              </span>
              <h1>
                Control what ships.
                <br />
                Ship with confidence.
              </h1>
              <p>
                Create feature flags, manage environment access, evaluate
                features at runtime, and update identity traits through a simple
                API.
              </p>
              <div className="home-hero-actions">
                <Link
                  className="home-button home-button-primary"
                  to={accountHref}
                >
                  {accountLabel}
                </Link>
                <Link
                  className="home-button home-button-secondary"
                  to="/api-reference"
                >
                  Explore the API <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="home-assurance">
                <Check size={16} /> Self-hosted · API-first · Developer-focused
              </div>
            </div>
            <ProductPreview />
          </div>
        </section>

        <section className="home-section home-problem">
          <div className="home-container">
            <div className="home-section-intro">
              <span className="home-kicker">THE PROBLEM</span>
              <h2>Ship code without giving every release a green light.</h2>
              <p>
                Feature releases often require code changes, redeployments, and
                unnecessary risk. Feature Flag API gives your application a
                simple control layer for deciding what is enabled at runtime.
              </p>
            </div>
            <div className="problem-grid">
              <article>
                <span className="problem-icon">
                  <RefreshCw size={18} />
                </span>
                <h3>Deploying just to change behavior</h3>
              </article>
              <article>
                <span className="problem-icon">
                  <Code2 size={18} />
                </span>
                <h3>Hard-coded configuration</h3>
              </article>
              <article>
                <span className="problem-icon">
                  <Activity size={18} />
                </span>
                <h3>No simple runtime control</h3>
              </article>
            </div>
            <div className="home-callout">
              <ArrowRight size={19} />
              <strong>Feature Flag API puts that control behind an API.</strong>
            </div>
          </div>
        </section>

        <section className="home-section home-capabilities" id="capabilities">
          <div className="home-container">
            <div className="home-section-intro">
              <span className="home-kicker">CORE CAPABILITIES</span>
              <h2>Everything you need to control features at runtime.</h2>
            </div>
            <div className="capability-grid">
              {capabilities.map(({ icon: Icon, title, text, code, tone }) => (
                <article className="capability-card" key={title}>
                  <span className={`capability-icon ${tone}`}>
                    <Icon size={18} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <code>{code}</code>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-runtime">
          <div className="home-container">
            <span className="home-kicker">RUNTIME EVALUATION</span>
            <h2>Simple API. Clear control.</h2>
            <div className="runtime-code-panel">
              <CodeWindow title="REQUEST">{`POST /api/v1/evaluate\n\nX-Environment-Key: ••••••••••\nContent-Type: application/json\n\n{\n  "identifier": "user_123",\n  "traits": {\n    "beta_tester": true\n  }\n}`}</CodeWindow>
              <CodeWindow title="RESPONSE">{`200 OK\n\n{\n  "success": true,\n  "data": {\n    "flags": {\n      "checkout_redesign": true\n    }\n  }\n}`}</CodeWindow>
            </div>
            <p className="runtime-caption">
              <span />
              Your application asks. The Feature Flag API decides.
              <span />
            </p>
          </div>
        </section>

        <section className="home-section home-process" id="how-it-works">
          <div className="home-container">
            <span className="home-kicker">HOW IT WORKS</span>
            <h2>From flag creation to runtime evaluation.</h2>
            <div className="process-grid">
              {[
                ["01", "Create a flag", "Management API", "POST /flags"],
                [
                  "02",
                  "Generate environment access",
                  "Environment key",
                  "X-Environment-Key",
                ],
                ["03", "Identify the user", "user_123", "beta_tester: true"],
                [
                  "04",
                  "Evaluate",
                  "checkout_redesign · Enabled",
                  "POST /evaluate",
                ],
              ].map(([number, title, detail, code], index) => (
                <article className="process-card" key={number}>
                  <span className="process-number">{number}</span>
                  {index < 3 && (
                    <ArrowRight className="process-arrow" size={16} />
                  )}
                  <div>
                    <h3>{title}</h3>
                    <p>{detail}</p>
                    <code>{code}</code>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-credentials">
          <div className="home-container">
            <span className="home-kicker">CREDENTIAL MODEL</span>
            <h2>
              Two responsibilities.
              <br />
              Two credentials.
            </h2>
            <div className="credential-grid">
              <article className="credential-card">
                <div className="credential-card-top">
                  <span className="credential-icon">
                    <ShieldCheck size={19} />
                  </span>
                  <span className="credential-tag">MANAGEMENT</span>
                </div>
                <h3>Bearer JWT</h3>
                <p>Client authentication</p>
                <ul>
                  <li>
                    <Check size={14} /> Authentication
                  </li>
                  <li>
                    <Check size={14} /> Feature flag management
                  </li>
                  <li>
                    <Check size={14} /> Environment key generation
                  </li>
                </ul>
                <code>Authorization: Bearer ••••••••</code>
              </article>
              <article className="credential-card">
                <div className="credential-card-top">
                  <span className="credential-icon runtime">
                    <KeyRound size={19} />
                  </span>
                  <span className="credential-tag">RUNTIME</span>
                </div>
                <h3>X-Environment-Key</h3>
                <p>Application runtime access</p>
                <ul>
                  <li>
                    <Check size={14} /> Flag evaluation
                  </li>
                  <li>
                    <Check size={14} /> Identity trait updates
                  </li>
                </ul>
                <code>X-Environment-Key: ••••••••</code>
              </article>
            </div>
            <div className="home-callout">
              <LockKeyhole size={17} />
              <strong>
                Management credentials and runtime credentials are intentionally
                separated.
              </strong>
            </div>
          </div>
        </section>

        <section className="home-section home-principles">
          <div className="home-container">
            <span className="home-kicker">DEVELOPER-FIRST</span>
            <h2>Built around the way developers actually work.</h2>
            <div className="principle-grid">
              {[
                [
                  "API-FIRST",
                  "Use clear HTTP endpoints instead of coupling feature decisions to application code.",
                ],
                [
                  "SELF-HOSTED",
                  "Keep the service within your own infrastructure.",
                ],
                [
                  "SIMPLE MODEL",
                  "Flags, environments, identities, and runtime evaluation without unnecessary complexity.",
                ],
                [
                  "OPEN ARCHITECTURE",
                  "Designed to integrate with applications through a straightforward API.",
                ],
              ].map(([title, text]) => (
                <article key={title}>
                  <span>{title}</span>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-preview-section">
          <div className="home-container">
            <div className="home-preview-heading">
              <div>
                <span className="home-kicker">PRODUCT PREVIEW</span>
                <h2>One dashboard. One API. Clear control.</h2>
              </div>
              <Link
                className="home-button home-button-secondary"
                to={accountHref}
              >
                Explore the Dashboard <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="dashboard-preview">
              <div className="dashboard-preview-top">
                <span>
                  <span className="home-brand-mark">
                    <Layers3 size={16} />
                  </span>{" "}
                  Feature Flag API
                </span>
                <code>community / production</code>
              </div>
              <div className="dashboard-preview-grid">
                <article className="dashboard-preview-flags">
                  <div>
                    <span>Feature Flags</span>
                    <Flag size={15} />
                  </div>
                  <div className="dashboard-preview-line">
                    <code>checkout_redesign</code>
                    <StatusSwitch enabled />
                  </div>
                  <div className="dashboard-preview-line">
                    <code>maintenance_banner</code>
                    <StatusSwitch />
                  </div>
                </article>
                <article>
                  <div>
                    <span>Environment Access</span>
                    <KeyRound size={15} />
                  </div>
                  <div className="preview-env-list">
                    <div className="preview-env-item">
                      <i className="production-dot" />
                      <span>
                        <strong>Production</strong>
                        <small>Production · active</small>
                      </span>
                      <ShieldCheck size={13} />
                    </div>
                    <div className="preview-env-item">
                      <i className="development-dot" />
                      <span>
                        <strong>Development</strong>
                        <small>Development · active</small>
                      </span>
                      <KeyRound size={13} />
                    </div>
                    <div className="preview-env-key">
                      <KeyRound size={11} /> Key generated ·•••• 42f1
                    </div>
                  </div>
                </article>
                <article>
                  <div>
                    <span>Evaluation Workbench</span>
                    <Activity size={15} />
                  </div>
                  <div className="preview-evaluation">
                    <div className="preview-input-row">
                      <span>IDENTITY</span>
                      <code>user_123</code>
                    </div>
                    <div className="preview-result-row">
                      <span>
                        <small>checkout_redesign</small>
                        <strong>Flag enabled</strong>
                      </span>
                      <b>
                        <i /> ON
                      </b>
                    </div>
                  </div>
                </article>
                <article>
                  <div>
                    <span>Identity Traits</span>
                    <Fingerprint size={15} />
                  </div>
                  <div className="preview-identity">
                    <div className="preview-identity-name">
                      <Fingerprint size={13} />
                      <code>user_123</code>
                      <span>IDENTIFIED</span>
                    </div>
                    <div className="preview-trait">
                      <code>plan</code>
                      <strong>premium</strong>
                    </div>
                    <div className="preview-trait">
                      <code>beta_tester</code>
                      <strong>true</strong>
                    </div>
                  </div>
                </article>
                <article>
                  <div>
                    <span>API Reference</span>
                    <Braces size={15} />
                  </div>
                  <div className="preview-api-routes">
                    <div>
                      <b className="preview-method get">GET</b>
                      <code>/api/v1/flags</code>
                    </div>
                    <div>
                      <b className="preview-method post">POST</b>
                      <code>/api/v1/evaluate</code>
                    </div>
                    <div>
                      <b className="preview-method put">PUT</b>
                      <code>/api/v1/identities/:id</code>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section home-api" id="api-reference-preview">
          <div className="home-container">
            <div className="home-api-heading">
              <div>
                <span className="home-kicker">API REFERENCE</span>
                <h2>Everything is documented.</h2>
              </div>
              <Link
                className="home-button home-button-primary"
                to="/api-reference"
              >
                View API Reference <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="api-preview-grid">
              {apiGroups.map((group) => (
                <article key={group.title}>
                  <h3>{group.title}</h3>
                  {group.routes.map((route) => (
                    <code key={route}>{route}</code>
                  ))}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-self-hosted">
          <div className="home-container self-hosted-inner">
            <div>
              <span className="home-kicker">SELF-HOSTED COMMUNITY EDITION</span>
              <h2>
                Your infrastructure.
                <br />
                Your feature control.
              </h2>
              <p>
                Run the Community Edition in your own environment and connect
                your applications through the API.
              </p>
            </div>
            <div
              className="architecture-flow"
              aria-label="Application connects through the Feature Flag API to your database and runtime"
            >
              <div>
                <Code2 size={21} />
                <strong>Application</strong>
              </div>
              <ArrowRight size={20} />
              <div className="architecture-api">
                <Flag size={21} />
                <strong>Feature Flag API</strong>
              </div>
              <ArrowRight size={20} />
              <div className="architecture-targets">
                <div>
                  <Server size={18} />
                  <strong>Database</strong>
                </div>
                <div>
                  <Activity size={18} />
                  <strong>Runtime</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-final-cta">
          <div className="home-container">
            <span className="home-kicker">START SHIPPING WITH CONTROL</span>
            <h2>Ready to put feature control behind an API?</h2>
            <p>
              Create your workspace, define your first feature flag, and start
              evaluating features at runtime.
            </p>
            <div>
              <Link className="home-button home-button-light" to={accountHref}>
                {accountLabel}
              </Link>
              <Link className="home-cta-link" to="/api-reference">
                Read the API Reference <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-grid">
            <div className="home-footer-brand">
              <Brand />
              <span>Community Edition</span>
              <p>
                Self-hosted feature management and remote configuration through
                a developer-focused API.
              </p>
              <code>/login · /register · /api-reference</code>
            </div>
            <div>
              <h2>PRODUCT</h2>
              <a href="#capabilities">Feature Flags</a>
              <a href="#capabilities">Environment Access</a>
              <a href="#api-reference-preview">Evaluation</a>
              <a href="#capabilities">Identity Traits</a>
            </div>
            <div>
              <h2>DEVELOPERS</h2>
              <Link to="/api-reference">API Reference</Link>
              <a href="#how-it-works">How it works</a>
            </div>
            <div>
              <h2>ACCOUNT</h2>
              <Link to="/login">Sign In</Link>
              <Link to={accountHref}>{accountLabel}</Link>
            </div>
          </div>
          <div className="home-footer-bottom">
            Feature Flag API — Community Edition
          </div>
        </div>
      </footer>
    </div>
  );
}
