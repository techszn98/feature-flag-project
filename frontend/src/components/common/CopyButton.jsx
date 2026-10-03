import { useState } from "react";
import { Check, Copy } from "lucide-react";
import Button from "./Button.jsx";

export default function CopyButton({ value, label = "Copy to clipboard" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      className="copy-button"
      type="button"
      title={copied ? "Copied" : label}
      aria-label={copied ? "Copied to clipboard" : label}
      onClick={handleCopy}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}
