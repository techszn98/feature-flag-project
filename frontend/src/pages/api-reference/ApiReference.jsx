import { useState } from 'react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{ background: '#333', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code }) {
  return (
    <div style={{ position: 'relative', background: '#1e1e1e', color: '#d4d4d4', padding: '16px', borderRadius: '6px', marginTop: '12px', overflow: 'auto' }}>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}><code>{code}</code></pre>
      <div style={{ position: 'absolute', top: 8, right: 8 }}>
        <CopyButton text={code} />
      </div>
    </div>
  );
}

export default function ApiReference() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, Arial, sans-serif', maxWidth: '900px', margin: '0 auto', lineHeight: '1.6' }}>
      <h1 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '8px' }}>API Reference</h1>
      <p style={{ color: '#666', fontSize: '18px', marginBottom: '40px' }}>Complete reference for Feature Flag API. Base URL: <code>/api</code></p>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '13px' }}>GET</span>
          <h2 style={{ margin: 0, fontSize: '20px' }}>/api/flags</h2>
        </div>
        <p style={{ color: '#4b5563' }}>Retrieve all feature flags.</p>
        <CodeBlock code={`curl -X GET http://localhost:5000/api/flags \\\n  -H "Authorization: Bearer YOUR_TOKEN"\n\n// Response 200\n{\n  "flags": [\n    { "id": "1", "name": "new-checkout", "enabled": true }\n  ]\n}`} />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '13px' }}>POST</span>
          <h2 style={{ margin: 0, fontSize: '20px' }}>/api/flags</h2>
        </div>
        <p style={{ color: '#4b5563' }}>Create a new feature flag.</p>
        <CodeBlock code={`fetch('/api/flags', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ name: 'dark-mode', enabled: false })\n})`} />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '13px' }}>DELETE</span>
          <h2 style={{ margin: 0, fontSize: '20px' }}>/api/flags/:id</h2>
        </div>
        <p style={{ color: '#4b5563' }}>Delete a feature flag.</p>
        <CodeBlock code={`fetch('/api/flags/123', { method: 'DELETE' })\n\n// Response 204 - No Content`} />
      </div>
    </div>
  );
}