import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme.js";

export default function ThemeToggle({ variant = "default" }) {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      className={`theme-toggle theme-toggle-${variant}`}
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${nextTheme} mode`}
      onClick={toggleTheme}
    >
      <Icon size={17} aria-hidden="true" />
      <span className="theme-toggle-label">
        {theme === "dark" ? "Light" : "Dark"}
      </span>
    </button>
  );
}
